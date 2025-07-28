import React from 'react';
import { Printer } from 'lucide-react';
import type { AttendanceRecord } from './AttendanceStatistics';

interface AttendanceTableProps {
  attendanceData: AttendanceRecord[];
  onPrintReport: () => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ 
  attendanceData, 
  onPrintReport 
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Detail Kehadiran Siswa
        </h3>
        <div className="flex items-center space-x-2 hidden-print">
          <button
            className="btn-outline flex items-center"
            onClick={onPrintReport}
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
  );
};

export default AttendanceTable; 