// backend/models/classModel.js
import { getDb } from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

// Ini Wajib Kamu Ingat! (Prinsip #3: Asynchronous JavaScript - Database selalu Async)
// Setiap operasi database (get, run, all) adalah asynchronous karena melibatkan I/O.
// Pastikan selalu menggunakan 'await' dan berada dalam fungsi 'async'.

/**
 * Mengambil semua data kelas dari database, opsional dengan informasi walikelas.
 * @returns {Promise<Array>} Array berisi objek kelas.
 */
export const getAllClasses = async () => {
  const db = getDb();
  // Join dengan tabel users untuk mendapatkan nama walikelas
  return db.all(`
    SELECT c.id, c.name, c.homeroom_teacher_id, u.name as homeroom_teacher_name
    FROM classes c
    LEFT JOIN users u ON c.homeroom_teacher_id = u.id
    ORDER BY c.name COLLATE NOCASE
  `);
};

/**
 * Mengambil data kelas berdasarkan ID guru wali kelas.
 * @param {string} teacherId ID guru wali kelas.
 * @returns {Promise<Array>} Array berisi objek kelas yang diwaliki guru tersebut.
 */
export const getClassesByTeacherId = async (teacherId) => {
  const db = getDb();
  return db.all(`
    SELECT c.id, c.name, c.homeroom_teacher_id, u.name as homeroom_teacher_name
    FROM classes c
    LEFT JOIN users u ON c.homeroom_teacher_id = u.id
    WHERE c.homeroom_teacher_id = ?
    ORDER BY c.name COLLATE NOCASE
  `, teacherId);
};

/**
 * Mengambil satu data kelas berdasarkan ID.
 * @param {string} id ID kelas.
 * @returns {Promise<object|undefined>} Objek kelas jika ditemukan, undefined jika tidak.
 */
export const getClassById = async (id) => {
  const db = getDb();
  return db.get(`
    SELECT c.id, c.name, c.homeroom_teacher_id, u.name as homeroom_teacher_name
    FROM classes c
    LEFT JOIN users u ON c.homeroom_teacher_id = u.id
    WHERE c.id = ?
  `, id);
};

/**
 * Menambah kelas baru ke database.
 * @param {object} classData Data kelas yang akan ditambahkan (name, homeroom_teacher_id).
 * @returns {Promise<object>} Objek kelas yang baru ditambahkan.
 */
export const createClass = async (classData) => {
  const db = getDb();
  const id = uuidv4(); // Hasilkan UUID unik untuk kelas baru
  const { name, homeroom_teacher_id } = classData;

  await db.run(
    'INSERT INTO classes (id, name, homeroom_teacher_id) VALUES (?, ?, ?)',
    id, name, homeroom_teacher_id
  );
  return { id, name, homeroom_teacher_id }; // Kembalikan objek kelas yang ditambahkan
};

/**
 * Mengupdate data kelas yang sudah ada.
 * @param {string} id ID kelas yang akan diupdate.
 * @param {object} classData Data kelas yang akan diupdate (name, homeroom_teacher_id).
 * @returns {Promise<object>} Objek kelas yang telah diupdate.
 */
export const updateClass = async (id, classData) => {
  const db = getDb();
  const { name, homeroom_teacher_id } = classData;

  await db.run(
    `UPDATE classes SET 
      name = ?, homeroom_teacher_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    name, homeroom_teacher_id, id
  );
  return { id, name, homeroom_teacher_id }; // Kembalikan objek kelas yang diupdate
};

/**
 * Menghapus data kelas dari database.
 * @param {string} id ID kelas yang akan dihapus.
 * @returns {Promise<void>}
 */
export const deleteClass = async (id) => {
  const db = getDb();
  await db.run('DELETE FROM classes WHERE id = ?', id);
};
