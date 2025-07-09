import { getDb } from '../utils/database.js';

/**
 * GET /settings
 * Returns all settings as an array of { key, value }.
 */
export async function getSettings(req, res) {
  try {
    const db = getDb();
    const settings = await db.all('SELECT key, value FROM settings');
    res.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
}
