import { Router, Request, Response } from 'express';
import { googleSheetsService } from '../services/googleSheetsService';
import { emailService } from '../services/emailService';
import { templateService } from '../services/templateService';
import { trackingService } from '../services/trackingService';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * Auto-send emails based on Google Sheets data
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { sheetId } = req.body;

    if (!sheetId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sheet ID is required' 
      });
    }

    // Get pending emails from the sheet
    const pendingEmails = await googleSheetsService.getPendingEmails(sheetId);

    if (pendingEmails.length === 0) {
      return res.json({
        success: true,
        message: 'No pending emails to send',
        emailsSent: 0
      });
    }

    const results = [];
    let successCount = 0;

    for (let i = 0; i < pendingEmails.length; i++) {
      const emailData = pendingEmails[i];
      
      try {
        // Generate tracking ID
        const trackingId = uuidv4();
        const trackingUrl = `${config.tracking.baseUrl}/track/${trackingId}`;

        // Determine role from template or default to 'general'
        const role = emailData.role || 'general';

        // Prepare template variables
        const templateVariables = {
          companyName: emailData.companyname,
          position: emailData.subject, // Using subject as position
          aboutCompany: emailData.aboutcompany,
          whyInterested: emailData.whyinterested,
          generalAboutMe: emailData.generalaboutme,
          whyBestFit: emailData.whybestfit,
          trackingId,
          trackingUrl
        };

        // Generate email content
        const template = templateService.getTemplate(role);
        if (!template) {
          throw new Error(`Template not found for role: ${role}`);
        }

        const renderedTemplate = templateService.renderTemplate(role, templateVariables);
        if (!renderedTemplate) {
          throw new Error(`Failed to render template for role: ${role}`);
        }

        // Send email
        const emailResult = await emailService.sendMail({
          to: emailData.email,
          subject: renderedTemplate.subject,
          html: renderedTemplate.html,
          attachments: [
            {
              filename: 'resume.pdf',
              path: config.resume.defaultPath
            }
          ]
        });

        // Record email sent tracking
        await trackingService.recordEmailSent(
          trackingId,
          emailData.email,
          role,
          emailData.companyname,
          emailData.subject,
          sheetId
        );

        // Update the tracking data in the current row immediately
        await googleSheetsService.updateTrackingInfo(sheetId, trackingId, {
          sentAt: new Date(),
          status: 'sent',
          openCount: 0
        });

        // Update send status in sheet
        await googleSheetsService.updateSendStatus(sheetId, i);

        results.push({
          email: emailData.email,
          success: true,
          trackingId,
          messageId: emailResult.messageId
        });

        successCount++;
        console.log(`✅ Email sent to ${emailData.email} with tracking ID: ${trackingId}`);

      } catch (error) {
        console.error(`❌ Failed to send email to ${emailData.email}:`, error);
        results.push({
          email: emailData.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${pendingEmails.length} emails, ${successCount} sent successfully`,
      emailsSent: successCount,
      totalProcessed: pendingEmails.length,
      results
    });

  } catch (error) {
    console.error('Auto-send error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Check for pending emails without sending
 */
router.get('/check/:sheetId', async (req: Request, res: Response) => {
  try {
    const { sheetId } = req.params;

    const pendingEmails = await googleSheetsService.getPendingEmails(sheetId);

    res.json({
      success: true,
      pendingCount: pendingEmails.length,
      pendingEmails: pendingEmails.map(email => ({
        email: email.email,
        companyName: email.companyname,
        subject: email.subject
      }))
    });

  } catch (error) {
    console.error('Check pending emails error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
