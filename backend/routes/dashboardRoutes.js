// backend/routes/dashboardRoutes.js
import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Import middleware otentikasi

const router = express.Router();

// Ini Wajib Kamu Ingat! (Melindungi Endpoint Dashboard)
// Dashboard harus dilindungi agar hanya user yang login yang bisa melihatnya.
router.get('/', authMiddleware, getDashboardStats);

export default router;
