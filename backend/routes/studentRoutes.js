// backend/routes/studentRoutes.js
import express from 'express';
import { 
  getStudents, getStudentById, createStudent, updateStudent, deleteStudent,promoteStudents,
  bulkCreateStudents // Import fungsi bulkCreateStudents
} from '../controllers/studentController.js';
import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Ini Wajib Kamu Ingat! (Penerapan Middleware Otorisasi)
// Semua route di bawah ini hanya bisa diakses oleh Admin.

// Route untuk mendapatkan semua siswa
router.get('/', getStudents); // Masih dilindungi di server.js

// Route untuk menambah siswa baru (single)
router.post('/', authorizeRoles('admin'), createStudent); // Hanya admin yang bisa menambah siswa

// Route untuk impor siswa massal (Hanya Admin)
router.post('/bulk-import', authorizeRoles('admin'), bulkCreateStudents); // Route baru untuk impor massal

// Route untuk mendapatkan siswa berdasarkan ID
router.get('/:id', getStudentById);

// Route untuk mengupdate siswa
router.put('/:id', authorizeRoles('admin'), updateStudent); // Hanya admin yang bisa update siswa

// Route untuk menghapus siswa
router.delete('/:id', authorizeRoles('admin'), deleteStudent); // Hanya admin yang bisa menghapus siswa

// Promote student
router.post('/promote', promoteStudents);

export default router;
