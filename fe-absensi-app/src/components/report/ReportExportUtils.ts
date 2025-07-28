import * as XLSX from 'xlsx';
import type { AttendanceRecord, AttendanceStatistics } from './AttendanceStatistics';

// Interface untuk data bulan
export interface MonthData {
  value: string;
  name: string;
}

// Fungsi untuk menghasilkan laporan teks
export const generateTextReport = (
  attendanceData: AttendanceRecord[],
  statistics: AttendanceStatistics,
  filterClass: string,
  filterMonthYear: string,
  monthsData: MonthData[]
): string => {
  const reportTitle = `Laporan_Absensi_${filterClass || 'Semua'}_${filterMonthYear.replace('-', '_')}`;
  
  let reportContent = `
    LAPORAN ABSENSI SISWA
    SD N 1 Bumirejo

    Kelas: ${filterClass || 'Semua'}
    Bulan: ${monthsData.find(m => m.value === filterMonthYear.substring(5, 7))?.name} ${filterMonthYear.substring(0, 4)}

    Statistik Kehadiran:
    - Total Siswa Terdata: ${statistics.totalReportedStudents}
    - Rata-rata Kehadiran: ${statistics.averagePresencePercentage}%
    - Total Ketidakhadiran: ${statistics.absencePercentage}%
    - Total Hari Absensi Tercatat: ${statistics.totalOverallAttendance}

    Detail Kehadiran:
  `;

  statistics.summarizedStudents.forEach(student => {
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

  return reportContent;
};

// Fungsi untuk mengunduh laporan teks
export const downloadTextReport = (reportContent: string, filterClass: string, filterMonthYear: string): void => {
  const reportTitle = `Laporan_Absensi_${filterClass || 'Semua'}_${filterMonthYear.replace('-', '_')}`;
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

// Fungsi untuk menghasilkan laporan Excel
export const generateExcelReport = (
  attendanceData: AttendanceRecord[],
  statistics: AttendanceStatistics,
  filterClass: string,
  filterMonthYear: string,
  monthsData: MonthData[],
  academicYear: string,
  semester: string
): void => {
  const workbook = XLSX.utils.book_new();
  const reportDate = new Date().toLocaleDateString('id-ID');

  // Helper untuk styling header
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1E40AF" } }, // Biru Tua Konsisten
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };

  // Helper untuk styling sel data dengan border dan alignment
  const cellStyle = {
    alignment: { vertical: 'center' as const, wrapText: true },
    border: {
      top: { style: 'thin' as const, color: { rgb: '000000' } },
      bottom: { style: 'thin' as const, color: { rgb: '000000' } },
      left: { style: 'thin' as const, color: { rgb: '000000' } },
      right: { style: 'thin' as const, color: { rgb: '000000' } },
    },
  };

  // --- 1. Sheet: Ringkasan Laporan ---
  const summaryData = [
    ['LAPORAN ABSENSI SISWA'],
    ['SD N 1 Bumirejo'],
    [], // Baris kosong
    ['Periode', `${monthsData.find(m => m.value === filterMonthYear.substring(5, 7))?.name} ${filterMonthYear.substring(0, 4)}`],
    ['Tahun Ajaran', `${academicYear || 'N/A'} | Semester: ${semester === '1' ? 'Ganjil' : semester === '2' ? 'Genap' : 'N/A'}`],
    ['Kelas', filterClass || 'Semua Kelas'],
    ['Tanggal Laporan', reportDate],
    [], // Baris kosong
    ['METRIK UTAMA', 'NILAI'],
    ['Total Siswa Terdata', statistics.totalReportedStudents],
    ['Rata-rata Kehadiran', `${statistics.averagePresencePercentage}%`],
    ['Total Ketidakhadiran', `${statistics.absencePercentage}%`],
    ['Total Absensi Tercatat', statistics.totalOverallAttendance],
    [], // Baris kosong
    ['DETAIL STATUS', 'JUMLAH'],
    ['Total Hadir', statistics.totalPresentCount],
    ['Total Tanpa Keterangan', statistics.totalAbsentCount],
    ['Total Sakit', statistics.totalSickCount],
    ['Total Izin', statistics.totalPermitCount],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  // Merge cells untuk judul
  wsSummary['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
  ];
  // Styling header
  wsSummary['A9'].s = headerStyle;
  wsSummary['B9'].s = headerStyle;
  wsSummary['A15'].s = headerStyle;
  wsSummary['B15'].s = headerStyle;

  // Styling data cells di Ringkasan
  for (let R = 8; R < summaryData.length; ++R) {
    if (!summaryData[R][0] && !summaryData[R][1]) continue; // Lewati baris kosong
    const cellA = XLSX.utils.encode_cell({ r: R, c: 0 });
    const cellB = XLSX.utils.encode_cell({ r: R, c: 1 });
    if (wsSummary[cellA] && !wsSummary[cellA].s) wsSummary[cellA].s = { ...cellStyle, alignment: { ...cellStyle.alignment, horizontal: 'left' } };
    if (wsSummary[cellB] && !wsSummary[cellB].s) wsSummary[cellB].s = { ...cellStyle, alignment: { ...cellStyle.alignment, horizontal: 'left' } };
  }

  // Set column widths
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan Laporan');

  // --- 2. Sheet: Ringkasan per Siswa ---
  const summaryStudentHeader = ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Total Absensi', 'Persentase Hadir (%)'];
  const summaryStudentData = statistics.summarizedStudents.map((s, index) => {
    const total = s.present + s.sick + s.permit + s.absent;
    const percentage = total > 0 ? parseFloat(((s.present / total) * 100).toFixed(1)) : 0.0;
    return [index + 1, s.nis, s.name, s.class, s.present, s.sick, s.permit, s.absent, total, percentage];
  });
  const wsStudentSummary = XLSX.utils.aoa_to_sheet([summaryStudentHeader, ...summaryStudentData]);
  // Styling header
  const rangeStudent = XLSX.utils.decode_range(wsStudentSummary['!ref']!);
  for (let C = rangeStudent.s.c; C <= rangeStudent.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (wsStudentSummary[cellAddress]) wsStudentSummary[cellAddress].s = headerStyle;
  }

  // Terapkan style ke sel data di Ringkasan per Siswa
  summaryStudentData.forEach((row, R) => {
    row.forEach((_cell, C) => {
      const cellRef = XLSX.utils.encode_cell({ r: R + 1, c: C });
      if (wsStudentSummary[cellRef]) {
        let alignment = { vertical: 'center' as const, horizontal: 'left' as const, wrapText: true };
        // Rata tengah untuk kolom No dan semua kolom angka
        if (C === 0 || (C >= 4 && C <= 9)) {
          alignment.horizontal = 'center';
        }
        wsStudentSummary[cellRef].s = { border: cellStyle.border, alignment };
        if (C === 1) wsStudentSummary[cellRef].t = 's'; // Format NIS sebagai teks
      }
    });
  });

  // Set column widths
  wsStudentSummary['!cols'] = [
    { wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsStudentSummary, 'Ringkasan per Siswa');

  // --- 3. Sheet: Detail Absensi (Log) ---
  const getKeteranganText = (record: AttendanceRecord): string => {
    if (record.status === 'present') {
      return record.time_in && record.time_in > '07:30:00' ? 'Terlambat' : 'Hadir Tepat Waktu';
    }
    if (record.status === 'absent') return 'Tanpa Keterangan';
    if (record.status === 'sick') return record.notes ? `Sakit - ${record.notes}` : 'Sakit';
    if (record.status === 'permit') return record.notes ? `Izin - ${record.notes}` : 'Izin';
    return '-';
  };
  const detailHeader = [
    'No', 'Tanggal', 'NIS', 'Nama Siswa', 'Kelas', 'Status', 'Jam Masuk', 'Keterangan', 'Dicatat Oleh'
  ];
  const detailData = attendanceData.map((record, index) => [
    index + 1,
    new Date(record.date), // Gunakan objek Date asli
    record.nis,
    record.student_name,
    record.class,
    record.status === 'present' ? 'Hadir' : record.status === 'absent' ? 'Tanpa Keterangan' : record.status === 'sick' ? 'Sakit' : 'Izin',
    record.time_in || '-',
    getKeteranganText(record),
    record.marked_by_user_name || '-',
  ]);
  const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailData]);
  // Styling header
  const rangeDetail = XLSX.utils.decode_range(wsDetail['!ref']!);
  for (let C = rangeDetail.s.c; C <= rangeDetail.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (wsDetail[cellAddress]) wsDetail[cellAddress].s = headerStyle;
  }

  // Terapkan style ke sel data di Detail Absensi
  detailData.forEach((row, R) => {
    row.forEach((_cell, C) => {
      const cellRef = XLSX.utils.encode_cell({ r: R + 1, c: C });
      if (wsDetail[cellRef]) {
        let alignment = { vertical: 'center' as const, horizontal: 'left' as const, wrapText: true };
        // Rata tengah untuk kolom No dan Jam Masuk
        if (C === 0 || C === 6) {
          alignment.horizontal = 'center';
        }
        wsDetail[cellRef].s = { border: cellStyle.border, alignment };
        if (C === 1) { // Format Tanggal
          wsDetail[cellRef].t = 'd';
          wsDetail[cellRef].z = 'dd-mm-yyyy';
        }
        if (C === 2) wsDetail[cellRef].t = 's'; // Format NIS sebagai teks
      }
    });
  });

  // Set column widths
  wsDetail['!cols'] = [
    { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 18 }, { wch: 12 }, { wch: 30 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsDetail, 'Detail Absensi');

  // Freeze header rows
  wsSummary['!freeze'] = { ySplit: 8 };
  wsStudentSummary['!freeze'] = { ySplit: 1 };
  wsDetail['!freeze'] = { ySplit: 1 };

  // Generate Excel file
  const filename = `Laporan_Absensi_${filterClass || 'Semua'}_${filterMonthYear.replace('-', '_')}.xlsx`;
  XLSX.writeFile(workbook, filename);
}; 