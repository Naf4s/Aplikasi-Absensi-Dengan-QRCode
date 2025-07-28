// Interface untuk data absensi
export interface AttendanceRecord {
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

// Interface untuk ringkasan siswa
export interface StudentSummary {
  name: string;
  nis: string;
  class: string;
  present: number;
  absent: number;
  sick: number;
  permit: number;
}

// Interface untuk statistik utama
export interface AttendanceStatistics {
  totalReportedStudents: number;
  totalPresentCount: number;
  totalAbsentCount: number;
  totalSickCount: number;
  totalPermitCount: number;
  totalOverallAttendance: number;
  averagePresencePercentage: string;
  absencePercentage: string;
  summarizedStudents: StudentSummary[];
}

// Interface untuk data chart
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Fungsi untuk menghitung statistik absensi
export const calculateAttendanceStatistics = (
  attendanceData: AttendanceRecord[],
  filterMonthYear: string
): AttendanceStatistics => {
  // Hitung jumlah status per siswa
  const studentSummary: { [key: string]: StudentSummary } = {};
  
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
  const totalDaysInMonth = new Date(
    parseInt(filterMonthYear.substring(0, 4)), 
    parseInt(filterMonthYear.substring(5, 7)), 
    0
  ).getDate();

  const totalPresentCount = summarizedStudents.reduce((sum, s) => sum + s.present, 0);
  const totalAbsentCount = summarizedStudents.reduce((sum, s) => sum + s.absent, 0);
  const totalSickCount = summarizedStudents.reduce((sum, s) => sum + s.sick, 0);
  const totalPermitCount = summarizedStudents.reduce((sum, s) => sum + s.permit, 0);
  const totalOverallAttendance = totalPresentCount + totalAbsentCount + totalSickCount + totalPermitCount;

  const averagePresencePercentage = totalOverallAttendance > 0 
    ? ((totalPresentCount / totalOverallAttendance) * 100).toFixed(2) 
    : '0.00';
    
  const absencePercentage = totalOverallAttendance > 0 
    ? (((totalAbsentCount + totalSickCount + totalPermitCount) / totalOverallAttendance) * 100).toFixed(2) 
    : '0.00';

  return {
    totalReportedStudents,
    totalPresentCount,
    totalAbsentCount,
    totalSickCount,
    totalPermitCount,
    totalOverallAttendance,
    averagePresencePercentage,
    absencePercentage,
    summarizedStudents
  };
};

// Fungsi untuk menghasilkan data chart tren mingguan
export const getWeeklyAttendanceData = (attendanceData: AttendanceRecord[]): ChartData => {
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

// Fungsi untuk menghasilkan data perbandingan kelas
export const getClassComparisonData = (attendanceData: AttendanceRecord[]): ChartData => {
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

// Fungsi untuk menghasilkan data distribusi status
export const getStatusDistributionData = (
  totalPresentCount: number,
  totalAbsentCount: number,
  totalSickCount: number,
  totalPermitCount: number
): ChartData => {
  return {
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
  };
}; 