// backend/utils/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid'; // PERBAIKAN: Import uuidv4 di sini

let db;

/**
 * Menginisialisasi database SQLite.
 * Jika file database belum ada, akan dibuat.
 * Akan membuat tabel 'users', 'students', 'attendance_records', dan 'classes' jika belum ada, dan mengisi data awal.
 */
export async function initializeDatabase() {
  try {
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

      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        homeroom_teacher_id TEXT, -- Walikelas bisa null jika belum ditunjuk
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (homeroom_teacher_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('Tabel "users", "students", "attendance_records", dan "classes" sudah ada atau berhasil dibuat.');

    // Seed data (data awal) untuk user admin dan teacher jika belum ada
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', 'admin@example.com');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        'admin-uuid-1', 'Administrator', 'admin@example.com', hashedPassword, 'admin'
      );
      console.log('User admin@example.com ditambahkan.');
    }

    const existingTeacher = await db.get('SELECT * FROM users WHERE email = ?', 'guru@example.com');
    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash('guru123', 10);
      await db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        'teacher-uuid-1', 'Guru Kelas', 'guru@example.com', hashedPassword, 'teacher'
      );
      console.log('User guru@example.com ditambahkan.');
    }

    // Seed data untuk kelas (opsional, bisa ditambahkan dari UI nanti)
    const existingClass1A = await db.get('SELECT * FROM classes WHERE name = ?', '1A');
    if (!existingClass1A) {
      await db.run('INSERT INTO classes (id, name) VALUES (?, ?)', uuidv4(), '1A'); // Menggunakan uuidv4 di sini
    }
    const existingClass1B = await db.get('SELECT * FROM classes WHERE name = ?', '1B');
    if (!existingClass1B) {
      await db.run('INSERT INTO classes (id, name) VALUES (?, ?)', uuidv4(), '1B'); // Menggunakan uuidv4 di sini
    }
    console.log('Kelas 1A dan 1B (jika belum ada) ditambahkan.');


    console.log('Database siap digunakan.');

  } catch (error) {
    console.error('Gagal menginisialisasi database:', error);
    process.exit(1);
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
