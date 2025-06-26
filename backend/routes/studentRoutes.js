import express from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';

const router = express.Router();

router.get('/', getStudents); // GET /api/students -> Ambil semua siswa
router.post('/', createStudent); // POST /api/students -> Tambah siswa baru

router.get('/:id', getStudentById); // GET /api/students/:id -> Ambil siswa berdasarkan ID
router.put('/:id', updateStudent); // PUT /api/students/:id -> Update siswa berdasarkan ID
router.delete('/:id', deleteStudent); // DELETE /api/students/:id -> Hapus siswa berdasarkan ID

export default router;
