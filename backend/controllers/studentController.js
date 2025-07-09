// backend/controllers/studentController.js
import {
  getAllStudents as _getAllStudents,
  getStudentById as _getStudentById,
  createStudent as _createStudent,
  updateStudent as _updateStudent,
  deleteStudent as _deleteStudent,
  findByNis as _findByNis // Import findByNis jika ada atau tambahkan di model
} from '../models/studentModel.js'; 
import { getAllClasses as _getAllClasses } from '../models/classModel.js';

// Ini Wajib Kamu Ingat! (Prinsip #5: Validasi Input dari Klien)
// Selalu validasi data yang diterima dari frontend/klien. Jangan pernah percaya input dari luar.
// Ini untuk mencegah data kotor masuk ke database dan potensi serangan.

export const getStudents = async (req, res) => {
  try {
    const students = await _getAllStudents(); 
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data siswa.' });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await _getStudentById(id); 
    if (!student) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data siswa.' });
  }
};

export const createStudent = async (req, res) => {
  try {
    const newStudentData = req.body;

    const requiredFields = ['nis', 'name', 'class', 'gender', 'birth_date'];
    const missingFields = requiredFields.filter(field => !newStudentData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Bidang wajib hilang: ${missingFields.join(', ')}` });
    }

    const createdStudent = await _createStudent(newStudentData); 
    res.status(201).json({ message: 'Siswa berhasil ditambahkan.', student: createdStudent });
  } catch (error) {
    if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
      return res.status(409).json({ message: 'NIS yang dimasukkan sudah ada. NIS harus unik.' });
    }
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat menambahkan siswa.' });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudentData = req.body;

    const existingStudent = await _getStudentById(id); 
    if (!existingStudent) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }

    const requiredFields = ['nis', 'name', 'class', 'gender', 'birth_date'];
    for (const field of requiredFields) {
        if (!updatedStudentData[field]) {
            return res.status(400).json({ message: `Bidang wajib hilang: ${field}` });
        }
    }

    const updatedStudent = await _updateStudent(id, updatedStudentData); 
    res.status(200).json({ message: 'Data siswa berhasil diperbarui.', student: updatedStudent });
  } catch (error) {
    if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
      return res.status(409).json({ message: 'NIS yang dimasukkan sudah ada. NIS harus unik.' });
    }
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui siswa.' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStudent = await _getStudentById(id); 
    if (!existingStudent) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }

    await _deleteStudent(id); 
    res.status(200).json({ message: 'Siswa berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat menghapus siswa.' });
  }
};

/**
 * Ini Wajib Kamu Ingat! (Fungsi untuk Impor Siswa Massal)
 * Menerima array siswa, melakukan validasi dasar, dan membuat setiap siswa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const bulkCreateStudents = async (req, res) => {
  try {
    // Hanya Admin yang bisa melakukan impor
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengimpor siswa.' });
    }

    const studentsToImport = req.body; // Diasumsikan body adalah array of student objects

    if (!Array.isArray(studentsToImport) || studentsToImport.length === 0) {
      return res.status(400).json({ message: 'Data impor tidak valid. Harap sediakan array siswa.' });
    }

    const importResults = [];
    const requiredFields = ['nis', 'name', 'class', 'gender', 'birth_date'];

    for (const studentData of studentsToImport) {
      const missingFields = requiredFields.filter(field => !studentData[field]);
      if (missingFields.length > 0) {
        importResults.push({
          student: studentData,
          status: 'failed',
          message: `Bidang wajib hilang: ${missingFields.join(', ')}`
        });
        continue; // Lanjutkan ke siswa berikutnya
      }

      try {
        const createdStudent = await _createStudent(studentData); // Panggil fungsi createStudent yang sudah ada
        importResults.push({
          student: createdStudent,
          status: 'success',
          message: 'Siswa berhasil ditambahkan.'
        });
      } catch (error) {
        let message = 'Gagal menambahkan siswa.';
        if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
          message = 'NIS sudah ada.';
        }
        console.error(`Error adding student ${studentData.nis}:`, error);
        importResults.push({
          student: studentData,
          status: 'failed',
          message: message
        });
      }
    }

    const successCount = importResults.filter(r => r.status === 'success').length;
    const failedCount = importResults.filter(r => r.status === 'failed').length;

    res.status(200).json({
      message: `Impor selesai. ${successCount} siswa berhasil ditambahkan, ${failedCount} gagal.`,
      results: importResults,
      successCount,
      failedCount
    });

  } catch (error) {
    console.error('Error during bulk import:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengimpor siswa.' });
  }
};
import { getDb } from '../utils/database.js';

export const promoteStudents = async (req, res) => {
  try {
    const { academicYear } = req.body;

    if (!academicYear) {
      return res.status(400).json({ message: 'Tahun ajaran wajib diisi.' });
    }

    // Ambil semua siswa dan kelas
    const students = await _getAllStudents();
    const classes = await _getAllClasses();

    let promoted = 0;
    let skipped = 0;

    for (const student of students) {
      const currentClassName = student.class;

      const currentLevel = parseInt(currentClassName);
      if (isNaN(currentLevel)) {
        skipped++;
        continue;
      }

      if (currentLevel >= 6) {
        // Delete students who are already in class 6
        await _deleteStudent(student.id);
        promoted++;
        continue;
      }

      const nextLevel = currentLevel + 1;
      const nextClassName = nextLevel.toString();

      const classExists = classes.find(c => c.name === nextClassName);
      if (!classExists) {
        skipped++;
        continue;
      }

      await _updateStudent(student.id, {
        ...student,
        class: nextClassName
      });

      promoted++;
    }

    // Update current_academic_year setting to the selected academic year (no increment)
    const db = getDb();
    await db.run('UPDATE settings SET value = ? WHERE key = ?', academicYear, 'current_academic_year');

    res.status(200).json({
      message: `Promosi berhasil. ${promoted} siswa dipindahkan ke kelas selanjutnya. ${skipped} dilewati. Tahun ajaran diperbarui ke ${academicYear}.`,
      promoted,
      skipped,
      newAcademicYear: academicYear
    });
  } catch (error) {
    console.error('Gagal mempromosikan siswa:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mempromosikan siswa.' });
  }
};

