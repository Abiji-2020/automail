# AutoMail v2.0 - Complete Setup & Usage Guide

## 🚀 New Features in v2.0

- **5 Role-Based Templates**: Frontend, Backend, Platform Engineer, Intern, Software Developer, Fullstack
- **Email Tracking**: Track opens with timestamps and counts
- **Google Sheets Integration**: Read data and update tracking info
- **Resume Attachments**: Automatic PDF resume attachment
- **Bulk Email Sending**: Send to multiple recipients from sheets
- **Decoupled Templates**: HTML templates in separate files for easy editing

## 📁 Project Structure

```
src/
├── index.ts                    # Main application
├── config/
│   └── index.ts               # Configuration settings
├── services/
│   ├── emailService.ts        # Gmail SMTP service
│   ├── templateService.ts     # Template management
│   ├── trackingService.ts     # Email tracking
│   └── googleSheetsService.ts # Google Sheets API
├── routes/
│   ├── mail.ts               # Email endpoints
│   ├── tracking.ts           # Tracking endpoints
│   └── sheets.ts             # Sheets endpoints
├── templates/                 # HTML email templates
│   ├── frontend-developer.html
│   ├── backend-developer.html
│   ├── platform-engineer.html
│   ├── intern.html
│   ├── software-developer.html
│   └── fullstack-developer.html
└── types/
    └── index.ts              # TypeScript definitions

assets/
└── resume.pdf                # Your resume file

uploads/                       # Temporary upload directory
```

## ⚙️ Setup Instructions

### 1. Environment Configuration

Update your `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
GMAIL_FROM=your-email@gmail.com

# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Templates Configuration
TEMPLATES_DIR=src/templates

# Tracking Configuration
TRACKING_ENABLED=true

# Resume Configuration
DEFAULT_RESUME_PATH=assets/resume.pdf
```

### 2. Google Sheets API Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Service Account**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Download the JSON key file

4. **Share Your Sheet**:
   - Open your Google Sheet
   - Share it with the service account email
   - Give "Editor" permissions

### 3. Upload Your Resume

```bash
curl -X POST http://localhost:3000/api/mail/upload-resume \
  -F "resume=@/path/to/your/resume.pdf"
```

Or place your resume directly in `assets/resume.pdf`

## 📧 Available Email Templates

### 1. Backend Developer (`backend-developer`)
Perfect for backend engineering positions

### 2. Platform Engineer (`platform-engineer`)  
Focused on infrastructure and DevOps roles

### 3. Intern (`intern`)
Tailored for internship applications

### 4. Software Developer (`software-developer`)
General software development positions

### 5. Frontend Developer (`frontend-developer`)
UI/UX focused frontend roles

### 6. Fullstack Developer (`fullstack-developer`)
Full-stack development positions

## 🛠️ API Endpoints

### Mail Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mail` | Get service status and available templates |
| GET | `/api/mail/templates` | List all available templates |
| POST | `/api/mail/preview` | Preview email with variables |
| POST | `/api/mail/send` | Send emails with tracking |
| POST | `/api/mail/bulk` | Send bulk emails from Google Sheets |
| POST | `/api/mail/upload-resume` | Upload resume file |
| GET | `/api/mail/test` | Test email and sheets connection |

### Tracking Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/track/open/:trackingId` | Track email opens (automatic) |
| GET | `/api/track/stats` | Get tracking statistics |
| GET | `/api/track/:trackingId` | Get specific tracking info |

### Google Sheets Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sheets/:sheetId` | Get data from Google Sheet |
| GET | `/api/sheets/test/connection` | Test Google Sheets connection |

## 📊 Google Sheets Format

Your Google Sheet should have these columns:

| Company | Position | Email | Role | Status | SentAt | FirstOpen | LastOpen | OpenCount | TrackingId |
|---------|----------|-------|------|--------|--------|-----------|----------|-----------|------------|
| Tech Corp | Senior Backend Dev | hr@techcorp.com | backend-developer | | | | | | |
| StartupInc | Platform Engineer | jobs@startup.com | platform-engineer | | | | | | |

**Required Columns**:
- `Company` or `CompanyName`: Company name
- `Position`: Job position
- `Email`: Recipient email address
- `Role`: Template role to use

**Tracking Columns** (auto-populated):
- `Status`: sent/opened/failed
- `SentAt`: Email send timestamp
- `FirstOpen`: First open timestamp
- `LastOpen`: Most recent open timestamp
- `OpenCount`: Number of times opened
- `TrackingId`: Unique tracking identifier

