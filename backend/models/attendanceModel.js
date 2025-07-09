// backend/models/attendanceModel.js
import { getDb } from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';

// Ini Wajib Kamu Ingat! (Prinsip #3: Asynchronous JavaScript - Database selalu Async)
// Setiap operasi database (get, run, all) adalah asynchronous karena melibatkan I/O.
// Pastikan selalu menggunakan 'await' dan berada dalam fungsi 'async'.

export const recordAttendance = async (studentId, date, status, timeIn = null, notes = null, markedByUserId = null) => {
  const db = getDb();
  const id = uuidv4();
  const currentTime = new Date().toISOString();

  const existingRecord = await db.get(
    'SELECT * FROM attendance_records WHERE student_id = ? AND date = ?',
    studentId, date
  );

  if (existingRecord) {
    await db.run(
      `UPDATE attendance_records SET 
        status = ?, time_in = ?, notes = ?, marked_by_user_id = ?, created_at = ?
       WHERE id = ?`,
      status, timeIn, notes, markedByUserId, currentTime, existingRecord.id
    );
    return { ...existingRecord, status, timeIn, notes, markedByUserId };
  } else {
    await db.run(
      'INSERT INTO attendance_records (id, student_id, date, time_in, status, notes, marked_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      id, studentId, date, timeIn, status, notes, markedByUserId
    );
    return { id, student_id: studentId, date, time_in: timeIn, status, notes, marked_by_user_id: markedByUserId };
  }
};

/**
 * Mengambil catatan absensi dengan filter.
 * @param {object} filters Objek filter (date, class, studentId, status, searchTerm, month, year).
 * @returns {Promise<Array>} Array berisi objek catatan absensi.
 */
export const getAttendanceRecords = async (filters) => {
  const db = getDb();
  let query = `
    SELECT ar.*, s.name as student_name, s.nis, s.class, s.gender, u.name as marked_by_user_name
    FROM attendance_records ar
    JOIN students s ON ar.student_id = s.id
    LEFT JOIN users u ON ar.marked_by_user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.date) {
    query += ' AND ar.date = ?';
    params.push(filters.date);
  }

  if (filters.class) {
    if (Array.isArray(filters.class)) {
      const placeholders = filters.class.map(() => '?').join(', ');
      query += ` AND s.class IN (${placeholders})`;
      params.push(...filters.class);
    } else {
      query += ' AND s.class = ?';
      params.push(filters.class);
    }
  }

  if (filters.studentId) {
    query += ' AND ar.student_id = ?';
    params.push(filters.studentId);
  }

  if (filters.status) {
    query += ' AND ar.status = ?';
    params.push(filters.status);
  }

  if (filters.searchTerm) {
    query += ' AND (s.name LIKE ? OR s.nis LIKE ?)';
    params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
  }

  if (filters.month) {
    query += ' AND STRFTIME("%m", ar.date) = ?';
    params.push(filters.month);
  }

  if (filters.year) {
    query += ' AND STRFTIME("%Y", ar.date) = ?';
    params.push(filters.year);
  }

  query += ' ORDER BY ar.date DESC, ar.created_at DESC';

  return db.all(query, ...params);
};


export const getStudentAttendanceStatusForDate = async (studentId, date) => {
  const db = getDb();
  return db.get(
    'SELECT status, time_in, notes FROM attendance_records WHERE student_id = ? AND date = ?',
    studentId, date
  );
};

export const getStudentsByClass = async (className) => {
  const db = getDb();
  // Ambil juga info dasar siswa saja, tidak perlu semua kolom.
  return db.all('SELECT id, name, nis, class, gender FROM students WHERE class = ?', className);
};
