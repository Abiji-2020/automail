# AutoMail

A simple automated backend to send emails from Google Sheets data using Express.js and TypeScript.

## Features

- 🚀 Express.js with TypeScript
- 📧 Email automation from Google Sheets
- 🔒 Secure with Helmet and CORS
- 🛠️ Development-friendly with hot reload
- 📝 Well-structured codebase with types

## Project Structure

```
src/
├── index.ts          # Main application entry point
├── routes/
│   └── mail.ts       # Mail-related API routes
├── types/
│   └── index.ts      # TypeScript type definitions
└── config/
    └── index.ts      # Application configuration
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:Abiji-2020/automail.git
cd automail
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## API Endpoints

- `GET /` - API status and information
- `GET /health` - Health check endpoint
- `GET /api/mail` - Mail service information
- `POST /api/mail/send` - Send email from sheet data
- `GET /api/mail/history` - Get sent mail history

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# Google Sheets Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=your-redirect-uri
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

## License

MIT 