## 🚀 Usage Examples

### 1. Send Single Email

```bash
curl -X POST http://localhost:3000/api/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "role": "backend-developer",
    "recipients": ["hr@techcorp.com"],
    "variables": {
      "recipientName": "Your Name",
      "position": "Senior Backend Developer",
      "companyName": "Tech Corp",
      "experience": "3 years",
      "skills": "Node.js, Python, PostgreSQL, AWS"
    },
    "sheetId": "your-google-sheet-id"
  }'
```

### 2. Bulk Email from Google Sheets

```bash
curl -X POST http://localhost:3000/api/mail/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "sheetId": "your-google-sheet-id",
    "role": "backend-developer",
    "range": "A:Z",
    "commonVariables": {
      "recipientName": "Your Name",
      "experience": "3 years",
      "skills": "Node.js, Python, PostgreSQL, AWS"
    }
  }'
```

### 3. Preview Email Template

```bash
curl -X POST http://localhost:3000/api/mail/preview \
  -H "Content-Type: application/json" \
  -d '{
    "role": "platform-engineer",
    "variables": {
      "recipientName": "Your Name",
      "position": "Platform Engineer",
      "companyName": "CloudCorp",
      "experience": "4 years",
      "skills": "Kubernetes, Docker, Terraform, AWS"
    }
  }'
```

### 4. Get Tracking Statistics

```bash
curl http://localhost:3000/api/track/stats
```

### 5. Get Sheet Data

```bash
curl http://localhost:3000/api/sheets/your-google-sheet-id?range=A:Z
```

## 📈 Email Tracking

Every email includes:
- **Unique tracking ID**: UUID for each email
- **Tracking pixel**: Invisible 1x1 image for open tracking
- **Automatic updates**: Google Sheets updated on opens

### Tracking Data Captured:
- Send timestamp
- First open timestamp
- Last open timestamp
- Total open count
- Email status (sent/opened/failed)

## 🎨 Customizing Templates

Templates are in `src/templates/` as HTML files. You can:

1. **Edit directly**: Modify the HTML files
2. **Use variables**: Include `{{variableName}}` for dynamic content
3. **Add tracking**: Each template includes `{{trackingId}}` and `{{trackingUrl}}`

### Template Variables:
- `{{recipientName}}`: Your name
- `{{companyName}}`: Target company
- `{{position}}`: Job position
- `{{experience}}`: Years of experience
- `{{skills}}`: Your technical skills
- `{{trackingId}}`: Unique tracking ID
- `{{trackingUrl}}`: Tracking pixel URL

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Clean build directory
npm run clean
```

## 📊 Response Examples

### Successful Send Response:
```json
{
  "message": "Email sending completed",
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "resumeAttached": true
  },
  "results": [
    {
      "recipient": "hr@techcorp.com",
      "status": "sent",
      "messageId": "<abc123@gmail.com>",
      "trackingId": "uuid-tracking-id"
    }
  ]
}
```

### Tracking Statistics:
```json
{
  "totalSent": 25,
  "totalOpened": 8,
  "openRate": 32.0,
  "trackingEntries": [...]
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **Gmail Authentication Failed**:
   - Verify 2FA is enabled
   - Check app password is correct (remove spaces)
   - Ensure GMAIL_USER and GMAIL_APP_PASSWORD are set

2. **Google Sheets Access Denied**:
   - Verify service account has access to the sheet
   - Check GOOGLE_PRIVATE_KEY format (includes \n for newlines)
   - Ensure Google Sheets API is enabled

3. **Template Not Found**:
   - Check template files exist in `src/templates/`
   - Verify role name matches template filename
   - Check TEMPLATES_DIR path is correct

4. **Resume Not Attached**:
   - Ensure `assets/resume.pdf` exists
   - Check DEFAULT_RESUME_PATH configuration
   - Verify file permissions

5. **Tracking Not Working**:
   - Check BASE_URL is accessible
   - Verify TRACKING_ENABLED is true
   - Ensure tracking routes are working

## 🎯 Best Practices

1. **Rate Limiting**: Built-in 2-3 second delays between emails
2. **Error Handling**: Comprehensive error responses
3. **Data Validation**: All inputs validated before processing
4. **Security**: CORS, Helmet, and secure file uploads
5. **Monitoring**: Built-in tracking and statistics

Your AutoMail system is now ready for professional email automation with comprehensive tracking and Google Sheets integration! 🎉
