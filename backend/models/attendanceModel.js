    // backend/models/attendanceModel.js
    import { getDb } from '../utils/database.js';
    import { v4 as uuidv4 } from 'uuid';

    // Ini Wajib Kamu Ingat! (Prinsip #1: Konsistensi Data)
    // Pastikan skema data yang kamu masukkan ke DB sesuai dengan definisi tabel.

    export const recordAttendance = async (studentId, date, status, timeIn = null, notes = null, markedByUserId = null) => {
      const db = getDb();
      const id = uuidv4();
      const currentTime = new Date().toISOString(); // Waktu saat ini untuk created_at

      // Cek apakah sudah ada record absensi untuk siswa dan tanggal yang sama
      const existingRecord = await db.get(
        'SELECT * FROM attendance_records WHERE student_id = ? AND date = ?',
        studentId, date
      );

      if (existingRecord) {
        // Jika sudah ada, update record yang sudah ada
        await db.run(
          `UPDATE attendance_records SET 
            status = ?, time_in = ?, notes = ?, marked_by_user_id = ?, created_at = ?
           WHERE id = ?`,
          status, timeIn, notes, markedByUserId, currentTime, existingRecord.id
        );
        return { ...existingRecord, status, timeIn, notes, markedByUserId };
      } else {
        // Jika belum ada, buat record baru
        await db.run(
          'INSERT INTO attendance_records (id, student_id, date, time_in, status, notes, marked_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          id, studentId, date, timeIn, status, notes, markedByUserId
        );
        return { id, student_id: studentId, date, time_in: timeIn, status, notes, marked_by_user_id: markedByUserId };
      }
    };

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
        query += ' AND s.class = ?';
        params.push(filters.class);
      }
      if (filters.studentId) {
        query += ' AND ar.student_id = ?';
        params.push(filters.studentId);
      }
      if (filters.status) {
        query += ' AND ar.status = ?';
        params.push(filters.status);
      }
      if (filters.searchTerm) { // Cari berdasarkan nama siswa atau NIS
        query += ' AND (s.name LIKE ? OR s.nis LIKE ?)';
        params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
      }

      query += ' ORDER BY ar.created_at DESC';
      return db.all(query, ...params);
    };

    // Fungsi untuk mendapatkan status absensi per siswa untuk tanggal tertentu
    export const getStudentAttendanceStatusForDate = async (studentId, date) => {
      const db = getDb();
      return db.get(
        'SELECT status, time_in, notes FROM attendance_records WHERE student_id = ? AND date = ?',
        studentId, date
      );
    };

    // Fungsi untuk mendapatkan semua siswa dari suatu kelas
    export const getStudentsByClass = async (className) => {
      const db = getDb();
      return db.all('SELECT id, name, nis, class, gender FROM students WHERE class = ?', className);
    };
    