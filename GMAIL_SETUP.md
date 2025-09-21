# Gmail Setup Guide for AutoMail

This guide will help you set up Gmail with App Passwords to send automated emails using the AutoMail system.

## 📧 Gmail Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Follow the prompts to enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **App passwords**
3. Select **Mail** as the app and **Other** as the device
4. Name it something like "AutoMail Backend"
5. Copy the 16-character password generated (e.g., `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables
Update your `.env` file with your Gmail credentials:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
GMAIL_FROM=your-email@gmail.com
```

**Important Notes:**
- Use the app password (16 characters), NOT your regular Gmail password
- Remove spaces from the app password
- The `GMAIL_FROM` field is what recipients will see as the sender

## 🎯 Available Email Templates

The system comes with 3 built-in role-based templates:

### 1. Frontend Developer (`frontend-developer`)
- **Subject**: Application for {{position}} Position - {{recipientName}}
- **Style**: Blue accent, focuses on UI/UX skills
- **Required Variables**:
  - `recipientName`: Your name
  - `position`: Job position you're applying for
  - `companyName`: Target company name
  - `experience`: Years of experience
  - `skills`: Frontend technologies you know

### 2. Backend Developer (`backend-developer`)
- **Subject**: Application for {{position}} Position - {{recipientName}}
- **Style**: Green accent, focuses on server-side skills
- **Required Variables**: Same as frontend

### 3. Fullstack Developer (`fullstack-developer`)
- **Subject**: Application for {{position}} Position - {{recipientName}}
- **Style**: Purple accent, focuses on both frontend and backend
- **Required Variables**: Same as above

## 🚀 API Usage Examples

### 1. Get Available Templates
```bash
GET http://localhost:3000/api/mail/templates
```

### 2. Preview Email Template
```bash
POST http://localhost:3000/api/mail/preview
Content-Type: application/json

{
  "role": "frontend-developer",
  "variables": {
    "recipientName": "John Doe",
    "position": "Senior Frontend Developer",
    "companyName": "Tech Corp",
    "experience": "3 years",
    "skills": "React, TypeScript, Next.js, Tailwind CSS"
  }
}
```

### 3. Send Email
```bash
POST http://localhost:3000/api/mail/send
Content-Type: application/json

{
  "role": "frontend-developer",
  "recipients": ["hr@techcorp.com", "hiring@example.com"],
  "variables": {
    "recipientName": "John Doe",
    "position": "Senior Frontend Developer",
    "companyName": "Tech Corp",
    "experience": "3 years",
    "skills": "React, TypeScript, Next.js, Tailwind CSS"
  }
}
```

### 4. Send with Custom Subject
```bash
POST http://localhost:3000/api/mail/send
Content-Type: application/json

{
  "role": "backend-developer",
  "recipients": ["jobs@startup.com"],
  "customSubject": "Experienced Backend Developer - John Doe",
  "variables": {
    "recipientName": "John Doe",
    "position": "Backend Engineer",
    "companyName": "Startup Inc",
    "experience": "5 years",
    "skills": "Node.js, Python, PostgreSQL, AWS"
  }
}
```

### 5. Test Email Configuration
```bash
GET http://localhost:3000/api/mail/test
```

## 🔧 Server Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status and overview |
| GET | `/health` | Health check |
| GET | `/api/mail` | Mail service info and available roles |
| GET | `/api/mail/templates` | List all available templates |
| POST | `/api/mail/preview` | Preview email with variables |
| POST | `/api/mail/send` | Send emails using templates |
| GET | `/api/mail/test` | Test email service connection |

## 📝 Template Variables Guide

### Required Variables for All Templates:
- **recipientName**: Your full name (appears in email signature)
- **position**: The job title you're applying for
- **companyName**: Name of the target company
- **experience**: Your years of experience (e.g., "3 years", "5+ years")
- **skills**: Comma-separated list of relevant technologies

### Example Variable Sets:

**Frontend Developer:**
```json
{
  "recipientName": "Jane Smith",
  "position": "Senior React Developer",
  "companyName": "Netflix",
  "experience": "4 years",
  "skills": "React, Redux, TypeScript, Jest, CSS3, HTML5"
}
```

**Backend Developer:**
```json
{
  "recipientName": "Mike Johnson",
  "position": "Senior Backend Engineer",
  "companyName": "Stripe",
  "experience": "6 years",
  "skills": "Node.js, Python, PostgreSQL, Redis, AWS, Docker"
}
```

**Fullstack Developer:**
```json
{
  "recipientName": "Alex Chen",
  "position": "Fullstack Engineer",
  "companyName": "Airbnb",
  "experience": "5 years",
  "skills": "React, Node.js, TypeScript, PostgreSQL, AWS, Docker"
}
```

## 🛡️ Security Features

- **Rate Limiting**: 2-second delay between emails to avoid spam detection
- **App Password**: Uses secure app-specific passwords instead of main password
- **Helmet**: Security headers for the API
- **CORS**: Cross-origin resource sharing protection
- **Input Validation**: All template variables are validated before sending

## 🚨 Troubleshooting

### Email Not Sending?
1. **Check Gmail Setup**: Ensure 2FA is enabled and app password is correct
2. **Test Connection**: Use `GET /api/mail/test` to verify email service
3. **Check Variables**: Ensure all required template variables are provided
4. **Gmail Limits**: Gmail has daily sending limits for personal accounts

### Getting "Authentication Failed"?
- Double-check your app password (remove spaces)
- Ensure you're using the app password, not your regular password
- Verify 2FA is enabled on your Gmail account

### Template Not Found?
- Use `GET /api/mail/templates` to see available roles
- Ensure role name matches exactly (case-sensitive)

## 📊 Response Examples

### Successful Send Response:
```json
{
  "message": "Email sending completed",
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "results": [
    {
      "recipient": "hr@techcorp.com",
      "status": "sent",
      "messageId": "<abc123@gmail.com>"
    }
  ]
}
```

### Validation Error Response:
```json
{
  "error": "Missing required variables",
  "missingVariables": ["recipientName", "companyName"],
  "requiredVariables": ["recipientName", "position", "companyName", "experience", "skills"]
}
```
