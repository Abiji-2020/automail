# AutoMail - Personal Email Automation System

## Overview

AutoMail is a personal email automation system that sends job application emails based on data from Google Sheets. It's designed to look like personal emails rather than automated ones, with role-based templates and comprehensive tracking.

## Features

- ✅ Personal-style email templates (no HTML formatting)
- ✅ Google Sheets integration for data management
- ✅ Auto-send functionality based on sheet status
- ✅ Email tracking with open analytics
- ✅ Resume attachment support
- ✅ Role-based templates (Backend, Platform, Intern, General)
- ✅ Gmail SMTP integration with app passwords

## Google Sheets Structure

Your Google Sheets should have the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| `email` | Recipient email address | `hr@company.com` |
| `subject` | Email subject/position | `Backend Developer Position` |
| `companyName` | Company name | `TechCorp Inc.` |
| `aboutCompany` | What the company does | `Leading fintech company` |
| `whyInterested` | Why you're interested | `Excited about your AI initiatives` |
| `generalAboutMe` | Brief about yourself | `5+ years backend experience` |
| `whyBestFit` | Why you're the best fit | `Experience with your tech stack` |
| `sendStatus` | Send control | `SENT` (to send), `ALREADY_SENT` (sent) |
| `role` | Template type | `backend`, `platform`, `intern`, `general` |

## Auto-Send Process

1. **Mark for sending**: Set `sendStatus` to `SENT` in your Google Sheet
2. **API call**: Make a POST request to `/api/auto-send/send` with your sheet ID
3. **Processing**: System finds all rows with `sendStatus = "SENT"`
4. **Email generation**: Creates personal emails using appropriate templates
5. **Sending**: Sends emails with resume attachment and tracking
6. **Status update**: Changes `sendStatus` from `SENT` to `ALREADY_SENT`
7. **Tracking**: Records open tracking for analytics

## API Endpoints

### Auto-Send Functionality

#### Send Pending Emails
```bash
POST /api/auto-send/send
Content-Type: application/json

{
  "sheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Processed 3 emails, 3 sent successfully",
  "emailsSent": 3,
  "totalProcessed": 3,
  "results": [
    {
      "email": "hr@company.com",
      "success": true,
      "trackingId": "uuid-tracking-id",
      "messageId": "gmail-message-id"
    }
  ]
}
```

#### Check Pending Emails
```bash
GET /api/auto-send/check/{sheetId}
```

**Response:**
```json
{
  "success": true,
  "pendingCount": 2,
  "pendingEmails": [
    {
      "email": "hr@company1.com",
      "companyName": "Company 1",
      "subject": "Backend Developer"
    }
  ]
}
```

### Email Templates

Templates are plain text style for personal appearance:

#### Backend Developer Template
```
Subject: Application for {{position}} Position

Hi,

I hope this email finds you well. I came across {{companyName}} and was really impressed by {{aboutCompany}}.

{{whyInterested}}

A bit about me: {{generalAboutMe}}

{{whyBestFit}}

I've attached my resume for your consideration. I'd love to discuss how I can contribute to your team.

Best regards,
[Your Name]

[Tracking pixel embedded invisibly]
```

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### 2. Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Update `.env` with your Gmail credentials

### 3. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create Service Account
   - Download JSON key file
5. Share your Google Sheet with the service account email
6. Update `.env` with service account credentials

### 4. Resume Setup

Place your resume file at `assets/resume.pdf` or update the path in `.env`

### 5. Install and Run

```bash
npm install
npm run dev
```

## Usage Workflow

### 1. Prepare Google Sheet

Create a sheet with the required columns and add your job application data:

```
| email          | subject           | companyName | aboutCompany      | whyInterested     | generalAboutMe    | whyBestFit        | sendStatus | role    |
|----------------|-------------------|-------------|-------------------|-------------------|-------------------|-------------------|------------|---------|
| hr@tech.com    | Backend Developer | TechCorp    | AI/ML company     | Love your AI work | 5 years Node.js   | Perfect match     | SENT       | backend |
| jobs@start.io  | Platform Engineer| StartupIO   | Cloud platform    | Scaling interests | DevOps experience | Your tech stack   | SENT       | platform|
```

### 2. Send Emails

Use the API or create a simple script:

```javascript
const response = await fetch('http://localhost:3000/api/auto-send/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    sheetId: 'your-google-sheet-id' 
  })
});

const result = await response.json();
console.log(result);
```

### 3. Monitor Results

- Check email tracking via `/api/track/stats`
- View updated Google Sheet with `ALREADY_SENT` status
- Monitor open rates and engagement

## Email Templates

### Available Templates

1. **Backend Developer** (`backend`)
   - Focus on backend technologies
   - Emphasizes server-side experience

2. **Platform Engineer** (`platform`)
   - Infrastructure and DevOps focus
   - Scalability and reliability emphasis

3. **Intern** (`intern`)
   - Learning-focused tone
   - Enthusiasm for growth

4. **General** (`general`)
   - Versatile software development
   - Broad technical skills

### Customizing Templates

Templates are in `src/templates/` directory:
- `backend.html`
- `platform.html`
- `intern.html`
- `general.html`

Each template uses Handlebars syntax for variable substitution.

## Tracking & Analytics

### Email Open Tracking

- Invisible tracking pixel embedded in emails
- Records first open, last open, and total opens
- Updates Google Sheets with tracking data

### Analytics Endpoints

```bash
GET /api/track/stats
```

Returns overall email statistics and individual tracking data.

## Security Considerations

- Use App Passwords, not regular Gmail passwords
- Keep Google Service Account keys secure
- Don't commit `.env` file to version control
- Use HTTPS in production
- Consider rate limiting for bulk sends

## Troubleshooting

### Common Issues

1. **Gmail Authentication Failed**
   - Verify 2FA is enabled
   - Check App Password is correct
   - Ensure "Less secure app access" is not needed (use App Passwords instead)

2. **Google Sheets Permission Denied**
   - Share sheet with service account email
   - Verify service account has edit permissions
   - Check sheet ID is correct

3. **Templates Not Loading**
   - Verify template files exist in `src/templates/`
   - Check file permissions
   - Ensure proper Handlebars syntax

4. **Tracking Not Working**
   - Verify BASE_URL is accessible
   - Check tracking pixel is embedded
   - Ensure tracking service is running

## Development

### Project Structure

```
src/
├── config/          # Configuration management
├── routes/          # API route handlers
├── services/        # Business logic services
├── templates/       # Email templates
├── types/          # TypeScript type definitions
└── index.ts        # Main server file
```

### Adding New Templates

1. Create new template file in `src/templates/`
2. Update `templateService.ts` configuration
3. Add template variables to types
4. Test with sample data

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details.
