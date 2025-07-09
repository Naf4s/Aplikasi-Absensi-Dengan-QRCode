// backend/controllers/userController.js
import * as userModel from '../models/userModel.js';
import * as authController from './authController.js'; // Untuk menggunakan fungsi register jika admin menambah user baru
import bcrypt from 'bcryptjs';

// Ini Wajib Kamu Ingat! (Prinsip #5: Validasi Input & Otorisasi di Controller)
// Setiap request ke controller ini harus divalidasi dan diotorisasi.

/**
 * Mendapatkan semua user. Hanya Admin yang bisa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const getUsers = async (req, res) => {
  try {
    // req.user datang dari authMiddleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa melihat daftar user.' });
    }

    const users = await userModel.getUsers();
    // Hapus password dari setiap objek user sebelum dikirim ke frontend (penting!)
    const usersWithoutPasswords = users.map(user => {
        const { password, ...rest } = user;
        return rest;
    });
    res.status(200).json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data user.' });
  }
};

/**
 * Mendapatkan user berdasarkan ID. Hanya Admin atau user itu sendiri yang bisa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // req.user datang dari authMiddleware
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat user ini.' });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    const { password, ...rest } = user; // Hapus password
    res.status(200).json(rest);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data user.' });
  }
};

/**
 * Menambah user baru. Hanya Admin yang bisa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const createUser = async (req, res) => {
  try {
    // req.user datang dari authMiddleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menambah user.' });
    }

    const { name, email, password, role } = req.body;

    // Validasi dasar
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nama, email, password, dan role wajib diisi.' });
    }
    if (!['admin', 'teacher'].includes(role)) { // Batasi role yang bisa ditambahkan
        return res.status(400).json({ message: 'Role tidak valid. Hanya admin atau teacher.' });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const newUser = await userModel.createUser(name, email, password, role);
    res.status(201).json({ message: 'User berhasil ditambahkan.', user: newUser });

  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
      return res.status(409).json({ message: 'Email sudah terdaftar (UNIQUE constraint).' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server saat menambah user.' });
  }
};

/**
 * Mengupdate user. Hanya Admin atau user itu sendiri yang bisa. Admin bisa mengubah role.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body; // Password bersifat opsional untuk update

    // req.user datang dari authMiddleware
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk mengupdate user ini.' });
    }

    // Jika bukan admin, user tidak boleh mengubah role-nya sendiri
    if (req.user.role !== 'admin' && role && req.user.role !== role) {
        return res.status(403).json({ message: 'Akses ditolak. Anda tidak bisa mengubah role Anda sendiri.' });
    }
    // Admin bisa mengubah role ke role lain yang valid
    if (role && !['admin', 'teacher'].includes(role)) {
        return res.status(400).json({ message: 'Role tidak valid.' });
    }


    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    
    // Pastikan email unik jika diubah
    if (email && email !== existingUser.email) {
        const emailExists = await userModel.findByEmail(email);
        if (emailExists && emailExists.id !== id) {
            return res.status(409).json({ message: 'Email sudah terdaftar pada user lain.' });
        }
    }


    const updatedUser = await userModel.updateUser(id, name, email, password, role);
    const { password: userPassword, ...rest } = updatedUser; // Hapus password
    res.status(200).json({ message: 'User berhasil diperbarui.', user: rest });

  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
        return res.status(409).json({ message: 'Email sudah terdaftar (UNIQUE constraint).' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengupdate user.' });
  }
};

/**
 * Menghapus user. Hanya Admin yang bisa.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // req.user datang dari authMiddleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menghapus user.' });
    }
    // Admin tidak bisa menghapus dirinya sendiri
    if (req.user.id === id) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak bisa menghapus akun Anda sendiri.' });
    }

    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    await userModel.deleteUser(id);
    res.status(200).json({ message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat menghapus user.' });
  }
};
