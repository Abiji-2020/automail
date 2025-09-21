# Google Sheets Structure for AutoMail

## Required Column Headers

Your Google Sheets must have these exact column headers (case-insensitive):

| Column Name | Description | Required | Example |
|-------------|-------------|----------|---------|
| `email` | Recipient email address | Yes | `hr@techcorp.com` |
| `subject` | Email subject/position title | Yes | `Backend Developer Position` |
| `companyName` | Company name | Yes | `TechCorp Inc.` |
| `aboutCompany` | What the company does | Yes | `Leading AI/ML company` |
| `whyInterested` | Why you're interested in them | Yes | `Excited about your ML initiatives` |
| `generalAboutMe` | Brief about yourself | Yes | `5+ years backend experience` |
| `whyBestFit` | Why you're the best fit | Yes | `Perfect match for your tech stack` |
| `sendStatus` | Control sending | Yes | `SENT` or `ALREADY_SENT` |
| `role` | Template type | Optional | `backend`, `platform`, `intern`, `general` |
| `trackingId` | Auto-generated tracking UUID | Auto-filled | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `sentAt` | Email sent timestamp (IST) | Auto-filled | `21/09/2025, 14:30:25` |
| `firstOpenAt` | First email open timestamp (IST) | Auto-filled | `21/09/2025, 15:45:10` |
| `lastOpenAt` | Last email open timestamp (IST) | Auto-filled | `22/09/2025, 09:15:30` |
| `openCount` | Number of times email was opened | Auto-filled | `3` |

## Complete Example Sheet

Here's a realistic example with multiple job applications:

### Sheet: "Job Applications"

| email | subject | companyName | aboutCompany | whyInterested | generalAboutMe | whyBestFit | sendStatus | role | trackingId | sentAt | firstOpenAt | lastOpenAt | openCount |
|-------|---------|-------------|--------------|---------------|----------------|------------|------------|------|------------|--------|-------------|-------------|-----------|
| careers@techcorp.com | Backend Developer Position | TechCorp Inc. | Leading AI/ML company focused on autonomous vehicles | I'm fascinated by your work in computer vision and would love to contribute to making self-driving cars a reality | I'm a backend developer with 5+ years of experience in Python, Node.js, and distributed systems. I've built scalable APIs handling millions of requests daily | My experience with real-time data processing and machine learning pipelines aligns perfectly with your autonomous vehicle platform requirements | SENT | backend | | | | | 0 |
| hr@financeai.io | Senior Platform Engineer | FinanceAI | Innovative fintech startup using AI to revolutionize personal finance | Your approach to democratizing financial advice through AI resonates with my passion for making technology accessible to everyone | I specialize in cloud infrastructure and DevOps with extensive experience in AWS, Kubernetes, and microservices architecture | I've successfully scaled platforms from startup to enterprise level, which matches your current growth phase perfectly | SENT | platform | | | | | 0 |
| tech-hiring@ecommerce.com | Backend Engineer | E-Commerce Plus | Leading e-commerce platform processing millions of transactions daily | I'm impressed by your platform's reliability during peak shopping seasons and want to contribute to that excellence | I have deep expertise in e-commerce systems, payment processing, and high-traffic backend architecture | My experience optimizing checkout flows and payment systems directly addresses your core business needs | ALREADY_SENT | backend | uuid-123-456 | 20/09/2025, 10:30:15 | 20/09/2025, 14:25:30 | 21/09/2025, 09:12:45 | 3 |
| team@airesearch.org | Research Software Engineer | AI Research Lab | Cutting-edge research lab developing next-generation AI algorithms | Your publications on transformer architectures have been incredibly influential in my own research interests | I combine strong software engineering skills with a research background in machine learning and computer vision | My ability to bridge research and production systems would help translate your innovations into real-world applications | SENT | backend | |

## Template Variable Mapping

Here's how the sheet columns map to template variables:

### Backend Template Variables:
- `{{companyName}}` → `companyName` column
- `{{position}}` → `subject` column  
- `{{aboutCompany}}` → `aboutCompany` column
- `{{whyInterested}}` → `whyInterested` column
- `{{generalAboutMe}}` → `generalAboutMe` column
- `{{whyBestFit}}` → `whyBestFit` column
- `{{trackingUrl}}` → Auto-generated tracking URL
- `{{recipientName}}` → Your name (from config/hardcoded)

## Sample Email Output

Using the first row, your email would look like:

```
Subject: Backend Developer Position

Dear Hiring Manager,

I hope this email finds you well. I am writing to express my strong interest in the Backend Developer Position at TechCorp Inc.

Leading AI/ML company focused on autonomous vehicles

I'm fascinated by your work in computer vision and would love to contribute to making self-driving cars a reality

I'm a backend developer with 5+ years of experience in Python, Node.js, and distributed systems. I've built scalable APIs handling millions of requests daily

As a Backend Developer, I specialize in building robust, scalable server-side applications and APIs. I have extensive experience with databases like PostgreSQL, MongoDB, and Redis, along with cloud services including AWS and Docker for containerization.

My experience with real-time data processing and machine learning pipelines aligns perfectly with your autonomous vehicle platform requirements

I have attached my resume for your review and would welcome the opportunity to discuss how my technical expertise can help drive your backend infrastructure forward.

Thank you for your time and consideration.

Best regards,
[Your Name]

[Invisible tracking pixel]
```

## Content Writing Tips

### For `aboutCompany`:
- Keep it concise (1-2 lines)
- Show you researched them
- Examples: 
  - "Leading fintech company revolutionizing digital payments"
  - "Innovative startup building the future of remote work"
  - "Enterprise SaaS platform serving 10M+ users globally"

### For `whyInterested`:
- Be specific about what attracts you
- Mention recent news, products, or achievements
- Examples:
  - "Your recent Series B funding and expansion plans excite me"
  - "I'm passionate about your mission to democratize education"
  - "Your tech blog posts on microservices architecture influenced my own work"

### For `generalAboutMe`:
- Brief professional summary (1-2 sentences)
- Key technologies and years of experience
- Examples:
  - "Full-stack developer with 3+ years experience in React and Node.js"
  - "DevOps engineer specializing in AWS and Kubernetes"
  - "Recent CS graduate with internships at tech startups"

### For `whyBestFit`:
- Connect your skills to their specific needs
- Be confident but not arrogant
- Examples:
  - "My experience scaling APIs to handle millions of requests matches your growth challenges"
  - "My background in healthcare tech aligns perfectly with your patient platform"
  - "My passion for developer tools and your product mission are a perfect match"

## Workflow Example

1. **Research Phase**: Fill out company research
2. **Batch Preparation**: Add 5-10 companies at once
3. **Quality Check**: Review each row for personalization
4. **Send Control**: Set `sendStatus` to `SENT` when ready
5. **API Call**: POST to `/api/auto-send/send` with your sheet ID
6. **Monitor**: Check for `ALREADY_SENT` status and tracking data

## Google Sheets Setup

1. Create a new Google Sheet
2. Add the column headers in the first row
3. Fill in your data starting from row 2
4. Share the sheet with your service account email
5. Copy the sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

Your sheet ID is the long string between `/d/` and `/edit` in the URL.
