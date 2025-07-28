// backend/routes/settingsRoutes.js
import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { getWaStatus } from '../controllers/settingsController.js';
import authMiddleware,{ authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware `authMiddleware` sudah diterapkan di server.js untuk group /api/settings,
// jadi tidak perlu ditambahkan lagi di sini. Cukup gunakan `authorizeRoles`.
router.get('/', authMiddleware, getSettings);
router.put('/', authorizeRoles('admin'), updateSettings);
router.get('/wa-status', authorizeRoles('admin'), getWaStatus);

export default router;