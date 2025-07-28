import React from 'react';
import type { AttendanceStatistics } from './AttendanceStatistics';

interface StatisticsCardsProps {
  statistics: AttendanceStatistics;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card p-5 text-center">
        <h3 className="text-sm font-medium text-gray-500">Total Siswa Terdata</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalReportedStudents}</p>
      </div>
      <div className="card p-5 text-center">
        <h3 className="text-sm font-medium text-gray-500">Rata-rata Kehadiran</h3>
        <p className="text-3xl font-bold text-primary-600 mt-2">{statistics.averagePresencePercentage}%</p>
      </div>
      <div className="card p-5 text-center">
        <h3 className="text-sm font-medium text-gray-500">Total Ketidakhadiran</h3>
        <p className="text-3xl font-bold text-error-600 mt-2">{statistics.absencePercentage}%</p>
      </div>
      <div className="card p-5 text-center">
        <h3 className="text-sm font-medium text-gray-500">Total Absen Tercatat</h3>
        <p className="text-3xl font-bold text-warning-600 mt-2">{statistics.totalOverallAttendance}</p>
      </div>
    </div>
  );
};

export default StatisticsCards; 