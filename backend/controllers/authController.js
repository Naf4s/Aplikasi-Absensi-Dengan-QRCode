// backend/controllers/authController.js
import { getDb } from '../utils/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const login = async (req, res) => {
    const { email, password } = req.body;
    const db = getDb(); 
  try {
    // Cari user berdasarkan email
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Bandingkan password yang diinput dengan password ter-hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Jika login berhasil, buat JWT (JSON Web Token)
    // Payload token (informasi yang akan disimpan dalam token)
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Buat token menggunakan JWT_SECRET dari .env
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token berlaku 1 jam

    // Kirim response sukses dengan token dan data user (tanpa password)
    const { password: userPassword, ...userData } = user; // Hapus password dari objek user
    res.status(200).json({
      message: 'Login berhasil!',
      token,
      user: userData // Kirim data user tanpa password
    });

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
  }
}
/**
 * Fungsi untuk registrasi user baru (opsional).
 * Untuk sistem absensi, hanya admin yang bisa menambah user,
 * tapi kita buatkan kerangkanya.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
    const db = getDb(); 
  try {
    // Periksa apakah user sudah ada
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 adalah salt rounds

    // Generate UUID untuk user baru
    const userId = jwt.sign({ email }, process.env.JWT_SECRET + '_temp_id', { expiresIn: '5m' }); // UUID sederhana

    // Simpan user baru ke database
    await db.run(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      userId, name, email, hashedPassword, role || 'teacher' // Default role 'teacher'
    );

    // Kirim response sukses
    res.status(201).json({ message: 'Registrasi berhasil. User dibuat.', userId });

  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi.' });
  }
};