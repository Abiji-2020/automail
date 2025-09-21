import { Router, Request, Response } from 'express';
import { googleSheetsService } from '../services/googleSheetsService';

const router = Router();

// GET /api/sheets/:sheetId - Get data from a Google Sheet
router.get('/:sheetId', async (req: Request, res: Response) => {
  try {
    const { sheetId } = req.params;
    const { range = 'A:Z' } = req.query;

    if (!sheetId) {
      return res.status(400).json({
        error: 'Sheet ID is required'
      });
    }

    const data = await googleSheetsService.getSheetData(sheetId, range as string);

    res.json({
      sheetId,
      range,
      data,
      count: data.length
    });
  } catch (error) {
    console.error('Error getting sheet data:', error);
    res.status(500).json({
      error: 'Failed to get sheet data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/sheets/test/connection - Test Google Sheets connection
router.get('/test/connection', async (req: Request, res: Response) => {
  try {
    const isConnected = await googleSheetsService.verifyConnection();
    res.json({
      googleSheets: isConnected ? 'connected' : 'disconnected',
      message: isConnected ? 'Google Sheets service is working properly' : 'Google Sheets service connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to test Google Sheets service',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
