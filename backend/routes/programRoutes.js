import express from 'express';
import * as programController from '../controllers/programController.js';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware.js'; // authorizeRoles bisa diganti dengan middleware izin yang lebih spesifik jika ada

const router = express.Router();

// --- Rute Publik ---
// Siapa saja bisa melihat daftar program dan detailnya. Tidak perlu authMiddleware.
router.get('/', programController.getPrograms);
router.get('/:id', programController.getProgramById);

// --- Rute Terlindungi (Hanya untuk Admin atau yang Punya Izin) ---
// Rute di bawah ini memerlukan login (authMiddleware) dan izin spesifik (authorizeRoles).
router.post('/', authMiddleware, authorizeRoles('admin'), programController.createProgram); // Atau gunakan authorize('manage_programs')
router.put('/:id', authMiddleware, authorizeRoles('admin'), programController.updateProgram); // Atau gunakan authorize('manage_programs')
router.delete('/:id', authMiddleware, authorizeRoles('admin'), programController.deleteProgram); // Atau gunakan authorize('manage_programs')

export default router; 