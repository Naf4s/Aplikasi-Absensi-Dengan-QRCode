// backend/utils/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs'; // Import bcryptjs

let db; // Variabel untuk menyimpan instance database

/**
 * Menginisialisasi database SQLite.
 * Jika file database belum ada, akan dibuat.
 * Akan membuat tabel 'users' dan 'students' jika belum ada, dan mengisi data awal.
 */
export async function initializeDatabase() {
  try {
    // Buka database. Nama file database adalah 'absensi.db'.
    // Ini akan dibuat di root folder backend.
    db = await open({
      filename: './absensi.db',
      driver: sqlite3.Database
    });

    console.log('Koneksi ke database SQLite berhasil.');

    // Jalankan skrip DDL untuk membuat tabel jika belum ada
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        nis TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        class TEXT NOT NULL,
        gender TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        address TEXT,
        parent_name TEXT,
        phone_number TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time_in TEXT,
        status TEXT NOT NULL, -- 'present', 'absent', 'sick', 'permit'
        notes TEXT,
        marked_by_user_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by_user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('Tabel "users", "students", dan "attendance_records" sudah ada atau berhasil dibuat.');

    // Seed data (data awal) untuk user admin dan teacher jika belum ada
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', 'admin@example.com');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10); // Hash password admin
      await db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        'admin-uuid-1', 'Administrator', 'admin@example.com', hashedPassword, 'admin'
      );
      console.log('User admin@example.com ditambahkan.');
    }

    const existingTeacher = await db.get('SELECT * FROM users WHERE email = ?', 'guru@example.com');
    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash('guru123', 10); // Hash password guru
      await db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        'teacher-uuid-1', 'Guru Kelas', 'guru@example.com', hashedPassword, 'teacher'
      );
      console.log('User guru@example.com ditambahkan.');
    }

    console.log('Database siap digunakan.');

  } catch (error) {
    console.error('Gagal menginisialisasi database:', error);
    process.exit(1); // Keluar dari aplikasi jika database gagal diinisialisasi
  }
}

/**
 * Mengembalikan instance database yang sudah terinisialisasi.
 * @returns {Promise<import('sqlite').Database>} Instance database.
 */
export function getDb() {
  if (!db) {
    throw new Error('Database belum diinisialisasi. Panggil initializeDatabase() terlebih dahulu.');
  }
  return db;
}
