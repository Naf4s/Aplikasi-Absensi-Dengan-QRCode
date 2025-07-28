// backend/controllers/classController.js
import * as classModel from '../models/classModel.js';
import * as userModel from '../models/userModel.js'; // Untuk validasi homeroom_teacher_id

// Ini Wajib Kamu Ingat! (Prinsip #5: Validasi Input & Otorisasi di Controller)
// Setiap request ke controller ini harus divalidasi dan diotorisasi.

/**
 * Mendapatkan semua kelas. Hanya Admin yang bisa melihat daftar semua kelas.
 * Guru bisa melihat kelas yang diwalikannya (jika nanti ada fitur).
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const getClasses = async (req, res) => {
  try {
    console.log(`getClasses called by user role: ${req.user.role}, id: ${req.user.id}`);
    // req.user datang dari authMiddleware
    if (req.user.role === 'admin') {
      const classes = await classModel.getAllClasses();
      console.log(`Returning ${classes.length} classes for admin`);
      return res.status(200).json(classes);
    } else if (req.user.role === 'teacher') {
      const classes = await classModel.getClassesByTeacherId(req.user.id);
      console.log(`Returning ${classes.length} classes for teacher ${req.user.id}`);
      return res.status(200).json(classes);
    } else {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin dan guru yang bisa melihat daftar kelas.' });
    }
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data kelas.' });
  }
};

/**
 * Mendapatkan kelas berdasarkan ID. Hanya Admin atau walikelasnya yang bisa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await classModel.getClassById(id);

    if (!classData) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
    }

    // req.user datang dari authMiddleware
    // Hanya admin atau homeroom teacher kelas itu sendiri yang bisa melihat detailnya
    if (req.user.role !== 'admin' && req.user.id !== classData.homeroom_teacher_id) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat detail kelas ini.' });
    }

    res.status(200).json(classData);
  } catch (error) {
    console.error('Error fetching class by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data kelas.' });
  }
};

/**
 * Menambah kelas baru. Hanya Admin yang bisa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const createClass = async (req, res) => {
  try {
    // req.user datang dari authMiddleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menambah kelas.' });
    }

    const { name, homeroom_teacher_id } = req.body;

    // Validasi dasar
    if (!name) {
      return res.status(400).json({ message: 'Nama kelas wajib diisi.' });
    }

    // Validasi homeroom_teacher_id jika ada
    if (homeroom_teacher_id) {
      const teacher = await userModel.findById(homeroom_teacher_id);
      if (!teacher || teacher.role !== 'teacher') { // Pastikan ID adalah user dan rol-nya teacher
        return res.status(400).json({ message: 'Walikelas tidak valid atau bukan seorang guru.' });
      }
    }

    const newClass = await classModel.createClass({ name, homeroom_teacher_id });
    res.status(201).json({ message: 'Kelas berhasil ditambahkan.', class: newClass });

  } catch (error) {
    console.error('Error creating class:', error);
    if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
      return res.status(409).json({ message: 'Nama kelas sudah ada. Nama kelas harus unik.' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server saat menambah kelas.' });
  }
};

/**
 * Mengupdate kelas. Hanya Admin yang bisa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, homeroom_teacher_id } = req.body;

    // req.user datang dari authMiddleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengupdate kelas.' });
    }

    const existingClass = await classModel.getClassById(id);
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
    }

    // Validasi dasar
    if (!name) {
      return res.status(400).json({ message: 'Nama kelas wajib diisi.' });
    }

    // Validasi homeroom_teacher_id jika ada (bisa di-set null untuk menghapus walikelas)
    if (homeroom_teacher_id) {
      const teacher = await userModel.findById(homeroom_teacher_id);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Walikelas tidak valid atau bukan seorang guru.' });
      }
    } else if (homeroom_teacher_id === null) {
      // Mengizinkan homeroom_teacher_id diset null (walikelas dihapus)
    } else if (homeroom_teacher_id === undefined) {
      // Jika homeroom_teacher_id tidak disediakan di body, gunakan yang lama
      req.body.homeroom_teacher_id = existingClass.homeroom_teacher_id;
    }


    const updatedClass = await classModel.updateClass(id, { name, homeroom_teacher_id });
    res.status(200).json({ message: 'Data kelas berhasil diperbarui.', class: updatedClass });

  } catch (error) {
    console.error('Error updating class:', error);
    if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
      return res.status(409).json({ message: 'Nama kelas sudah ada. Nama kelas harus unik.' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengupdate kelas.' });
  }
};

/**
 * Menghapus kelas. Hanya Admin yang bisa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // req.user datang dari authMiddleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menghapus kelas.' });
    }

    const existingClass = await classModel.getClassById(id);
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan.' });
    }

    await classModel.deleteClass(id);
    res.status(200).json({ message: 'Kelas berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat menghapus kelas.' });
  }
};
