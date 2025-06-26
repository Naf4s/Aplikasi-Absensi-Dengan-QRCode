// backend/models/studentModel.js
import { getDb } from '../utils/database.js'; // Mengambil instance database
import { v4 as uuidv4 } from 'uuid'; // Untuk menghasilkan ID unik

// Ini Wajib Kamu Ingat! (Prinsip #3: Asynchronous JavaScript - Database selalu Async)
// Setiap operasi database (get, run, all) adalah asynchronous karena melibatkan I/O.
// Pastikan selalu menggunakan 'await' dan berada dalam fungsi 'async'.

/**
 * Mengambil semua data siswa dari database.
 * @returns {Promise<Array>} Array berisi objek siswa.
 */
export const getAllStudents = async () => { // PASTIKAN ADA 'export const'
  const db = getDb();
  return db.all('SELECT * FROM students ORDER BY name COLLATE NOCASE');
};

/**
 * Mengambil satu data siswa berdasarkan ID.
 * @param {string} id ID siswa yang akan dicari.
 * @returns {Promise<object|undefined>} Objek siswa jika ditemukan, undefined jika tidak.
 */
export const getStudentById = async (id) => { // PASTIKAN ADA 'export const'
  const db = getDb();
  return db.get('SELECT * FROM students WHERE id = ?', id);
};

/**
 * Menambah siswa baru ke database.
 * @param {object} studentData Data siswa yang akan ditambahkan (nis, name, class, gender, birth_date, dll.).
 * @returns {Promise<object>} Objek siswa yang baru ditambahkan.
 */
export const createStudent = async (studentData) => { // PASTIKAN ADA 'export const'
  const db = getDb();
  const id = uuidv4(); // Hasilkan UUID unik untuk siswa baru

  const { nis, name, class: studentClass, gender, birth_date, address, parent_name, phone_number } = studentData;

  // Ini Wajib Kamu Ingat! (Prinsip #5: Validasi Input)
  // Meskipun kita melakukan validasi di controller, pastikan data yang masuk ke DB juga sesuai.
  // Pastikan kolom yang NOT NULL sudah ada datanya.

  await db.run(
    'INSERT INTO students (id, nis, name, class, gender, birth_date, address, parent_name, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, nis, name, studentClass, gender, birth_date, address, parent_name, phone_number
  );
  return { id, ...studentData }; // Kembalikan objek siswa yang ditambahkan
};

/**
 * Mengupdate data siswa yang sudah ada.
 * @param {string} id ID siswa yang akan diupdate.
 * @param {object} studentData Data siswa yang akan diupdate.
 * @returns {Promise<object>} Objek siswa yang telah diupdate.
 */
export const updateStudent = async (id, studentData) => { // PASTIKAN ADA 'export const'
  const db = getDb();
  const { nis, name, class: studentClass, gender, birth_date, address, parent_name, phone_number } = studentData;

  await db.run(
    `UPDATE students SET 
      nis = ?, name = ?, class = ?, gender = ?, birth_date = ?, 
      address = ?, parent_name = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    nis, name, studentClass, gender, birth_date, address, parent_name, phone_number, id
  );
  return { id, ...studentData }; // Kembalikan objek siswa yang diupdate
};

/**
 * Menghapus data siswa dari database.
 * @param {string} id ID siswa yang akan dihapus.
 * @returns {Promise<void>}
 */
export const deleteStudent = async (id) => { // PASTIKAN ADA 'export const'
  const db = getDb();
  await db.run('DELETE FROM students WHERE id = ?', id);
};
