// backend/models/studentModel.js
import { getDb } from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

// Ini Wajib Kamu Ingat! (Prinsip #3: Asynchronous JavaScript - Database selalu Async)
// Setiap operasi database (get, run, all) adalah asynchronous karena melibatkan I/O.
// Pastikan selalu menggunakan 'await' dan berada dalam fungsi 'async'.

/**
 * Mengambil semua data siswa dari database.
 * @returns {Promise<Array>} Array berisi objek siswa.
 */
export const getAllStudents = async () => { 
  const db = getDb();
  return db.all('SELECT * FROM students ORDER BY name COLLATE NOCASE');
};

/**
 * Mengambil satu data siswa berdasarkan ID.
 * @param {string} id ID siswa yang akan dicari.
 * @returns {Promise<object|undefined>} Objek siswa jika ditemukan, undefined jika tidak.
 */
export const getStudentById = async (id) => { 
  const db = getDb();
  return db.get('SELECT * FROM students WHERE id = ?', id);
};

/**
 * Ini Wajib Kamu Ingat! (Fungsi Baru: findByNis)
 * Untuk memvalidasi NIS unik saat impor massal.
 * @param {string} nis NIS siswa yang akan dicari.
 * @returns {Promise<object|undefined>} Objek siswa jika ditemukan, undefined jika tidak.
 */
export const findByNis = async (nis) => {
  const db = getDb();
  return db.get('SELECT * FROM students WHERE nis = ?', nis);
};


/**
 * Menambah siswa baru ke database.
 * @param {object} studentData Data siswa yang akan ditambahkan (nis, name, class, gender, birth_date, dll.).
 * @returns {Promise<object>} Objek siswa yang baru ditambahkan.
 */
export const createStudent = async (studentData) => { 
  const db = getDb();
  const id = uuidv4(); // Hasilkan UUID unik untuk siswa baru

  const { nis, name, class: studentClass, gender, birth_date, address, parent_name, phone_number } = studentData;

  // Cek apakah NIS sudah ada sebelum insert (meskipun ada UNIQUE constraint di DB, ini validasi awal)
  const existingStudent = await findByNis(nis);
  if (existingStudent) {
    throw new Error('SQLITE_CONSTRAINT_UNIQUE: NIS yang dimasukkan sudah ada.');
  }

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
export const updateStudent = async (id, studentData) => { 
  const db = getDb();
  const { nis, name, class: studentClass, gender, birth_date, address, parent_name, phone_number } = studentData;

  // Cek NIS duplikat jika NIS diubah
  const existingStudentByNis = await findByNis(nis);
  if (existingStudentByNis && existingStudentByNis.id !== id) {
    throw new Error('SQLITE_CONSTRAINT_UNIQUE: NIS yang dimasukkan sudah ada.');
  }

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
export const deleteStudent = async (id) => { 
  const db = getDb();
  await db.run('DELETE FROM students WHERE id = ?', id);
};
