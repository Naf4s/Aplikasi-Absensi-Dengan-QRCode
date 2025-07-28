import type { AttendanceRecord, AttendanceStatistics } from './AttendanceStatistics';
import type { MonthData } from './ReportExportUtils';

// Fungsi untuk menghasilkan laporan cetak
export const generatePrintReport = (
  attendanceData: AttendanceRecord[],
  statistics: AttendanceStatistics,
  filterClass: string,
  filterMonthYear: string,
  monthsData: MonthData[],
  user: any,
  academicYear: string,
  semester: string
): string => {
  const styles = `
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 30px 50px;
      color: #111827;
      font-size: 14px;
      line-height: 1.6;
      background-color: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 24px;
      color: #1e3a8a;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      color: #6b7280;
    }
    .summary-container {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      flex: 1 1 22%;
      background-color: #f3f4f6;
      border-left: 5px solid #6366f1;
      padding: 16px 20px;
      border-radius: 6px;
      text-align: center;
      color: #1f2937;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-card span {
      display: block;
      font-size: 18px;
      color: #111827;
      margin-top: 5px;
      font-weight: bold;
    }
    .charts-section {
      margin-bottom: 40px;
    }
    .charts-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 10px 12px;
      text-align: left;
    }
    td:nth-child(7) {
      text-align: center;
    }
    th {
      background-color: #1d4ed8 !important;
      color: white !important;
      font-weight: bold;
      font-size: 14px;
      text-align: center;
      border: 1px solid #1e3a8a;
    }
    tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: #6b7280;
    }
    @media print {
      .hidden-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
      .summary-card {
        font-size: 12px;
        padding: 10px;
      }
      th, td {
        font-size: 11px;
      }
      .header h1 {
        font-size: 20px;
      }
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
            <td>${
              (() => {
                if (record.status === 'present') {
                  return record.time_in && record.time_in > '07:30:00'
                    ? '⏰'
                    : '✅';
                } else if (record.status === 'absent') {
                  return '❌';
                } else if (record.status === 'sick') {
                  return record.notes ? `🤒 Sakit - ${record.notes}` : '🤒';
                } else if (record.status === 'permit') {
                  return record.notes ? `📄 Izin - ${record.notes}` : '📄';
                } else {
                  return '-';
                }
              })()
            }</td>
            <td>${record.marked_by_user_name || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  let chartsHtml = '';
  // For print, we'll represent chart data as text description for simplicity.
  chartsHtml += `
    <div class="charts-section">
      <h3>Statistik Absensi (Grafik)</h3>
      <p>Distribusi Status Absensi: Hadir (${statistics.totalPresentCount}), Tanpa Keterangan (${statistics.totalAbsentCount}), Sakit (${statistics.totalSickCount}), Izin (${statistics.totalPermitCount})</p>
      <p>Tren Kehadiran per Minggu: (Lihat data tabel di bawah atau Unduh Excel untuk detail)</p>
      ${user?.role === 'admin' ? `<p>Perbandingan Kehadiran Antar Kelas: (Lihat data tabel di bawah atau Unduh Excel untuk detail)</p>` : ''}
    </div>
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
        <p>Tahun Ajaran: ${academicYear || 'N/A'} | Semester: ${semester === '1' ? 'Ganjil' : semester === '2' ? 'Genap' : 'N/A'}</p>
      </div>

      <div class="summary-container">
          <div class="summary-card">Total Siswa Terdata: <strong>${statistics.totalReportedStudents}</strong></div>
          <div class="summary-card">Rata-rata Kehadiran: <strong>${statistics.averagePresencePercentage}%</strong></div>
          <div class="summary-card">Total Ketidakhadiran: <strong>${statistics.absencePercentage}%</strong></div>
          <div class="summary-card">Total Hari Absensi Tercatat: <strong>${statistics.totalOverallAttendance}</strong></div>
      </div>

      ${chartsHtml}

      <h3>Detail Absensi:</h3>
      ${tableHtml}
    </body>
    </html>
  `;

  return reportContent;
};

// Fungsi untuk mencetak laporan
export const printReport = (
  attendanceData: AttendanceRecord[],
  statistics: AttendanceStatistics,
  filterClass: string,
  filterMonthYear: string,
  monthsData: MonthData[],
  user: any,
  academicYear: string,
  semester: string
): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    const reportContent = generatePrintReport(
      attendanceData,
      statistics,
      filterClass,
      filterMonthYear,
      monthsData,
      user,
      academicYear,
      semester
    );

    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}; 