import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

let db;

/**
 * Initialize SQLite database.
 * Creates tables if they don't exist and seeds initial data.
 */
export async function initializeDatabase() {
  try {
    db = await open({
      filename: './absensi.db',
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database.');

    // Create tables if not exist
    const createTablesSQL = 
      "CREATE TABLE IF NOT EXISTS users (" +
        "id TEXT PRIMARY KEY," +
        "name TEXT NOT NULL," +
        "email TEXT UNIQUE NOT NULL," +
        "password TEXT NOT NULL," +
        "role TEXT NOT NULL," +
        "created_at TEXT DEFAULT CURRENT_TIMESTAMP" +
      ");" +

      "CREATE TABLE IF NOT EXISTS students (" +
        "id TEXT PRIMARY KEY," +
        "nis TEXT UNIQUE NOT NULL," +
        "name TEXT NOT NULL," +
        "class TEXT NOT NULL," +
        "gender TEXT NOT NULL," +
        "birth_date TEXT NOT NULL," +
        "address TEXT," +
        "parent_name TEXT," +
        "phone_number TEXT," +
        "created_at TEXT DEFAULT CURRENT_TIMESTAMP," +
        "updated_at TEXT DEFAULT CURRENT_TIMESTAMP" +
      ");" +

      "CREATE TABLE IF NOT EXISTS attendance_records (" +
        "id TEXT PRIMARY KEY," +
        "student_id TEXT NOT NULL," +
        "date TEXT NOT NULL," +
        "time_in TEXT," +
        "status TEXT NOT NULL," +
        "notes TEXT," +
        "marked_by_user_id TEXT," +
        "created_at TEXT DEFAULT CURRENT_TIMESTAMP," +
        "FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE," +
        "FOREIGN KEY (marked_by_user_id) REFERENCES users(id) ON DELETE SET NULL" +
      ");" +

      "CREATE TABLE IF NOT EXISTS classes (" +
        "id TEXT PRIMARY KEY," +
        "name TEXT UNIQUE NOT NULL," +
        "homeroom_teacher_id TEXT," +
        "created_at TEXT DEFAULT CURRENT_TIMESTAMP," +
        "updated_at TEXT DEFAULT CURRENT_TIMESTAMP," +
        "FOREIGN KEY (homeroom_teacher_id) REFERENCES users(id) ON DELETE SET NULL" +
      ");" +

      "CREATE TABLE IF NOT EXISTS settings (" +
        "key TEXT PRIMARY KEY," +
        "value TEXT NOT NULL" +
      ");";

    await db.exec(createTablesSQL);

    console.log('Tables "users", "students", "attendance_records", "classes", and "settings" are ready.');

    // Seed admin user if not exists
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', 'admin@example.com');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        'admin-uuid-1', 'Administrator', 'admin@example.com', hashedPassword, 'admin'
      );
      console.log('Admin user admin@example.com added.');
    }

    // Seed teacher user if not exists
    const existingTeacher = await db.get('SELECT * FROM users WHERE email = ?', 'guru@example.com');
    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash('guru123', 10);
      await db.run(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        'teacher-uuid-1', 'Guru Kelas', 'guru@example.com', hashedPassword, 'teacher'
      );
      console.log('Teacher user guru@example.com added.');
    }

    // Seed initial settings data if not exists
    const existingAcademicYear = await db.get('SELECT * FROM settings WHERE key = ?', 'current_academic_year');
    if (!existingAcademicYear) {
      await db.run(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        'current_academic_year', '2025/2026'
      );
      console.log('Setting current_academic_year added.');
    }

    const existingSemester = await db.get('SELECT * FROM settings WHERE key = ?', 'current_semester');
    if (!existingSemester) {
      await db.run(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        'current_semester', '1'
      );
      console.log('Setting current_semester added.');
    }

    console.log('Database is ready.');

  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

/**
 * Returns the initialized database instance.
 * @returns {Promise<import('sqlite').Database>}
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}
