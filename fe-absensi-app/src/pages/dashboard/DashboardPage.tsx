import React, { useState, useEffect, useCallback } from 'react'; // Tambah useState, useEffect, useCallback
import { Users, Clock, BookOpen, Check, AlertCircle } from 'lucide-react'; // Tambah AlertCircle
import { useAuth } from '../../contexts/AuthContext';
import { Line, Bar } from 'react-chartjs-2'; // Menggunakan Line dan Bar
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../../lib/api'; // Import instance Axios kita
import axios from 'axios';

// Register ChartJS components yang dibutuhkan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Ini Wajib Kamu Ingat! (Konsistensi Interface Data Dashboard dari Backend)
// Pastikan interface ini sesuai dengan struktur data yang dikembalikan oleh API /api/dashboard.
interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  attendanceStatsToday: {
    totalRecordsToday: number;
    uniquePresentStudentsToday: number;
    presentCount: number;
    absentCount: number;
    sickCount: number;
    permitCount: number;
    presencePercentage: string; // Dalam bentuk string persentase
  };
  weeklyAttendanceStats: {
    weeklyData: number[]; // Hadir
    weeklySick: number[];
    weeklyPermit: number[];
    weeklyAbsent: number[];
  };
  classComparisonStats: {
    class: string;
    present_percentage: number;
  }[];
  recentActivities: {
    type: string;
    message: string;
    time: string;
  }[];
}


const DashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ini Wajib Kamu Ingat! (Fungsi untuk Mengambil Data Dashboard dari Backend)
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/dashboard'); // Endpoint: /api/dashboard
      setDashboardData(response.data);
      console.log("Dashboard data fetched:", response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      let msg = 'Gagal memuat data dashboard. Silakan coba lagi.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Pastikan user memiliki permission untuk melihat dashboard (umumnya semua user login)
    // Jika tidak ada permission spesifik untuk dashboard, kita bisa langsung fetch.
    if (user) { // Hanya fetch jika user sudah login
      fetchDashboardData();
    } else {
      setIsLoading(false);
      setError('Anda perlu login untuk melihat dashboard.');
    }
  }, [user, fetchDashboardData]); // Dependensi user dan fetchDashboardData


  // Chart data (dihitung dari dashboardData yang asli)
  const attendanceTrendData = dashboardData ? {
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
    datasets: [
      {
        label: 'Hadir',
        data: dashboardData.weeklyAttendanceStats.weeklyData,
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Izin',
        data: dashboardData.weeklyAttendanceStats.weeklyPermit,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Sakit',
        data: dashboardData.weeklyAttendanceStats.weeklySick,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Absen', // Ganti label 'Tanpa Keterangan' menjadi 'Absen'
        data: dashboardData.weeklyAttendanceStats.weeklyAbsent,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
      },
    ],
  } : { labels: [], datasets: [] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Penting untuk Chart.js di div dengan tinggi tetap
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        // Max disesuaikan secara dinamis berdasarkan data tertinggi
        max: Math.max(...(dashboardData?.weeklyAttendanceStats.weeklyData || [0]), 
                      ...(dashboardData?.weeklyAttendanceStats.weeklySick || [0]),
                      ...(dashboardData?.weeklyAttendanceStats.weeklyPermit || [0]),
                      ...(dashboardData?.weeklyAttendanceStats.weeklyAbsent || [0]), 50), // Min 50 untuk skala
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  // Ringkasan Absensi (Progress Bars)
  // Calculate total marked attendance today based on uniquePresentStudentsToday and absentCount, sickCount, permitCount
  const totalMarkedToday = (dashboardData?.attendanceStatsToday.uniquePresentStudentsToday || 0) +
                          (dashboardData?.attendanceStatsToday.absentCount || 0) +
                          (dashboardData?.attendanceStatsToday.sickCount || 0) +
                          (dashboardData?.attendanceStatsToday.permitCount || 0);

  const getPercentage = (count: number) => {
    if (!totalMarkedToday || totalMarkedToday === 0) return 0;
    return parseFloat(((count / totalMarkedToday) * 100).toFixed(1));
  };

  const presentPercentage = getPercentage(dashboardData?.attendanceStatsToday.uniquePresentStudentsToday || 0);
  const absentPercentage = getPercentage(dashboardData?.attendanceStatsToday.absentCount || 0);
  const sickPercentage = getPercentage(dashboardData?.attendanceStatsToday.sickCount || 0);
  const permitPercentage = getPercentage(dashboardData?.attendanceStatsToday.permitCount || 0);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Terjadi Kesalahan</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) { // Jika tidak ada data dan tidak ada error (misal, belum terload)
    return (
        <div className="flex items-center justify-center min-h-[60vh] text-center text-gray-600">
            <h2 className="text-xl font-semibold mb-2">Tidak ada data dashboard yang tersedia.</h2>
            <p>Pastikan backend berjalan dan Anda memiliki akses.</p>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-primary-800 to-primary-900 text-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Selamat Datang, {user?.name || user?.email}</h1>
          <p className="mt-1 text-primary-100">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-white text-primary-800 font-semibold px-4 py-2 rounded shadow hover:bg-primary-100 transition"
          aria-label="Refresh Dashboard Data"
          title="Refresh Dashboard Data"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Siswa</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{dashboardData.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-secondary-100 flex items-center justify-center">
              <Check className="h-5 w-5 text-secondary-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Kehadiran Hari Ini</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {dashboardData.totalStudents > 0
                  ? ((dashboardData.attendanceStatsToday.uniquePresentStudentsToday / dashboardData.totalStudents) * 100).toFixed(2)
                  : '0.00'}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-accent-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-accent-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Jumlah Kelas</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{dashboardData.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Absensi Hari Ini</h3>
              <p className="mt-1 text-xl">
                <span className="font-bold">{dashboardData.attendanceStatsToday.uniquePresentStudentsToday}</span> hadir dari <span className="font-bold">{dashboardData.totalStudents}</span> siswa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistik Kehadiran Mingguan (Jumlah Absen Tercatat)</h3>
          <div className="h-64">
            {/* Ini Wajib Kamu Ingat! (Tinggi Chart Dinamis) */}
            {/* Pastikan parent div memiliki tinggi (misal h-64) agar chart bisa responsive. */}
            <Line options={chartOptions} data={attendanceTrendData} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Absensi Hari Ini</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Hadir</span>
                <span className="text-sm font-medium text-gray-700">{presentPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-success-600 h-2 rounded-full" style={{ width: `${presentPercentage}%` }}></div> {/* Ganti primary-600 ke success-600 */}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Izin</span>
                <span className="text-sm font-medium text-gray-700">{permitPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-warning-500 h-2 rounded-full" style={{ width: `${permitPercentage}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Sakit</span>
                <span className="text-sm font-medium text-gray-700">{sickPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${sickPercentage}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Tanpa Keterangan</span>
                <span className="text-sm font-medium text-gray-700">{absentPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-error-500 h-2 rounded-full" style={{ width: `${absentPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Comparison Chart (Hanya untuk Admin) */}
      {user?.role === 'admin' && dashboardData.classComparisonStats && (
        <div className="card p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Perbandingan Kehadiran Antar Kelas (Rata-rata Persentase)</h3>
          <div className="h-64">
            <Bar
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    max: 100, // Karena ini persentase
                    ticks: { stepSize: 10 }
                  }
                }
              }}
              data={{
                labels: dashboardData.classComparisonStats.map(stat => stat.class),
                datasets: [
                  {
                    label: 'Rata-rata Kehadiran (%)',
                    data: dashboardData.classComparisonStats.map(stat => stat.present_percentage),
                    backgroundColor: 'rgba(37, 99, 235, 0.6)',
                    borderColor: 'rgb(37, 99, 235)',
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </div>
        </div>
      )}


      {/* Recent Activities */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Aktivitas Terbaru</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {(!dashboardData.recentActivities || dashboardData.recentActivities.length === 0) ? (
            <div className="p-5 text-center text-gray-500">
              Tidak ada aktivitas terbaru.
            </div>
          ) : (
            dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className="p-5 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full ${
                    activity.type === 'student' ? 'bg-primary-100 text-primary-700' :
                    activity.type === 'attendance' ? 'bg-secondary-100 text-secondary-700' :
                    activity.type === 'class' ? 'bg-accent-100 text-accent-700' :
                    'bg-gray-100 text-gray-700'
                  } flex items-center justify-center`}>
                    {activity.type === 'student' && <Users className="h-4 w-4" />}
                    {activity.type === 'attendance' && <Check className="h-4 w-4" />}
                    {activity.type === 'class' && <BookOpen className="h-4 w-4" />}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
