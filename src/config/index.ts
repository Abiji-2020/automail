export const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },
  email: {
    // Gmail SMTP configuration
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER || '', // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD || '', // App password (not regular password)
    },
    from: process.env.GMAIL_FROM || process.env.GMAIL_USER || '', // Default from address
  },
  templates: {
    directory: process.env.TEMPLATES_DIR || 'src/templates',
  },
  googleSheets: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL || '',
  },
  tracking: {
    enabled: process.env.TRACKING_ENABLED !== 'false',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },
  resume: {
    defaultPath: process.env.DEFAULT_RESUME_PATH || 'assets/resume.pdf',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
};
