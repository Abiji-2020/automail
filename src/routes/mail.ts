import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { emailService } from '../services/emailService';
import { templateService } from '../services/templateService';
import { trackingService } from '../services/trackingService';
import { googleSheetsService } from '../services/googleSheetsService';
import { SendMailRequest, TemplateVariables } from '../types';
import { config } from '../config';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resume uploads'));
    }
  }
});

// GET /api/mail - Get mail status and available templates
router.get('/', (req: Request, res: Response) => {
  const availableTemplates = templateService.getAvailableTemplates();
  
  res.json({
    message: 'Mail API endpoint',
    status: 'ready',
    availableRoles: availableTemplates.map(t => ({
      role: t.role,
      name: t.name,
      requiredVariables: t.variables.filter(v => !v.includes('tracking'))
    })),
    endpoints: {
      'GET /api/mail': 'Get mail service status and available templates',
      'POST /api/mail/send': 'Send email using role-based template with resume',
      'POST /api/mail/bulk': 'Send bulk emails from sheet data',
      'GET /api/mail/templates': 'Get all available templates',
      'POST /api/mail/preview': 'Preview email template with variables',
      'POST /api/mail/upload-resume': 'Upload resume file',
      'GET /api/mail/test': 'Test email service connection'
    }
  });
});

// GET /api/mail/templates - Get all available templates
router.get('/templates', (req: Request, res: Response) => {
  const templates = templateService.getAvailableTemplates();
  res.json({
    templates: templates.map(t => ({
      id: t.id,
      role: t.role,
      name: t.name,
      requiredVariables: t.variables.filter(v => !v.includes('tracking'))
    }))
  });
});

