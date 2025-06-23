import React, { useState, useRef } from 'react';
import { Calendar, Download, Filter, Printer, Users, BarChart2, ChevronDown, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Line, Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
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

// Register ChartJS components
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

// Mock data for demonstration
const mockClasses = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
const mockMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];

const ReportsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [selectedClass, setSelectedClass] = useState(mockClasses[0]);
  const [selectedMonth, setSelectedMonth] = useState(mockMonths[5]);
  const [selectedReport, setSelectedReport] = useState<'attendance' | 'students'>('attendance');
  const reportRef = useRef<HTMLDivElement>(null);

  // Attendance trend data
  const attendanceTrendData = {
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
    datasets: [
      {
        label: 'Hadir',
        data: [95, 92, 94, 93],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
      {
        label: 'Sakit',
        data: [3, 5, 4, 4],
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
      },
      {
        label: 'Izin',
        data: [2, 2, 1, 2],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
      },
      {
        label: 'Tanpa Keterangan',
        data: [0, 1, 1, 1],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
    ],
  };

  // Class comparison data
  const classComparisonData = {
    labels: mockClasses,
    datasets: [
      {
        label: 'Rata-rata Kehadiran (%)',
        data: mockClasses.map(() => 85 + Math.random() * 10),
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  // Mock student attendance data
  const studentAttendanceData = Array.from({ length: 30 }, (_, i) => ({
    id: `S${String(i + 1).padStart(3, '0')}`,
    name: `Siswa ${i + 1}`,
    present: Math.floor(Math.random() * 5 + 15),
    sick: Math.floor(Math.random() * 2),
    permit: Math.floor(Math.random() * 2),
    absent: Math.floor(Math.random() * 1),
  }));

  // Handle report download
  const handleDownloadReport = () => {
    const reportTitle = `Laporan_Kehadiran_${selectedClass}_${selectedMonth}_${new Date().getFullYear()}`;
    const reportContent = `
      LAPORAN KEHADIRAN SISWA
      SD N 1 Bumirejo
      
      Kelas: ${selectedClass}
      Bulan: ${selectedMonth}
      
      Statistik Kehadiran:
      - Total Siswa: 42
      - Rata-rata Kehadiran: 93.5%
      - Ketidakhadiran: 6.5%
      - Hari Efektif: 21
      
      Detail Kehadiran:
      ${studentAttendanceData.map(student => 
        `${student.name} (${student.id}):
         Hadir: ${student.present}, Sakit: ${student.sick}, Izin: ${student.permit}, Tanpa Ket: ${student.absent}`
      ).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Handle report printing
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Kehadiran - Kelas ${selectedClass}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN KEHADIRAN SISWA</h1>
            <h2>SD N 1 Bumirejo</h2>
            <p>Kelas: ${selectedClass} | Bulan: ${selectedMonth} ${new Date().getFullYear()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>ID Siswa</th>
                <th>Nama</th>
                <th>Hadir</th>
                <th>Sakit</th>
                <th>Izin</th>
                <th>Tanpa Keterangan</th>
                <th>Persentase</th>
              </tr>
            </thead>
            <tbody>
              ${studentAttendanceData.map(student => {
                const total = student.present + student.sick + student.permit + student.absent;
                const percentage = ((student.present / total) * 100).toFixed(1);
                return `
                  <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.present}</td>
                    <td>${student.sick}</td>
                    <td>${student.permit}</td>
                    <td>${student.absent}</td>
                    <td>${percentage}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  // Handle Excel export
  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet format
    const wsData = [
      ['LAPORAN KEHADIRAN SISWA'],
      ['SD N 1 Bumirejo'],
      [],
      [`Kelas: ${selectedClass}`],
      [`Bulan: ${selectedMonth} ${new Date().getFullYear()}`],
      [],
      ['ID Siswa', 'Nama', 'Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Persentase'],
      ...studentAttendanceData.map(student => {
        const total = student.present + student.sick + student.permit + student.absent;
        const percentage = ((student.present / total) * 100).toFixed(1);
        return [
          student.id,
          student.name,
          student.present,
          student.sick,
          student.permit,
          student.absent,
          `${percentage}%`
        ];
      })
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = [
      { wch: 10 }, // ID
      { wch: 20 }, // Nama
      { wch: 8 },  // Hadir
      { wch: 8 },  // Sakit
      { wch: 8 },  // Izin
      { wch: 15 }, // Tanpa Keterangan
      { wch: 10 }  // Persentase
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, ws, 'Laporan Kehadiran');

    // Generate Excel file
    const filename = `Laporan_Kehadiran_${selectedClass}_${selectedMonth}_${new Date().getFullYear()}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Laporan</h1>
        
        <div className="flex items-center space-x-2">
          {user?.role === 'admin' && (
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as 'attendance' | 'students')}
              className="form-input"
            >
              <option value="attendance">Laporan Kehadiran</option>
              <option value="students">Laporan Siswa</option>
            </select>
          )}
          
          <button 
            className="btn-primary flex items-center"
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Unduh Laporan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-input"
            >
              {mockClasses.map((cls) => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-input"
            >
              {mockMonths.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-500">Total Siswa</div>
            <Users className="h-5 w-5 text-primary-500" />
          </div>
          <div className="text-2xl font-semibold">42</div>
          <div className="text-sm text-gray-500 mt-1">Kelas {selectedClass}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-500">Rata-rata Kehadiran</div>
            <BarChart2 className="h-5 w-5 text-success-500" />
          </div>
          <div className="text-2xl font-semibold">93.5%</div>
          <div className="text-sm text-success-500 mt-1">↑ 2.1% dari bulan lalu</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-500">Ketidakhadiran</div>
            <BarChart2 className="h-5 w-5 text-warning-500" />
          </div>
          <div className="text-2xl font-semibold">6.5%</div>
          <div className="text-sm text-warning-500 mt-1">↓ 1.2% dari bulan lalu</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-500">Hari Efektif</div>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-2xl font-semibold">21</div>
          <div className="text-sm text-gray-500 mt-1">Hari</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tren Kehadiran</h3>
          <div className="h-80">
            <Line options={chartOptions} data={attendanceTrendData} />
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Perbandingan Antar Kelas</h3>
            <div className="h-80">
              <Bar options={chartOptions} data={classComparisonData} />
            </div>
          </div>
        )}
      </div>

      {/* Detailed Report */}
      <div className="bg-white rounded-lg shadow overflow-hidden" ref={reportRef}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Detail Kehadiran Siswa
          </h3>
          <div className="flex items-center space-x-2">
            <button className="btn-outline flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button 
              className="btn-outline flex items-center"
              onClick={handlePrintReport}
            >
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </button>
            <button 
              className="btn-outline flex items-center"
              onClick={handleExportExcel}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Siswa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hadir
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sakit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Izin
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanpa Keterangan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persentase
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentAttendanceData.map((student) => {
                const total = student.present + student.sick + student.permit + student.absent;
                const percentage = ((student.present / total) * 100).toFixed(1);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success-700">
                      {student.present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-warning-700">
                      {student.sick}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-700">
                      {student.permit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-error-700">
                      {student.absent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {percentage}%
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700">
            Menampilkan {studentAttendanceData.length} siswa
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;