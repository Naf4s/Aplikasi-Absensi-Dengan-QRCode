import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import type { AttendanceRecord, AttendanceStatistics } from './AttendanceStatistics';
import { getWeeklyAttendanceData, getClassComparisonData, getStatusDistributionData } from './AttendanceStatistics';

interface AttendanceChartsProps {
  attendanceData: AttendanceRecord[];
  statistics: AttendanceStatistics;
  user: any;
}

const AttendanceCharts: React.FC<AttendanceChartsProps> = ({ 
  attendanceData, 
  statistics, 
  user 
}) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Persentase (%)'
        }
      },
    },
  };

  const attendanceTrendData = getWeeklyAttendanceData(attendanceData);
  const classComparisonData = getClassComparisonData(attendanceData);
  const statusDistributionData = getStatusDistributionData(
    statistics.totalPresentCount,
    statistics.totalAbsentCount,
    statistics.totalSickCount,
    statistics.totalPermitCount
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribusi Status Absensi</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <Bar 
            data={statusDistributionData} 
            options={{ 
              ...chartOptions, 
              plugins: { 
                ...chartOptions.plugins, 
                title: { 
                  display: true, 
                  text: 'Distribusi Status Absensi' 
                } 
              } 
            }} 
          />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tren Kehadiran Mingguan</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <Line
            data={attendanceTrendData}
            options={{
              ...chartOptions,
              plugins: { 
                ...chartOptions.plugins, 
                title: { 
                  display: true, 
                  text: 'Tren Kehadiran Mingguan' 
                } 
              },
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
                plugins: { 
                  ...chartOptions.plugins, 
                  title: { 
                    display: true, 
                    text: 'Perbandingan Kehadiran Antar Kelas' 
                  } 
                },
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
  );
};

export default AttendanceCharts; 