// POST /api/mail/upload-resume - Upload resume file
router.post('/upload-resume', upload.single('resume'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No resume file uploaded',
        note: 'Please upload a PDF file'
      });
    }

    // Move file to assets directory with a standard name
    const targetPath = path.join('assets', 'resume.pdf');
    fs.renameSync(req.file.path, targetPath);

    res.json({
      message: 'Resume uploaded successfully',
      filename: 'resume.pdf',
      size: req.file.size,
      path: targetPath
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({
      error: 'Failed to upload resume',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/mail/preview - Preview email template
router.post('/preview', (req: Request, res: Response) => {
  try {
    const { role, variables } = req.body;

    if (!role) {
      return res.status(400).json({
        error: 'Role is required',
        availableRoles: templateService.getAvailableTemplates().map(t => t.role)
      });
    }

    // Validate variables
    const validation = templateService.validateVariables(role, variables || {});
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Missing required variables',
        missingVariables: validation.missingVariables,
        requiredVariables: templateService.getTemplate(role)?.variables.filter(v => !v.includes('tracking')) || []
      });
    }

    // Add tracking variables for preview
    const trackingId = trackingService.generateTrackingId();
    const trackingUrl = trackingService.createTrackingUrl(trackingId);
    const fullVariables = {
      ...variables,
      trackingId,
      trackingUrl
    };

    // Render template
    const rendered = templateService.renderTemplate(role, fullVariables);
    if (!rendered) {
      return res.status(404).json({
        error: 'Template not found for role',
        availableRoles: templateService.getAvailableTemplates().map(t => t.role)
      });
    }

    res.json({
      role,
      subject: rendered.subject,
      html: rendered.html,
      variables: fullVariables,
      trackingId
    });
  } catch (error) {
    console.error('Error previewing template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/mail/send - Send email using role-based template
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { role, recipients, variables, customSubject, sheetId }: SendMailRequest = req.body;

    // Validate required fields
    if (!role || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        error: 'Role and recipients array are required',
        example: {
          role: 'backend-developer',
          recipients: ['hr@company.com'],
          variables: {
            recipientName: 'John Doe',
            position: 'Senior Backend Developer',
            companyName: 'Tech Corp',
            experience: '3 years',
            skills: 'Node.js, Python, PostgreSQL, AWS'
          },
          sheetId: 'optional-google-sheet-id'
        }
      });
    }

    // Validate variables
    const validation = templateService.validateVariables(role, variables || {});
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Missing required variables',
        missingVariables: validation.missingVariables,
        requiredVariables: templateService.getTemplate(role)?.variables.filter(v => !v.includes('tracking')) || []
      });
    }

    // Check if resume file exists
    const resumePath = path.resolve(config.resume.defaultPath);
    const hasResume = fs.existsSync(resumePath);

    const results = [];

    for (const recipient of recipients) {
      try {
        // Generate tracking ID for this email
        const trackingId = trackingService.generateTrackingId();
        const trackingUrl = trackingService.createTrackingUrl(trackingId);

        // Add tracking variables
        const fullVariables = {
          ...variables,
          trackingId,
          trackingUrl
        };

        // Render template
        const rendered = templateService.renderTemplate(role, fullVariables);
        if (!rendered) {
          results.push({
            recipient,
            status: 'failed',
            error: 'Template not found'
          });
          continue;
        }

        // Prepare email
        const emailData = {
          to: recipient,
          subject: customSubject || rendered.subject,
          html: rendered.html,
          attachments: hasResume ? [{
            filename: 'resume.pdf',
            path: resumePath,
            contentType: 'application/pdf'
          }] : undefined
        };

        // Send email
        const result = await emailService.sendMail(emailData);

        if (result.success) {
          // Record tracking information
          await trackingService.recordEmailSent(
            trackingId,
            recipient,
            role,
            variables.companyName as string || 'Unknown Company',
            variables.position as string || 'Unknown Position',
            sheetId
          );

          results.push({
            recipient,
            status: 'sent',
            messageId: result.messageId,
            trackingId
          });
        } else {
          results.push({
            recipient,
            status: 'failed',
            error: result.error
          });
        }

        // Add delay between emails
        if (recipients.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        results.push({
          recipient,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.length - successCount;

    res.json({
      message: 'Email sending completed',
      summary: {
        total: results.length,
        successful: successCount,
        failed: failedCount,
        resumeAttached: hasResume
      },
      results
    });

  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/mail/bulk - Send bulk emails from Google Sheets data
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { sheetId, range = 'A:Z', role, commonVariables = {} } = req.body;

    if (!sheetId || !role) {
      return res.status(400).json({
        error: 'Sheet ID and role are required',
        example: {
          sheetId: 'your-google-sheet-id',
          role: 'backend-developer',
          range: 'A:Z',
          commonVariables: {
            recipientName: 'Your Name',
            experience: '3 years',
            skills: 'Node.js, Python, PostgreSQL'
          }
        }
      });
    }

    // Get data from Google Sheets
    const sheetData = await googleSheetsService.getSheetData(sheetId, range);

    if (sheetData.length === 0) {
      return res.status(400).json({
        error: 'No data found in the specified sheet range'
      });
    }

    const results = [];

    for (const row of sheetData) {
      try {
        // Prepare variables for this row
        const variables = {
          ...commonVariables,
          companyName: row.company || row.companyname || '',
          position: row.position || '',
          ...row // Include all row data as potential variables
        };

        // Skip if missing essential data
        if (!row.email || !variables.companyName || !variables.position) {
          results.push({
            row,
            status: 'skipped',
            error: 'Missing email, company, or position data'
          });
          continue;
        }

        // Send email to this recipient
        const sendRequest: SendMailRequest = {
          role,
          recipients: [row.email],
          variables,
          sheetId
        };

        // Use the existing send logic (simplified for bulk)
        const trackingId = trackingService.generateTrackingId();
        const trackingUrl = trackingService.createTrackingUrl(trackingId);
        
        const fullVariables = {
          ...variables,
          trackingId,
          trackingUrl
        };

        const rendered = templateService.renderTemplate(role, fullVariables);
        if (!rendered) {
          results.push({
            row,
            status: 'failed',
            error: 'Template not found'
          });
          continue;
        }

        const resumePath = path.resolve(config.resume.defaultPath);
        const hasResume = fs.existsSync(resumePath);

        const emailData = {
          to: row.email,
          subject: rendered.subject,
          html: rendered.html,
          attachments: hasResume ? [{
            filename: 'resume.pdf',
            path: resumePath,
            contentType: 'application/pdf'
          }] : undefined
        };

        const result = await emailService.sendMail(emailData);

        if (result.success) {
          await trackingService.recordEmailSent(
            trackingId,
            row.email,
            role,
            variables.companyName as string,
            variables.position as string,
            sheetId
          );

          results.push({
            row,
            status: 'sent',
            messageId: result.messageId,
            trackingId
          });
        } else {
          results.push({
            row,
            status: 'failed',
            error: result.error
          });
        }

        // Add delay between emails
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        results.push({
          row,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    res.json({
      message: 'Bulk email sending completed',
      summary: {
        total: results.length,
        successful: successCount,
        failed: failedCount,
        skipped: skippedCount
      },
      results
    });

  } catch (error) {
    console.error('Error sending bulk emails:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/mail/test - Test email configuration
router.get('/test', async (req: Request, res: Response) => {
  try {
    const emailConnected = await emailService.verifyConnection();
    const sheetsConnected = await googleSheetsService.verifyConnection();
    
    res.json({
      emailService: emailConnected ? 'connected' : 'disconnected',
      googleSheets: sheetsConnected ? 'connected' : 'disconnected',
      message: 'Service connection status checked',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to test services',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
