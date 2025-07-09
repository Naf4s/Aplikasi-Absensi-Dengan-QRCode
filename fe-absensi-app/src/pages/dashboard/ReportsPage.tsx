import React, { useState, useEffect, useCallback } from 'react';
import { Download, Filter, Printer, Users, BarChart2, Calendar, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
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
import * as XLSX from 'xlsx';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
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

// Ini Wajib Kamu Ingat! (Konsistensi Interface Data Absensi)
// Interface ini harus sesuai dengan struktur data yang dikembalikan oleh API absensi backendmu.
interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  nis: string;
  class: string;
  gender: 'L' | 'P';
  date: string;
  time_in?: string;
  status: 'present' | 'absent' | 'sick' | 'permit';
  notes?: string;
  marked_by_user_id?: string;
  marked_by_user_name?: string;
  created_at: string;
}

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

  // States untuk laporan
  const [reportType, setReportType] = useState<'attendance' | 'students'>('attendance'); // Default to attendance report

  // Mock data untuk dropdown kelas (jika tidak ada API kelas)
  const classList = ['1', '2', '3', '4', '5', '6',];
  const monthsData = [
    { value: '01', name: 'Januari' }, { value: '02', name: 'Februari' }, { value: '03', name: 'Maret' },
    { value: '04', name: 'April' }, { value: '05', name: 'Mei' }, { value: '06', name: 'Juni' },
    { value: '07', name: 'Juli' }, { value: '08', name: 'Agustus' }, { value: '09', name: 'September' },
    { value: '10', name: 'Oktober' }, { value: '11', name: 'November' }, { value: '12', name: 'Desember' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i)); // Current year and 4 previous years

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

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // --- LOGIKA PERHITUNGAN STATISTIK DARI ATTENDANCEDATA ---
  const uniqueStudents = Array.from(new Set(attendanceData.map(record => record.student_id)))
    .map(id => attendanceData.find(record => record.student_id === id)!);

  // Hitung jumlah status per siswa (untuk tabel detail)
  const studentSummary: { [key: string]: { name: string, nis: string, class: string, present: number, absent: number, sick: number, permit: number } } = {};
  attendanceData.forEach(record => {
    if (!studentSummary[record.student_id]) {
      studentSummary[record.student_id] = {
        name: record.student_name,
        nis: record.nis,
        class: record.class,
        present: 0,
        absent: 0,
        sick: 0,
        permit: 0
      };
    }
    if (record.status === 'present') studentSummary[record.student_id].present++;
    else if (record.status === 'absent') studentSummary[record.student_id].absent++;
    else if (record.status === 'sick') studentSummary[record.student_id].sick++;
    else if (record.status === 'permit') studentSummary[record.student_id].permit++;
  });

  const summarizedStudents = Object.values(studentSummary);

  // Hitung metrik laporan utama
  const totalReportedStudents = summarizedStudents.length;
  const totalDaysInMonth = new Date(parseInt(filterMonthYear.substring(0, 4)), parseInt(filterMonthYear.substring(5, 7)), 0).getDate(); // Jumlah hari di bulan yang dipilih
  const totalPossibleAttendances = totalReportedStudents * totalDaysInMonth; // Asumsi setiap siswa harus absen setiap hari

  const totalPresentCount = summarizedStudents.reduce((sum, s) => sum + s.present, 0);
  const totalAbsentCount = summarizedStudents.reduce((sum, s) => sum + s.absent, 0);
  const totalSickCount = summarizedStudents.reduce((sum, s) => sum + s.sick, 0);
  const totalPermitCount = summarizedStudents.reduce((sum, s) => sum + s.permit, 0);
  const totalOverallAttendance = totalPresentCount + totalAbsentCount + totalSickCount + totalPermitCount;

  const averagePresencePercentage = totalOverallAttendance > 0 ? ((totalPresentCount / totalOverallAttendance) * 100).toFixed(2) : '0.00';
  const absencePercentage = totalOverallAttendance > 0 ? (((totalAbsentCount + totalSickCount + totalPermitCount) / totalOverallAttendance) * 100).toFixed(2) : '0.00';

  // Ini Wajib Kamu Ingat! (Data Chart Dinamis)
  // Hitung data untuk chart berdasarkan attendanceData
  const getWeeklyAttendanceData = () => {
    const weeklyData = [0, 0, 0, 0]; // Minggu 1, 2, 3, 4
    const weeklySick = [0, 0, 0, 0];
    const weeklyPermit = [0, 0, 0, 0];
    const weeklyAbsent = [0, 0, 0, 0];

    attendanceData.forEach(record => {
      const dayOfMonth = new Date(record.date).getDate();
      let weekIndex = Math.floor((dayOfMonth - 1) / 7);
      if (weekIndex > 3) weekIndex = 3; // Pastikan hanya 4 minggu

      if (record.status === 'present') weeklyData[weekIndex]++;
      else if (record.status === 'sick') weeklySick[weekIndex]++;
      else if (record.status === 'permit') weeklyPermit[weekIndex]++;
      else if (record.status === 'absent') weeklyAbsent[weekIndex]++;
    });

    return {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      datasets: [
        {
          label: 'Hadir',
          data: weeklyData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
        },
        {
          label: 'Sakit',
          data: weeklySick,
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
        },
        {
          label: 'Izin',
          data: weeklyPermit,
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.5)',
        },
        {
          label: 'Tanpa Keterangan',
          data: weeklyAbsent,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
        },
      ],
    };
  };

  const attendanceTrendData = getWeeklyAttendanceData();

  const getClassComparisonData = () => {
    const classAttendance: { [key: string]: { total: number, present: number } } = {};
    attendanceData.forEach(record => {
      if (!classAttendance[record.class]) {
        classAttendance[record.class] = { total: 0, present: 0 };
      }
      classAttendance[record.class].total++;
      if (record.status === 'present') {
        classAttendance[record.class].present++;
      }
    });

    const labels = Object.keys(classAttendance).sort();
    const data = labels.map(cls => {
      const total = classAttendance[cls].total;
      const present = classAttendance[cls].present;
      return total > 0 ? parseFloat(((present / total) * 100).toFixed(2)) : 0;
    });

    return {
      labels: labels,
      datasets: [
        {
          label: 'Rata-rata Kehadiran (%)',
          data: data,
          backgroundColor: 'rgba(37, 99, 235, 0.5)',
          borderColor: 'rgb(37, 99, 235)',
          borderWidth: 1,
        },
      ],
    };
  };

  const classComparisonData = getClassComparisonData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        // text will be set in Line/Bar component
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Because this is percentage
        title: {
          display: true,
          text: 'Persentase (%)'
        }
      },
    },
  };
  // --- AKHIR LOGIKA PERHITUNGAN STATISTIK ---

  // Handle report download (plain text)
  const handleDownloadReport = () => {
    const reportTitle = `Laporan_Absensi_${filterClass || 'Semua'}_${filterMonthYear.replace('-', '_')}`;
    let reportContent = `
      LAPORAN ABSENSI SISWA
      SD N 1 Bumirejo

      Kelas: ${filterClass || 'Semua'}
      Bulan: ${monthsData.find(m => m.value === filterMonthYear.substring(5, 7))?.name} ${filterMonthYear.substring(0, 4)}

      Statistik Kehadiran:
      - Total Siswa Terdata: ${totalReportedStudents}
      - Rata-rata Kehadiran: ${averagePresencePercentage}%
      - Total Ketidakhadiran: ${absencePercentage}%
      - Total Hari Absensi Tercatat: ${totalOverallAttendance}

      Detail Kehadiran:
    `;

    summarizedStudents.forEach(student => {
      const total = student.present + student.sick + student.permit + student.absent;
      const percentage = total > 0 ? ((student.present / total) * 100).toFixed(1) : '0.0';
      reportContent += `
      - ${student.name} (NIS: ${student.nis}, Kelas: ${student.class}):
        Hadir: ${student.present}, Sakit: ${student.sick}, Izin: ${student.permit}, Tanpa Ket: ${student.absent}, Hadir: ${percentage}%
      `;
    });

    // Tambahkan detail catatan kehadiran per record dengan format yang lebih rapi
    reportContent += `\n\nDetail Kehadiran Siswa:\n`;
    reportContent += `Tanggal\tNIS\tNama Siswa\tKelas\tStatus\tJam Masuk\tKeterangan\tDicatat Oleh\n`;
    attendanceData.forEach(record => {
      const statusText = record.status === 'present' ? 'Hadir' :
        record.status === 'absent' ? 'Tanpa Keterangan' :
        record.status === 'sick' ? 'Sakit' : 'Izin';
      const notesText = (() => {
        if (record.status === 'present') {
          return record.time_in && record.time_in > '07:30:00' ? '⏰ Terlambat' : '✅ Hadir Tepat Waktu';
        } else if (record.status === 'absent') {
          return '❌ Tanpa Keterangan';
        } else if (record.status === 'sick') {
          return record.notes ? `🤒 Sakit - ${record.notes}` : '🤒 Sakit';
        } else if (record.status === 'permit') {
          return record.notes ? `📄 Izin - ${record.notes}` : '📄 Izin';
        } else {
          return '-';
        }
      })();
      reportContent += `${new Date(record.date).toLocaleDateString('id-ID')}\t${record.nis}\t${record.student_name}\t${record.class}\t${statusText}\t${record.time_in || '-'}\t${notesText}\t${record.marked_by_user_name || '-'}\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
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
      const styles = `
        body { font-family: Arial, sans-serif; padding: 20px; color: #1f2937; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th, td { border: 1px solid #9ca3af; padding: 8px; text-align: left; }
        th { background-color: #4f46e5; color: white; }
        tbody tr:nth-child(even) { background-color: #f3f4f6; }
        .header { text-align: center; margin-bottom: 20px; }
        .summary-card { border: 1px solid #d1d5db; padding: 15px; margin-bottom: 15px; display: inline-block; width: 23%; box-sizing: border-box; vertical-align: top; background-color: #e0e7ff; border-radius: 6px; }
        .chart-container { width: 48%; display: inline-block; vertical-align: top; margin: 1%; }
        @media print {
            .hidden-print { display: none !important; }
            .chart-canvas { max-width: 100% !important; height: auto !important; }
            .page-break { page-break-after: always; }
        }
      `;

      let tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>NIS</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Status</th>
              <th>Jam Masuk</th>
              <th>Keterangan</th>
              <th>Dicatat Oleh</th>
            </tr>
          </thead>
          <tbody>
            ${attendanceData.length === 0 ? `
              <tr><td colspan="8" style="text-align:center;">Tidak ada data laporan absensi.</td></tr>
            ` : attendanceData.map(record => `
              <tr>
                <td>${new Date(record.date).toLocaleDateString('id-ID')}</td>
                <td>${record.nis}</td>
                <td>${record.student_name}</td>
                <td>${record.class}</td>
                <td>${record.status === 'present' ? 'Hadir' : record.status === 'absent' ? 'Tanpa Keterangan' : record.status === 'sick' ? 'Sakit' : 'Izin'}</td>
                <td>${record.time_in || '-'}</td>
                <td>${record.notes || '-'}</td>
                <td>${record.marked_by_user_name || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      let chartsHtml = '';
      // For print, we'll represent chart data as text description for simplicity.
      chartsHtml += `
        <h3>Statistik Absensi (Grafik)</h3>
        <p>Distribusi Status Absensi: Hadir (${totalPresentCount}), Tanpa Keterangan (${totalAbsentCount}), Sakit (${totalSickCount}), Izin (${totalPermitCount})</p>
        <p>Tren Kehadiran per Minggu: (Lihat data tabel di bawah atau Unduh Excel untuk detail)</p>
        ${user?.role === 'admin' ? `<p>Perbandingan Kehadiran Antar Kelas: (Lihat data tabel di bawah atau Unduh Excel untuk detail)</p>` : ''}
      `;


      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Absensi - SD N 1 Bumirejo</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN ABSENSI SISWA</h1>
            <h2>SD N 1 Bumirejo</h2>
            <p>Periode: Bulan ${monthsData.find(m => m.value === filterMonthYear.substring(5, 7))?.name} ${filterMonthYear.substring(0, 4)} | Kelas: ${filterClass || 'Semua'}</p>
          </div>

          <div style="margin-bottom: 20px;">
              <h3 style="margin-bottom: 5px;">Ringkasan:</h3>
              <div class="summary-card">Total Siswa Terdata: <strong>${totalReportedStudents}</strong></div>
              <div class="summary-card">Rata-rata Kehadiran: <strong>${averagePresencePercentage}%</strong></div>
              <div class="summary-card">Total Ketidakhadiran: <strong>${absencePercentage}%</strong></div>
              <div class="summary-card">Total Hari Absensi Tercatat: <strong>${totalOverallAttendance}</strong></div>
          </div>

          ${chartsHtml}

          <h3>Detail Absensi:</h3>
          ${tableHtml}
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

    // --- Sheet: Ringkasan Statistik ---
    const summaryData = [
      ['LAPORAN ABSENSI SISWA'],
      ['SD N 1 Bumirejo'],
      [],
      [`Periode: Bulan ${monthsData.find(m => m.value === filterMonthYear.substring(5, 7))?.name} ${filterMonthYear.substring(0, 4)}`],
      [`Kelas: ${filterClass || 'Semua'}`],
      [],
      ['Metrik', 'Nilai'],
      ['Total Siswa Terdata', totalReportedStudents],
      ['Rata-rata Kehadiran (%)', averagePresencePercentage],
      ['Total Ketidakhadiran (%)', absencePercentage],
      ['Total Absensi Tercatat', totalOverallAttendance],
      ['Hadir', totalPresentCount],
      ['Tanpa Keterangan', totalAbsentCount],
      ['Sakit', totalSickCount],
      ['Izin', totalPermitCount],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

    // --- Sheet: Data Siswa ---
    const studentDataHeader = ['NIS', 'Nama Siswa', 'Kelas', 'Jenis Kelamin'];
    const studentData = uniqueStudents.map(s => [
      s.nis,
      s.student_name,
      s.class,
      s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    ]);
    const wsStudentData = XLSX.utils.aoa_to_sheet([studentDataHeader, ...studentData]);

    // Styling header row for student data sheet
    const rangeStudentData = XLSX.utils.decode_range(wsStudentData['!ref']!);
    for (let C = rangeStudentData.s.c; C <= rangeStudentData.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Header row index 0
      if (!wsStudentData[cellAddress]) continue;
      wsStudentData[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2563EB" } }, // Blue background
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
    // Set column widths for student data sheet
    wsStudentData['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 12 }
    ];

    // Styling header row for summary sheet
    const rangeSummary = XLSX.utils.decode_range(wsSummary['!ref']!);
    for (let C = rangeSummary.s.c; C <= rangeSummary.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 6, c: C }); // Header row index 6 (0-based)
      if (!wsSummary[cellAddress]) continue;
      wsSummary[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } }, // Indigo background
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
    // Set column widths for summary sheet
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan');
    XLSX.utils.book_append_sheet(workbook, wsStudentData, 'Data Siswa');

    // --- Sheet: Detail Absensi Siswa per Record ---
    const detailHeader = [
      'Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Status', 'Jam Masuk', 'Keterangan', 'Dicatat Oleh'
    ];
    const detailData = attendanceData.map(record => [
      new Date(record.date).toLocaleDateString('id-ID'),
      record.nis,
      record.student_name,
      record.class,
      record.status === 'present' ? 'Hadir' : record.status === 'absent' ? 'Tanpa Keterangan' : record.status === 'sick' ? 'Sakit' : 'Izin',
      record.time_in || '-',
      (() => {
        if (record.status === 'present') {
          return record.time_in && record.time_in > '07:30:00'
            ? '⏰ Terlambat'
            : '✅ Hadir Tepat Waktu';
        } else if (record.status === 'absent') {
          return '❌ Tanpa Keterangan';
        } else if (record.status === 'sick') {
          return record.notes ? `🤒 Sakit - ${record.notes}` : '🤒 Sakit';
        } else if (record.status === 'permit') {
          return record.notes ? `📄 Izin - ${record.notes}` : '📄 Izin';
        } else {
          return '-';
        }
      })(),
      record.marked_by_user_name || '-',
    ]);
    const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailData]);

    // Styling header row for detail sheet
    const rangeDetail = XLSX.utils.decode_range(wsDetail['!ref']!);
    for (let C = rangeDetail.s.c; C <= rangeDetail.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Header row index 0
      if (!wsDetail[cellAddress]) continue;
      wsDetail[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2563EB" } }, // Blue background
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
    // Set column widths for detail sheet
    wsDetail['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 25 },
      { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 20 }
    ];

    // Format date column as date type
    for (let R = 1; R <= detailData.length; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 1 }); // Date column index 1
      if (wsDetail[cellAddress]) {
        wsDetail[cellAddress].t = 'd';
        wsDetail[cellAddress].z = XLSX.SSF._table[14]; // Date format 'm/d/yy'
        wsDetail[cellAddress].v = new Date(wsDetail[cellAddress].v);
      }
    }

    XLSX.utils.book_append_sheet(workbook, wsDetail, 'Detail Absensi');

    // --- Sheet: Ringkasan Siswa (Hadir, Sakit, Izin, Absen) ---
    const summaryStudentHeader = ['NIS', 'Nama Siswa', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Persentase Hadir (%)'];
    const summaryStudentData = summarizedStudents.map(s => {
      const total = s.present + s.sick + s.permit + s.absent;
      const percentage = total > 0 ? ((s.present / total) * 100).toFixed(1) : '0.0';
      return [s.nis, s.name, s.class, s.present, s.sick, s.permit, s.absent, percentage];
    });
    const wsStudentSummary = XLSX.utils.aoa_to_sheet([summaryStudentHeader, ...summaryStudentData]);

    // Styling header row for student summary sheet
    const rangeStudent = XLSX.utils.decode_range(wsStudentSummary['!ref']!);
    for (let C = rangeStudent.s.c; C <= rangeStudent.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Header row index 0
      if (!wsStudentSummary[cellAddress]) continue;
      wsStudentSummary[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "059669" } }, // Emerald green background
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
    // Set column widths for student summary sheet
    wsStudentSummary['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, wsStudentSummary, 'Ringkasan Siswa');

    // Freeze header rows in all sheets
    wsSummary['!freeze'] = { xSplit: 0, ySplit: 7 };
    wsDetail['!freeze'] = { xSplit: 0, ySplit: 1 };
    wsStudentSummary['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Generate Excel file
    const filename = `Laporan_Absensi_${filterClass || 'Semua'}_${filterMonthYear.replace('-', '_')}.xlsx`;
    XLSX.writeFile(workbook, filename);
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
        <div className="flex items-center space-x-2">

          <button onClick={handleExportExcel} className="btn-outline flex items-center">
            <Download className="h-5 w-5 mr-1" />
            Unduh Laporan (Excel)
          </button>
          <button onClick={handlePrintReport} className="btn-outline flex items-center">
            <Printer className="h-5 w-5 mr-1" />
            Cetak
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="filterClass" className="form-label">Filter Kelas</label>
          <select
            id="filterClass"
            className="form-input"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filterMonthYear" className="form-label">Filter Bulan & Tahun</label>
          <input
            type="month"
            id="filterMonthYear"
            className="form-input"
            value={filterMonthYear}
            onChange={(e) => setFilterMonthYear(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filterStatus" className="form-label">Filter Status</label>
          <select
            id="filterStatus"
            className="form-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="present">Hadir</option>
            <option value="absent">Tanpa Keterangan</option>
            <option value="sick">Sakit</option>
            <option value="permit">Izin</option>
          </select>
        </div>
        <div>
          <label htmlFor="filterSearch" className="form-label">Cari Nama/NIS</label>
          <input
            type="text"
            id="filterSearch"
            className="form-input"
            placeholder="Cari siswa..."
            value={filterSearchTerm}
            onChange={(e) => setFilterSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 flex justify-end space-x-2">
          <button onClick={() => {
            setFilterClass('');
            setFilterMonthYear(new Date().toISOString().substring(0, 7));
            setFilterStatus('');
            setFilterSearchTerm('');
            // fetchReports() will be called by useEffect after state changes
          }} className="btn-outline">
            Reset Filter
          </button>
          <button onClick={fetchReports} className="btn-primary flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            Terapkan Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-5 text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Siswa Terdata</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalReportedStudents}</p>
            </div>
            <div className="card p-5 text-center">
              <h3 className="text-sm font-medium text-gray-500">Rata-rata Kehadiran</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">{averagePresencePercentage}%</p>
            </div>
            <div className="card p-5 text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Ketidakhadiran</h3>
              <p className="text-3xl font-bold text-error-600 mt-2">{absencePercentage}%</p>
            </div>
            <div className="card p-5 text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Absen Tercatat</h3>
              <p className="text-3xl font-bold text-warning-600 mt-2">{totalOverallAttendance}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribusi Status Absensi</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <Bar data={{
                  labels: ['Hadir', 'Tanpa Keterangan', 'Sakit', 'Izin'],
                  datasets: [
                    {
                      label: 'Jumlah Absensi',
                      data: [totalPresentCount, totalAbsentCount, totalSickCount, totalPermitCount],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.6)', // success-500
                        'rgba(239, 68, 68, 0.6)', // error-500
                        'rgba(234, 179, 8, 0.6)',  // warning-500
                        'rgba(249, 115, 22, 0.6)', // accent-500
                      ],
                      borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(234, 179, 8, 1)',
                        'rgba(249, 115, 22, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Distribusi Status Absensi' } } }} />
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tren Kehadiran Mingguan</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <Line
                  data={attendanceTrendData}
                  options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, title: { display: true, text: 'Tren Kehadiran Mingguan' } },
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales.y,
                        max: undefined, // Remove max:100 as this is count, not percentage
                        title: {
                          display: true,
                          text: 'Jumlah Siswa'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="card p-5 lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Perbandingan Kehadiran Antar Kelas (Rata-rata Persentase)</h3>
                <div style={{ height: '300px', width: '100%' }}>
                  <Bar
                    data={classComparisonData}
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, title: { display: true, text: 'Perbandingan Kehadiran Antar Kelas' } },
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          max: 100, // This is percentage
                          title: {
                            display: true,
                            text: 'Persentase Hadir (%)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Detailed Attendance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Detail Kehadiran Siswa
              </h3>
              <div className="flex items-center space-x-2 hidden-print">
                <button
                  className="btn-outline flex items-center"
                  onClick={handlePrintReport}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak (Detail)
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIS
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jam Masuk
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keterangan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dicatat Oleh
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada data laporan absensi untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    attendanceData.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.nis}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                record.status === 'sick' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-orange-100 text-orange-800'
                            }`}>
                            {record.status === 'present' ? 'Hadir' : record.status === 'absent' ? 'Tanpa Keterangan' : record.status === 'sick' ? 'Sakit' : 'Izin'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.time_in || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {(() => {
                            if (record.status === 'present') {
                              return record.time_in && record.time_in > '07:30:00'
                                ? '⏰ Terlambat'
                                : '✅ Hadir Tepat Waktu';
                            } else if (record.status === 'absent') {
                              return '❌ Tanpa Keterangan';
                            } else if (record.status === 'sick') {
                              return record.notes ? `🤒 Sakit - ${record.notes}` : '🤒 Sakit';
                            } else if (record.status === 'permit') {
                              return record.notes ? `📄 Izin - ${record.notes}` : '📄 Izin';
                            } else {
                              return '-';
                            }
                          })()}
                        </td>


                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.marked_by_user_name || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;