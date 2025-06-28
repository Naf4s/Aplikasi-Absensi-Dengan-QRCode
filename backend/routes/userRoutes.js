// backend/routes/userRoutes.js
import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware.js'; // Import middleware otentikasi dan otorisasi

const router = express.Router();

// Ini Wajib Kamu Ingat! (Penerapan Middleware Otorisasi)
// Kita menggunakan `authMiddleware` untuk memastikan user sudah login,
// lalu `authorizeRoles('admin')` untuk memastikan user adalah admin.
// Urutan middleware penting: autentikasi dulu, baru otorisasi.

// Route untuk mendapatkan semua user (Hanya Admin)
router.get('/', authMiddleware, authorizeRoles('admin'), getUsers);

// Route untuk menambah user baru (Hanya Admin)
router.post('/', authMiddleware, authorizeRoles('admin'), createUser);

// Route untuk mendapatkan user berdasarkan ID (Admin atau user itu sendiri)
router.get('/:id', authMiddleware, getUserById);

// Route untuk mengupdate user (Admin atau user itu sendiri)
router.put('/:id', authMiddleware, updateUser);

// Route untuk menghapus user (Hanya Admin)
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteUser);

export default router;
