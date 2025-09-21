import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mailRoutes from './routes/mail';
import trackingRoutes from './routes/tracking';
import sheetsRoutes from './routes/sheets';
import autoSendRoutes from './routes/autoSend';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'AutoMail API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: [
      'Role-based HTML email templates',
      'Email tracking with open analytics',
      'Google Sheets integration',
      'Resume attachment support',
      'Bulk email sending'
    ],
    endpoints: {
      'GET /': 'API status',
      'GET /health': 'Health check',
      'GET /api/mail': 'Mail service endpoints',
      'GET /api/track': 'Email tracking endpoints',
      'GET /api/sheets': 'Google Sheets integration endpoints',
      'POST /api/auto-send/send': 'Auto-send emails from Google Sheets',
      'GET /api/auto-send/check/:sheetId': 'Check pending emails'
    }
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/mail', mailRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/auto-send', autoSendRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AutoMail server is running on port ${PORT}`);
  console.log(`📧 Ready to handle mail automation requests`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📊 Email tracking enabled`);
  console.log(`📋 Google Sheets integration ready`);
});

export default app;
