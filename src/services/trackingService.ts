import { v4 as uuidv4 } from 'uuid';
import { EmailTracking } from '../types';
import { googleSheetsService } from './googleSheetsService';
import { config } from '../config';

class TrackingService {
  private trackingData: Map<string, EmailTracking> = new Map();

  /**
   * Generate a new tracking ID
   */
  generateTrackingId(): string {
    return uuidv4();
  }

  /**
   * Create tracking URL for email open tracking
   */
  createTrackingUrl(trackingId: string): string {
    return `${config.tracking.baseUrl}/api/track/open/${trackingId}`;
  }

  /**
   * Store tracking information
   */
  storeTracking(tracking: EmailTracking): void {
    this.trackingData.set(tracking.trackingId, tracking);
  }

  /**
   * Get tracking information
   */
  getTracking(trackingId: string): EmailTracking | null {
    return this.trackingData.get(trackingId) || null;
  }

  /**
   * Record email open event
   */
  async recordEmailOpen(trackingId: string, sheetId?: string): Promise<void> {
    try {
      const tracking = this.trackingData.get(trackingId);
      if (!tracking) {
        console.error('Tracking ID not found:', trackingId);
        return;
      }

      const now = new Date();
      
      // Update tracking data
      if (!tracking.firstOpenAt) {
        tracking.firstOpenAt = now;
      }
      tracking.lastOpenAt = now;
      tracking.openCount += 1;
      tracking.status = 'opened';

      // Update in memory
      this.trackingData.set(trackingId, tracking);

      // Update in Google Sheets if sheetId is provided
      if (sheetId && config.googleSheets.clientEmail) {
        await googleSheetsService.updateTrackingInfo(sheetId, trackingId, {
          firstOpenAt: tracking.firstOpenAt,
          lastOpenAt: tracking.lastOpenAt,
          openCount: tracking.openCount,
          status: tracking.status,
        });
      }

      console.log(`📧 Email opened: ${trackingId} (Opens: ${tracking.openCount})`);
    } catch (error) {
      console.error('Error recording email open:', error);
    }
  }

  /**
   * Record email sent event
   */
  async recordEmailSent(
    trackingId: string,
    recipient: string,
    role: string,
    companyName: string,
    position: string,
    sheetId?: string
  ): Promise<void> {
    try {
      const tracking: EmailTracking = {
        trackingId,
        recipient,
        role,
        companyName,
        position,
        sentAt: new Date(),
        openCount: 0,
        status: 'sent',
      };

      // Store in memory
      this.storeTracking(tracking);

      // Add to Google Sheets if sheetId is provided
      if (sheetId && config.googleSheets.clientEmail) {
        await googleSheetsService.addTrackingEntry(sheetId, tracking);
      }

      console.log(`📤 Email sent tracked: ${trackingId} to ${recipient}`);
    } catch (error) {
      console.error('Error recording email sent:', error);
    }
  }

  /**
   * Get tracking statistics
   */
  getTrackingStats(): {
    totalSent: number;
    totalOpened: number;
    openRate: number;
    trackingEntries: EmailTracking[];
  } {
    const entries = Array.from(this.trackingData.values());
    const totalSent = entries.length;
    const totalOpened = entries.filter(t => t.status === 'opened').length;
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

    return {
      totalSent,
      totalOpened,
      openRate: Math.round(openRate * 100) / 100,
      trackingEntries: entries,
    };
  }

  /**
   * Clear old tracking data (optional cleanup)
   */
  cleanup(olderThanDays: number = 30): void {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    
    for (const [trackingId, tracking] of this.trackingData) {
      if (tracking.sentAt < cutoffDate) {
        this.trackingData.delete(trackingId);
      }
    }
    
    console.log(`🧹 Cleaned up tracking data older than ${olderThanDays} days`);
  }
}

export const trackingService = new TrackingService();
