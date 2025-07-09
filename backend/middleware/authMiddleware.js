// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { getDb } from '../utils/database.js'; // Untuk memeriksa user di DB jika diperlukan

// Ini Wajib Kamu Ingat! (Prinsip #1: Middleware di Express)
// Middleware adalah fungsi yang dijalankan sebelum handler route utama.
// Dia bisa memodifikasi req/res, atau menghentikan request jika ada error (misal: not authenticated).
// Panggil next() untuk melanjutkan ke handler route berikutnya.

const authMiddleware = (req, res, next) => {
  // Ambil token dari header Authorization (format: Bearer TOKEN)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak. Tidak ada token otentikasi.' });
  }

  const token = authHeader.split(' ')[1]; // Ambil bagian token setelah 'Bearer '

  try {
    // Verifikasi token
    // Ini Wajib Kamu Ingat! (Prinsip #5: JWT_SECRET di Server)
    // Kunci JWT_SECRET harus SAMA PERSIS dengan yang digunakan saat menandatangani token di login.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Simpan payload yang sudah di-decode ke objek request
    // Agar bisa diakses di controller selanjutnya (misal: req.user.id, req.user.role)
    req.user = decoded; 
    next(); // Lanjutkan ke route handler
  } catch (error) {
    console.error('Verifikasi token gagal:', error);
    res.status(403).json({ message: 'Token tidak valid atau kadaluarsa.' });
  }
};

// Middleware untuk memeriksa role (otorisasi)
// Ini Wajib Kamu Ingat! (Prinsip #5: Otorisasi)
// Role-based access control (RBAC): user dengan role tertentu hanya bisa melakukan aksi tertentu.
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk melakukan aksi ini.' });
    }
    next();
  };
};

export default authMiddleware;
