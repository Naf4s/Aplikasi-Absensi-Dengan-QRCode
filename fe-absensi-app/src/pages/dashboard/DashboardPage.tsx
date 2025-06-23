import React from 'react';
import { Users, Clock, BookOpen, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Chart data
  const attendanceData = {
    labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    datasets: [
      {
        label: 'Hadir',
        data: [42, 40, 41, 39, 40, 38],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Izin',
        data: [2, 3, 1, 4, 3, 2],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Sakit',
        data: [1, 2, 3, 2, 2, 1],
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
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
        max: 50,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-primary-800 to-primary-900 text-white">
        <h1 className="text-xl font-semibold">Selamat Datang, {user?.name}</h1>
        <p className="mt-1 text-primary-100">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
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
              <p className="mt-1 text-2xl font-semibold text-gray-900">245</p>
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
              <p className="mt-1 text-2xl font-semibold text-gray-900">95%</p>
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
              <p className="mt-1 text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-700" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Waktu Absensi</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">07:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistik Kehadiran Mingguan</h3>
          <div className="h-64">
            <Line options={chartOptions} data={attendanceData} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Absensi</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Hadir</span>
                <span className="text-sm font-medium text-gray-700">87%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Izin</span>
                <span className="text-sm font-medium text-gray-700">8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-accent-500 h-2 rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Sakit</span>
                <span className="text-sm font-medium text-gray-700">4%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-warning-500 h-2 rounded-full" style={{ width: '4%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Tanpa Keterangan</span>
                <span className="text-sm font-medium text-gray-700">1%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-error-500 h-2 rounded-full" style={{ width: '1%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Aktivitas Terbaru</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-5 hover:bg-gray-50">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Siswa baru telah ditambahkan</p>
                <p className="text-sm text-gray-500">Ahmad Fauzi ditambahkan ke kelas 3A</p>
              </div>
              <div className="ml-auto text-xs text-gray-500">1 jam yang lalu</div>
            </div>
          </div>
          
          <div className="p-5 hover:bg-gray-50">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-secondary-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Absensi kelas 5B selesai</p>
                <p className="text-sm text-gray-500">38 hadir, 2 sakit, 1 izin</p>
              </div>
              <div className="ml-auto text-xs text-gray-500">2 jam yang lalu</div>
            </div>
          </div>
          
          <div className="p-5 hover:bg-gray-50">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-accent-100 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-accent-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Jadwal kelas diperbarui</p>
                <p className="text-sm text-gray-500">Jadwal pelajaran kelas 4A telah diperbarui</p>
              </div>
              <div className="ml-auto text-xs text-gray-500">5 jam yang lalu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;