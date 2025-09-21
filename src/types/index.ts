// Types for email functionality

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: AttachmentData[];
}

export interface AttachmentData {
  filename: string;
  content?: string | Buffer;
  contentType?: string;
  path?: string;
}

export interface RoleTemplate {
  id: string;
  role: string; // e.g., 'frontend-developer', 'backend-developer', etc.
  name: string;
  subject: string;
  htmlFilePath: string; // Path to the HTML template file
  variables: string[]; // Variables that can be replaced in the template
}

export interface TemplateVariables {
  [key: string]: string | number | undefined;
  // Personal information
  recipientName?: string;
  companyName?: string;
  position?: string;
  experience?: string;
  skills?: string;
  // Content from sheets
  aboutCompany?: string;
  whyInterested?: string;
  generalAboutMe?: string;
  whyBestFit?: string;
  // Tracking
  trackingId?: string;
  trackingUrl?: string;
}

export interface SendMailRequest {
  role: string; // The role to determine which template to use
  recipients: string[];
  variables: TemplateVariables;
  customSubject?: string; // Override template subject if provided
  resumePath?: string; // Path to resume file to attach
  sheetId?: string; // Google Sheet ID for tracking
}

export interface EmailTracking {
  trackingId: string;
  recipient: string;
  role: string;
  companyName: string;
  position: string;
  sentAt: Date;
  firstOpenAt?: Date;
  lastOpenAt?: Date;
  openCount: number;
  status: 'sent' | 'opened' | 'failed';
}

export interface SheetRow {
  email: string;
  subject: string;
  companyname: string;
  aboutcompany: string;
  whyinterested: string;
  generalaboutme: string;
  whybestfit: string;
  sendstatus: string;
  role?: string;
  trackingid?: string;
  sentat?: string;
  firstopenat?: string;
  lastopenat?: string;
  opencount?: string;
  [key: string]: any;
}

export interface GoogleSheetsConfig {
  serviceAccountEmail: string;
  privateKey: string;
  sheetId: string;
  range: string;
}

export interface MailHistory {
  id: string;
  timestamp: Date;
  recipients: string[];
  role: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  variables?: TemplateVariables;
  trackingId?: string;
}
