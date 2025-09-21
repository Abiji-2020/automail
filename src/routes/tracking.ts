import { Router, Request, Response } from 'express';
import { trackingService } from '../services/trackingService';

const router = Router();

// GET /api/track/open/:trackingId - Track email opens
router.get('/open/:trackingId', async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    const { sheetId } = req.query;

    if (!trackingId) {
      return res.status(400).send('Tracking ID is required');
    }

    // Record the email open
    await trackingService.recordEmailOpen(
      trackingId,
      sheetId as string || undefined
    );

    // Return a 1x1 transparent pixel image
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(pixel);
  } catch (error) {
    console.error('Error tracking email open:', error);
    
    // Still return a pixel even if tracking fails
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    
    res.set('Content-Type', 'image/gif');
    res.send(pixel);
  }
});

// GET /api/track/stats - Get tracking statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = trackingService.getTrackingStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting tracking stats:', error);
    res.status(500).json({
      error: 'Failed to get tracking statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/track/:trackingId - Get specific tracking information
router.get('/:trackingId', (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    const tracking = trackingService.getTracking(trackingId);

    if (!tracking) {
      return res.status(404).json({
        error: 'Tracking ID not found'
      });
    }

    res.json(tracking);
  } catch (error) {
    console.error('Error getting tracking info:', error);
    res.status(500).json({
      error: 'Failed to get tracking information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
