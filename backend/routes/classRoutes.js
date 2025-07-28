// backend/routes/classRoutes.js
import express from 'express';
import { getClasses, getClassById, createClass, updateClass, deleteClass } from '../controllers/classController.js';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ini Wajib Kamu Ingat! (Penerapan Middleware Otorisasi)
// Semua route kelas di bawah ini hanya bisa diakses oleh 'admin'.

router.get('/', authMiddleware, authorizeRoles('admin', 'teacher'), getClasses);
router.post('/', authMiddleware, authorizeRoles('admin'), createClass);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getClassById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateClass);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteClass);

export default router;
