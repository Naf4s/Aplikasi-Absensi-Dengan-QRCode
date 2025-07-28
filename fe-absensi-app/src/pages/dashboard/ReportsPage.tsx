import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
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
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';
import {
  StatisticsCards,
  AttendanceCharts,
  ReportFilters,
  AttendanceTable,
  ReportActions,
  calculateAttendanceStatistics,
  generateTextReport,
  downloadTextReport,
  generateExcelReport,
  printReport
} from '../../components/report';
import type { AttendanceRecord, AttendanceStatistics, MonthData } from '../../components/report';

interface ClassItem {
  id: string;
  name: string;
}

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

const monthsData: MonthData[] = [
  { value: '01', name: 'Januari' }, { value: '02', name: 'Februari' }, { value: '03', name: 'Maret' },
  { value: '04', name: 'April' }, { value: '05', name: 'Mei' }, { value: '06', name: 'Juni' },
  { value: '07', name: 'Juli' }, { value: '08', name: 'Agustus' }, { value: '09', name: 'September' },
  { value: '10', name: 'Oktober' }, { value: '11', name: 'November' }, { value: '12', name: 'Desember' },
];



const ReportsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]); // Data detail absensi dari backend
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterMonthYear, setFilterMonthYear] = useState<string>(new Date().toISOString().substring(0, 7)); // Format YYYY-MM
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');

  // State untuk daftar kelas dinamis
  const [classList, setClassList] = useState<ClassItem[]>([]);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i)); // Current year and 4 previous years

  // State untuk tahun ajaran dan semester
  const [academicYear, setAcademicYear] = useState<string>('');
  const [semester, setSemester] = useState<string>('');

  // Ini Wajib Kamu Ingat! (Fungsi untuk Mengambil Data Laporan dari Backend)
  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {};
      if (filterClass) params.class = filterClass;

      const [year, month] = filterMonthYear.split('-');
      if (year && month) {
        params.year = year;
        params.month = month;
      }

      if (filterStatus) params.status = filterStatus;
      if (filterSearchTerm) params.searchTerm = filterSearchTerm;

      const response = await api.get('/attendance', { params }); // Endpoint: /api/attendance
      setAttendanceData(response.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      let msg = 'Gagal memuat laporan. Silakan coba lagi.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setAttendanceData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterClass, filterMonthYear, filterStatus, filterSearchTerm]);

  // Fungsi untuk mengambil daftar kelas dari backend
  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/classes');
      setClassList(response.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      // Tidak set error utama agar tidak menimpa error laporan
    }
  }, []);

  // Fungsi untuk mengambil pengaturan tahun ajaran dan semester
  const fetchSettings = useCallback(async () => {
    try {
      const response = await api.get('/settings');
      const settings = response.data;
      const yearSetting = settings.find((s: any) => s.key === 'current_academic_year');
      const semesterSetting = settings.find((s: any) => s.key === 'current_semester');

      if (yearSetting) setAcademicYear(yearSetting.value);
      if (semesterSetting) setSemester(semesterSetting.value);

    } catch (error) {
      console.error("Gagal memuat pengaturan untuk laporan:", error);
      // Tidak set error utama agar tidak menimpa error laporan
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // useEffect untuk mengambil data kelas saat komponen dimuat
  useEffect(() => {
    fetchClasses();
    fetchSettings();
  }, [fetchClasses]);

  // Hitung statistik menggunakan utility function
  const statistics = calculateAttendanceStatistics(attendanceData, filterMonthYear);

  // Handle report download (plain text)
  const handleDownloadReport = () => {
    const reportContent = generateTextReport(attendanceData, statistics, filterClass, filterMonthYear, monthsData);
    downloadTextReport(reportContent, filterClass, filterMonthYear);
  };

  // Handle report printing
  const handlePrintReport = () => {
    printReport(attendanceData, statistics, filterClass, filterMonthYear, monthsData, user, academicYear, semester);
  };

  // Handle Excel export
  const handleExportExcel = () => {
    generateExcelReport(attendanceData, statistics, filterClass, filterMonthYear, monthsData, academicYear, semester);
  };

  // Ini Wajib Kamu Ingat! (Kontrol Akses Frontend)
  // Hanya tampilkan halaman jika user memiliki permission 'view_attendance'.
  if (!hasPermission('view_attendance')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk melihat halaman laporan ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Laporan Absensi</h1>
        <ReportActions 
          onExportExcel={handleExportExcel}
          onPrintReport={handlePrintReport}
        />
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Section */}
      <ReportFilters
        filterClass={filterClass}
        setFilterClass={setFilterClass}
        filterMonthYear={filterMonthYear}
        setFilterMonthYear={setFilterMonthYear}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterSearchTerm={filterSearchTerm}
        setFilterSearchTerm={setFilterSearchTerm}
        onApplyFilters={fetchReports}
        onResetFilters={() => {
          setFilterClass('');
          setFilterMonthYear(new Date().toISOString().substring(0, 7));
          setFilterStatus('');
          setFilterSearchTerm('');
        }}
        classList={classList.map(c => c.name)} // Kirim array of strings
      />

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <StatisticsCards statistics={statistics} />

          {/* Charts */}
          <AttendanceCharts 
            attendanceData={attendanceData}
            statistics={statistics}
            user={user}
          />

          {/* Detailed Attendance Table */}
          <AttendanceTable 
            attendanceData={attendanceData}
            onPrintReport={handlePrintReport}
          />
        </>
      )}
    </div>
  );
};

export default ReportsPage;