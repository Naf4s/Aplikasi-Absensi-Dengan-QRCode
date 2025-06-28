// backend/controllers/dashboardController.js
import * as dashboardModel from '../models/dashboardModel.js';

// Ini Wajib Kamu Ingat! (Otorisasi di Controller)
// Pastikan hanya user yang diizinkan (admin/teacher) yang bisa melihat dashboard.

export const getDashboardStats = async (req, res) => {
  try {
    // Basic authorization: user harus login untuk melihat dashboard
    if (!req.user) {
      return res.status(401).json({ message: 'Tidak terotentikasi.' });
    }

    const today = new Date().toISOString().split('T')[0]; // Tanggal hari ini YYYY-MM-DD
    const currentMonth = new Date().toISOString().substring(5, 7); // MM
    const currentYear = new Date().toISOString().substring(0, 4); // YYYY

    // Ambil data dari model
    const totalStudents = await dashboardModel.getTotalStudents();
    const totalClasses = await dashboardModel.getTotalClasses();
    const attendanceStatsToday = await dashboardModel.getAttendanceStatsForDate(today);
    const weeklyAttendanceStats = await dashboardModel.getWeeklyAttendanceStats(currentYear, currentMonth);
    const classComparisonStats = await dashboardModel.getClassComparisonStats(currentYear, currentMonth);

    // Hitung persentase kehadiran hari ini
    const totalStudentsMarkedToday = attendanceStatsToday.presentCount + attendanceStatsToday.absentCount + attendanceStatsToday.sickCount + attendanceStatsToday.permitCount;
    const todayPresencePercentage = totalStudentsMarkedToday > 0 
      ? ((attendanceStatsToday.presentCount / totalStudentsMarkedToday) * 100).toFixed(2) 
      : '0.00';

    // Kirim semua data yang dibutuhkan frontend
    res.status(200).json({
      totalStudents,
      totalClasses,
      attendanceStatsToday: {
        ...attendanceStatsToday,
        presencePercentage: todayPresencePercentage
      },
      weeklyAttendanceStats,
      classComparisonStats,
      // Kamu bisa tambahkan 'recentActivities' di sini jika ada model untuk itu
      recentActivities: [
        // Dummy data for now, actual data would come from a database log/activity table
        { type: 'student', message: 'Siswa baru telah ditambahkan: Ahmad Fauzi ke kelas 3A', time: '1 jam yang lalu' },
        { type: 'attendance', message: 'Absensi kelas 5B selesai: 38 hadir, 2 sakit, 1 izin', time: '2 jam yang lalu' },
        { type: 'class', message: 'Jadwal kelas diperbarui: Kelas 4A', time: '5 jam yang lalu' },
      ]
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil data dashboard.' });
  }
};
