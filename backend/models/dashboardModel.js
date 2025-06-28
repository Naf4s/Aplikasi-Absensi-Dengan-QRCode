// backend/models/dashboardModel.js
import { getDb } from '../utils/database.js';

// Ini Wajib Kamu Ingat! (Agregasi Data di Model)
// Model ini bertanggung jawab untuk mengambil data mentah dan melakukan agregasi
// yang dibutuhkan untuk statistik dashboard.

/**
 * Mengambil total jumlah siswa.
 * @returns {Promise<number>} Jumlah total siswa.
 */
export const getTotalStudents = async () => {
  const db = getDb();
  const result = await db.get('SELECT COUNT(id) as total FROM students');
  return result.total;
};

/**
 * Mengambil total jumlah kelas.
 * @returns {Promise<number>} Jumlah total kelas.
 */
export const getTotalClasses = async () => {
  const db = getDb();
  const result = await db.get('SELECT COUNT(id) as total FROM classes');
  return result.total;
};

/**
 * Mengambil statistik kehadiran untuk tanggal tertentu.
 * @param {string} date Tanggal dalam format YYYY-MM-DD.
 * @returns {Promise<object>} Objek statistik kehadiran.
 */
export const getAttendanceStatsForDate = async (date) => {
  const db = getDb();
  // Menghitung status unik per siswa per hari. Ini bisa kompleks.
  // Sederhana: hitung total record 'present' untuk hari ini, lalu total unique student yang hadir.
  
  // Total absensi tercatat hari ini
  const totalRecordsToday = await db.get(
    'SELECT COUNT(id) as total FROM attendance_records WHERE date = ?', date
  );

  // Total siswa yang hadir unik hari ini
  const uniquePresentStudentsToday = await db.get(
    'SELECT COUNT(DISTINCT student_id) as total FROM attendance_records WHERE date = ? AND status = ?', date, 'present'
  );

  // Total siswa unik yang seharusnya absen (jika ada data total siswa per kelas)
  // Untuk sementara, kita pakai persentase dari yang tercatat saja.
  const totalStudentsInSystem = await getTotalStudents();
  
  const presentCount = await db.get('SELECT COUNT(id) as count FROM attendance_records WHERE date = ? AND status = "present"', date);
  const absentCount = await db.get('SELECT COUNT(id) as count FROM attendance_records WHERE date = ? AND status = "absent"', date);
  const sickCount = await db.get('SELECT COUNT(id) as count FROM attendance_records WHERE date = ? AND status = "sick"', date);
  const permitCount = await db.get('SELECT COUNT(id) as count FROM attendance_records WHERE date = ? AND status = "permit"', date);

  return {
    totalStudentsInSystem: totalStudentsInSystem || 0,
    totalRecordsToday: totalRecordsToday.total || 0,
    uniquePresentStudentsToday: uniquePresentStudentsToday.total || 0,
    presentCount: presentCount.count || 0,
    absentCount: absentCount.count || 0,
    sickCount: sickCount.count || 0,
    permitCount: permitCount.count || 0,
  };
};

/**
 * Mengambil data kehadiran mingguan untuk chart.
 * @param {string} year Bulan dalam format YYYY.
 * @param {string} month Bulan dalam format MM.
 * @returns {Promise<Array>} Array berisi data kehadiran per minggu.
 */
export const getWeeklyAttendanceStats = async (year, month) => {
  const db = getDb();
  // Ini Wajib Kamu Ingat! (Agregasi Data SQL untuk Chart)
  // Kita akan mengambil semua data absensi untuk bulan tertentu,
  // lalu mengelompokkannya per minggu di sisi backend.

  // Contoh data dari database: [ { student_id, date, status } ]
  // Query untuk mendapatkan semua record di bulan dan tahun tertentu
  const records = await db.all(`
    SELECT date, status
    FROM attendance_records
    WHERE STRFTIME('%Y', date) = ? AND STRFTIME('%m', date) = ?
    ORDER BY date ASC
  `, year, month);

  const weeklyData = [0, 0, 0, 0]; // Hadir
  const weeklySick = [0, 0, 0, 0]; // Sakit
  const weeklyPermit = [0, 0, 0, 0]; // Izin
  const weeklyAbsent = [0, 0, 0, 0]; // Absen

  records.forEach(record => {
    const dayOfMonth = new Date(record.date).getDate();
    let weekIndex = Math.floor((dayOfMonth - 1) / 7);
    if (weekIndex > 3) weekIndex = 3; // Batasi hingga 4 minggu

    if (record.status === 'present') weeklyData[weekIndex]++;
    else if (record.status === 'sick') weeklySick[weekIndex]++;
    else if (record.status === 'permit') weeklyPermit[weekIndex]++;
    else if (record.status === 'absent') weeklyAbsent[weekIndex]++;
  });

  return { weeklyData, weeklySick, weeklyPermit, weeklyAbsent };
};

/**
 * Mengambil statistik perbandingan antar kelas.
 * @param {string} year Bulan dalam format YYYY.
 * @param {string} month Bulan dalam format MM.
 * @returns {Promise<Array>} Array berisi data persentase kehadiran per kelas.
 */
export const getClassComparisonStats = async (year, month) => {
  const db = getDb();
  // Ini Wajib Kamu Ingat! (Agregasi Data SQL untuk Perbandingan Kelas)
  // Query ini sedikit lebih kompleks karena harus menghitung total dan hadir per kelas.
  const stats = await db.all(`
    SELECT 
      s.class, 
      COUNT(ar.id) as total_records,
      SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_records
    FROM attendance_records ar
    JOIN students s ON ar.student_id = s.id
    WHERE STRFTIME('%Y', ar.date) = ? AND STRFTIME('%m', ar.date) = ?
    GROUP BY s.class
    ORDER BY s.class COLLATE NOCASE
  `, year, month);

  return stats.map(stat => ({
    class: stat.class,
    present_percentage: stat.total_records > 0 ? (stat.present_records / stat.total_records) * 100 : 0
  }));
};
