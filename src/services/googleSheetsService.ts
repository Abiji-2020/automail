import { google } from 'googleapis';
import { config } from '../config';
import { SheetRow, EmailTracking } from '../types';

class GoogleSheetsService {
  private sheets: any;
  private auth: any;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: config.googleSheets.clientEmail,
          private_key: config.googleSheets.privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    } catch (error) {
      console.error('Error initializing Google Sheets auth:', error);
    }
  }

  /**
   * Get data from a specific sheet range
   */
  async getSheetData(sheetId: string, range: string): Promise<SheetRow[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) {
        return [];
      }

      // Assume first row contains headers
      const headers = rows[0];
      const data = rows.slice(1).map((row: any[]) => {
        const rowData: any = {};
        headers.forEach((header: string, index: number) => {
          rowData[header.toLowerCase().replace(/\s+/g, '')] = row[index] || '';
        });
        return rowData;
      });

      return data;
    } catch (error) {
      console.error('Error getting sheet data:', error);
      throw error;
    }
  }

  /**
   * Convert UTC date to IST format
   */
  private formatToIST(date: Date): string {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  /**
   * Update tracking information in the sheet
   */
  async updateTrackingInfo(
    sheetId: string,
    trackingId: string,
    tracking: Partial<EmailTracking>
  ): Promise<void> {
    try {
      // First, find the row with the matching tracking ID
      const range = 'A:Z'; // Adjust range as needed
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) return;

      const headers = rows[0];
      const trackingIdIndex = headers.findIndex((h: string) => 
        h.toLowerCase().includes('tracking') || h.toLowerCase().includes('id')
      );
      
      if (trackingIdIndex === -1) {
        console.error('Tracking ID column not found in sheet');
        return;
      }

      // Find the row with matching tracking ID
      let targetRowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][trackingIdIndex] === trackingId) {
          targetRowIndex = i;
          break;
        }
      }

      if (targetRowIndex === -1) {
        console.error('Row with tracking ID not found:', trackingId);
        return;
      }

      // Prepare update data based on available columns
      const updateData = [];
      const updateRange = `A${targetRowIndex + 1}:Z${targetRowIndex + 1}`;

      // Copy existing row data
      const existingRow = [...rows[targetRowIndex]];

      // Update specific columns based on headers
      headers.forEach((header: string, index: number) => {
        const lowerHeader = header.toLowerCase();
        
        if (lowerHeader.includes('status') && tracking.status) {
          existingRow[index] = tracking.status;
        } else if (lowerHeader.includes('sentat') && tracking.sentAt) {
          existingRow[index] = this.formatToIST(tracking.sentAt);
        } else if (lowerHeader.includes('firstopen') && tracking.firstOpenAt) {
          existingRow[index] = this.formatToIST(tracking.firstOpenAt);
        } else if (lowerHeader.includes('lastopen') && tracking.lastOpenAt) {
          existingRow[index] = this.formatToIST(tracking.lastOpenAt);
        } else if (lowerHeader.includes('opencount') && tracking.openCount !== undefined) {
          existingRow[index] = tracking.openCount.toString();
        }
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [existingRow],
        },
      });

      console.log(`Updated tracking info for ${trackingId}`);
    } catch (error) {
      console.error('Error updating tracking info:', error);
      throw error;
    }
  }

  /**
   * Add new tracking entry to sheet
   */
  async addTrackingEntry(
    sheetId: string,
    tracking: EmailTracking
  ): Promise<void> {
    try {
      // Get current sheet structure to understand columns
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A1:Z1',
      });

      const headers = response.data.values?.[0] || [];
      
      // Prepare row data based on headers
      const rowData = headers.map((header: string) => {
        const lowerHeader = header.toLowerCase();
        
        if (lowerHeader.includes('company')) return tracking.companyName;
        if (lowerHeader.includes('position')) return tracking.position;
        if (lowerHeader.includes('email')) return tracking.recipient;
        if (lowerHeader.includes('role')) return tracking.role;
        if (lowerHeader.includes('status')) return tracking.status;
        if (lowerHeader.includes('sentat')) return this.formatToIST(tracking.sentAt);
        if (lowerHeader.includes('firstopen')) return tracking.firstOpenAt ? this.formatToIST(tracking.firstOpenAt) : '';
        if (lowerHeader.includes('lastopen')) return tracking.lastOpenAt ? this.formatToIST(tracking.lastOpenAt) : '';
        if (lowerHeader.includes('opencount')) return tracking.openCount.toString();
        if (lowerHeader.includes('tracking') || lowerHeader.includes('id')) return tracking.trackingId;
        
        return '';
      });

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A:Z',
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData],
        },
      });

      console.log(`Added new tracking entry for ${tracking.trackingId}`);
    } catch (error) {
      console.error('Error adding tracking entry:', error);
      throw error;
    }
  }

  /**
   * Get pending emails to send (where sendStatus is "SENT")
   */
  async getPendingEmails(sheetId: string): Promise<SheetRow[]> {
    try {
      const allData = await this.getSheetData(sheetId, 'A:Z');
      
      // Filter for rows where sendStatus is "SENT"
      const pendingEmails = allData.filter(row => 
        row.sendstatus && row.sendstatus.toUpperCase() === 'SENT'
      );

      console.log(`Found ${pendingEmails.length} pending emails to send`);
      return pendingEmails;
    } catch (error) {
      console.error('Error getting pending emails:', error);
      throw error;
    }
  }

  /**
   * Update send status from "SENT" to "ALREADY_SENT"
   */
  async updateSendStatus(sheetId: string, rowIndex: number): Promise<void> {
    try {
      // Get the current data to find the sendStatus column
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A1:Z1',
      });

      const headers = response.data.values?.[0] || [];
      const sendStatusIndex = headers.findIndex((h: string) => 
        h.toLowerCase().includes('sendstatus') || h.toLowerCase().includes('status')
      );

      if (sendStatusIndex === -1) {
        console.error('SendStatus column not found in sheet');
        return;
      }

      // Convert to column letter (A, B, C, etc.)
      const columnLetter = String.fromCharCode(65 + sendStatusIndex);
      const cellRange = `${columnLetter}${rowIndex + 2}`; // +2 because rowIndex is 0-based and row 1 is headers

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: cellRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ALREADY_SENT']],
        },
      });

      console.log(`Updated send status to ALREADY_SENT for row ${rowIndex + 2}`);
    } catch (error) {
      console.error('Error updating send status:', error);
      throw error;
    }
  }

  /**
   * Verify Google Sheets connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.auth.getAccessToken();
      console.log('✅ Google Sheets service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Google Sheets service connection failed:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
