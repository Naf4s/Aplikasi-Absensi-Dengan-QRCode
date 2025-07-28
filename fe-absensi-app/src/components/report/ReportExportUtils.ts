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
  monthsData: MonthData[]
): void => {
  const workbook = XLSX.utils.book_new();

  // --- Sheet: Ringkasan Statistik ---
  const summaryData = [
    ['LAPORAN ABSENSI SISWA', ''],
    ['SD N 1 Bumirejo', ''],
    ['', ''],
    [`Periode: Bulan ${monthsData.find(m => m.value === filterMonthYear.substring(5, 7))?.name} ${filterMonthYear.substring(0, 4)}`, ''],
    [`Kelas: ${filterClass || 'Semua'}`, ''],
    ['', ''],
    ['Metrik', 'Nilai'],
    ['Total Siswa Terdata', statistics.totalReportedStudents],
    ['Rata-rata Kehadiran (%)', statistics.averagePresencePercentage],
    ['Total Ketidakhadiran (%)', statistics.absencePercentage],
    ['Total Absensi Tercatat', statistics.totalOverallAttendance],
    ['Hadir', statistics.totalPresentCount],
    ['Tanpa Keterangan', statistics.totalAbsentCount],
    ['Sakit', statistics.totalSickCount],
    ['Izin', statistics.totalPermitCount],
  ];
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // --- Sheet: Data Siswa ---
  const uniqueStudents = Array.from(new Set(attendanceData.map(record => record.student_id)))
    .map(id => attendanceData.find(record => record.student_id === id)!);
    
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
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!wsStudentData[cellAddress]) continue;
    wsStudentData[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1E40AF" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "1F2937" } },
        bottom: { style: "thin", color: { rgb: "1F2937" } },
        left: { style: "thin", color: { rgb: "1F2937" } },
        right: { style: "thin", color: { rgb: "1F2937" } }
      }
    };
  }
  wsStudentData['!cols'] = [
    { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 12 }
  ];

  // Styling header row for summary sheet
  const rangeSummary = XLSX.utils.decode_range(wsSummary['!ref']!);
  for (let C = rangeSummary.s.c; C <= rangeSummary.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 6, c: C });
    if (!wsSummary[cellAddress]) continue;
    wsSummary[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4338CA" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "1F2937" } },
        bottom: { style: "thin", color: { rgb: "1F2937" } },
        left: { style: "thin", color: { rgb: "1F2937" } },
        right: { style: "thin", color: { rgb: "1F2937" } }
      }
    };
  }
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
    })(),
    record.marked_by_user_name || '-',
  ]);
  const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailData]);

  // Styling header row for detail sheet
  const rangeDetail = XLSX.utils.decode_range(wsDetail['!ref']!);
  for (let C = rangeDetail.s.c; C <= rangeDetail.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!wsDetail[cellAddress]) continue;
    wsDetail[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1E40AF" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "1F2937" } },
        bottom: { style: "thin", color: { rgb: "1F2937" } },
        left: { style: "thin", color: { rgb: "1F2937" } },
        right: { style: "thin", color: { rgb: "1F2937" } }
      }
    };
  }
  wsDetail['!cols'] = [
    { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 25 },
    { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 20 }
  ];

  // Format NIS column as text to prevent Excel date formatting issues
  for (let R = 1; R <= detailData.length; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 1 });
    if (wsDetail[cellAddress]) {
      wsDetail[cellAddress].t = 's';
      wsDetail[cellAddress].z = '@';
      wsDetail[cellAddress].v = wsDetail[cellAddress].v.toString();
    }
  }

  // Format date column as date type
  for (let R = 1; R <= detailData.length; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 });
    if (wsDetail[cellAddress]) {
      wsDetail[cellAddress].t = 'd';
      wsDetail[cellAddress].z = XLSX.SSF._table[14];
      wsDetail[cellAddress].v = new Date(wsDetail[cellAddress].v);
    }
  }

  XLSX.utils.book_append_sheet(workbook, wsDetail, 'Detail Absensi');

  // --- Sheet: Ringkasan Siswa (Hadir, Sakit, Izin, Absen) ---
  const summaryStudentHeader = ['NIS', 'Nama Siswa', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Persentase Hadir (%)'];
  const summaryStudentData = statistics.summarizedStudents.map(s => {
    const total = s.present + s.sick + s.permit + s.absent;
    const percentage = total > 0 ? ((s.present / total) * 100).toFixed(1) : '0.0';
    return [s.nis, s.name, s.class, s.present, s.sick, s.permit, s.absent, percentage];
  });
  const wsStudentSummary = XLSX.utils.aoa_to_sheet([summaryStudentHeader, ...summaryStudentData]);

  // Styling header row for student summary sheet
  const rangeStudent = XLSX.utils.decode_range(wsStudentSummary['!ref']!);
  for (let C = rangeStudent.s.c; C <= rangeStudent.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!wsStudentSummary[cellAddress]) continue;
    wsStudentSummary[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "047857" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "1F2937" } },
        bottom: { style: "thin", color: { rgb: "1F2937" } },
        left: { style: "thin", color: { rgb: "1F2937" } },
        right: { style: "thin", color: { rgb: "1F2937" } }
      }
    };
  }
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