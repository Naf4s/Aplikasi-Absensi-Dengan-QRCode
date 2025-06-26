// backend/controllers/studentController.js
// Ini Wajib Kamu Ingat! (Prinsip #6: Named Imports dengan Alias)
// Kita mengimpor fungsi-fungsi dari studentModel.js, dan memberikan alias dengan awalan '_'
// untuk menghindari konflik nama dengan fungsi yang kita ekspor dari controller ini.
import {
  getAllStudents as _getAllStudents,
  getStudentById as _getStudentById,
  createStudent as _createStudent,
  updateStudent as _updateStudent,
  deleteStudent as _deleteStudent
} from '../models/studentModel.js'; 

// Ini Wajib Kamu Ingat! (Prinsip #5: Validasi Input dari Klien)
// Selalu validasi data yang diterima dari frontend/klien. Jangan pernah percaya input dari luar.
// Ini untuk mencegah data kotor masuk ke database dan potensi serangan.

/**
 * Mengambil semua data siswa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const getStudents = async (req, res) => {
  try {
    const students = await _getAllStudents(); // Gunakan alias _getAllStudents
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data siswa.' });
  }
};

/**
 * Mengambil satu data siswa berdasarkan ID.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await _getStudentById(id); // Gunakan alias _getStudentById
    if (!student) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data siswa.' });
  }
};

/**
 * Menambah siswa baru.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const createStudent = async (req, res) => {
  try {
    const newStudentData = req.body;

    // Ini Wajib Kamu Ingat! (Detail Validasi)
    // Contoh validasi sederhana. Untuk produksi, gunakan library validasi (misal 'joi' atau 'express-validator').
    const requiredFields = ['nis', 'name', 'class', 'gender', 'birth_date'];
    const missingFields = requiredFields.filter(field => !newStudentData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Bidang wajib hilang: ${missingFields.join(', ')}` });
    }

    const createdStudent = await _createStudent(newStudentData); // Gunakan alias _createStudent
    res.status(201).json({ message: 'Siswa berhasil ditambahkan.', student: createdStudent });
  } catch (error) {
    // Ini Wajib Kamu Ingat! (Error Handling Database)
    // Error database seringkali punya 'code' spesifik. Misalnya, SQLite UNIQUE constraint error.
    if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
      return res.status(409).json({ message: 'NIS yang dimasukkan sudah ada. NIS harus unik.' });
    }
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat menambahkan siswa.' });
  }
};

/**
 * Mengupdate data siswa.
 * @param {string} id ID siswa yang akan diupdate.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudentData = req.body;

    // Cek apakah siswa ada
    const existingStudent = await _getStudentById(id); // Gunakan alias _getStudentById
    if (!existingStudent) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }

    // Ini Wajib Kamu Ingat! (Detail Validasi Update)
    // Untuk update, tidak semua field harus ada, tapi yang ada harus valid.
    const requiredFields = ['nis', 'name', 'class', 'gender', 'birth_date'];
    for (const field of requiredFields) {
        if (!updatedStudentData[field]) {
            return res.status(400).json({ message: `Bidang wajib hilang: ${field}` });
        }
    }

    const updatedStudent = await _updateStudent(id, updatedStudentData); // Gunakan alias _updateStudent
    res.status(200).json({ message: 'Data siswa berhasil diperbarui.', student: updatedStudent });
  } catch (error) {
    if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
      return res.status(409).json({ message: 'NIS yang dimasukkan sudah ada. NIS harus unik.' });
    }
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui siswa.' });
  }
};

/**
 * Menghapus data siswa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah siswa ada sebelum dihapus
    const existingStudent = await _getStudentById(id); // Gunakan alias _getStudentById
    if (!existingStudent) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }

    await _deleteStudent(id); // Gunakan alias _deleteStudent
    res.status(200).json({ message: 'Siswa berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat menghapus siswa.' });
  }
};
