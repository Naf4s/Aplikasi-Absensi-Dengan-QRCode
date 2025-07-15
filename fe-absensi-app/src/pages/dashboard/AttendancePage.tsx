import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Download, Filter, Search, Users, RefreshCw, X, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';

// Ini Wajib Kamu Ingat! (Konsistensi Interface Kelas)
// Interface ini harus sesuai dengan data kelas yang dikembalikan oleh backend.
interface ClassItem {
  id: string;
  name: string;
  homeroom_teacher_id?: string | null;
  homeroom_teacher_name?: string | null;
}

// Ini Wajib Kamu Ingat! (Konsistensi Interface StudentAttendanceStatus)
// Pastikan interface ini sesuai dengan data yang dikembalikan oleh backend.
interface StudentAttendanceStatus {
  id: string;
  nis: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
  status: 'present' | 'absent' | 'sick' | 'permit' | 'none'; // 'none' jika belum ada record
  timeIn?: string;
  notes?: string;
}

const AttendancePage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [studentsAttendance, setStudentsAttendance] = useState<StudentAttendanceStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
  );
  const [activeTab, setActiveTab] = useState<'list' | 'qr'>('list'); // Mode daftar atau QR
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ini Wajib Kamu Ingat! (State Baru untuk Daftar Kelas Dinamis)
  const [classes, setClasses] = useState<ClassItem[]>([]); // Untuk menyimpan daftar kelas dari backend

  // Fungsi untuk memuat status absensi siswa per kelas dan tanggal dari backend
  const loadStudentAttendance = useCallback(async (className: string, date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Panggil API untuk mendapatkan status absensi siswa per kelas dan tanggal
      const response = await api.get(`/attendance/status-by-class`, {
        params: { className, date }
      });
      setStudentsAttendance(response.data || []);
    } catch (err) {
      console.error('Error loading student attendance:', err);
      let msg = 'Gagal memuat status absensi siswa. Silakan coba lagi.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setStudentsAttendance([]); // Clear students on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fungsi untuk mengambil daftar kelas dari backend
  const fetchClasses = useCallback(async () => {
    try {
      // Endpoint /api/classes sudah diupdate di backend untuk mengembalikan kelas sesuai role user
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      // Jangan set error global di sini agar tidak menimpa error absensi
    }
  }, []);

  useEffect(() => {
    fetchClasses(); // Ambil daftar kelas saat komponen pertama kali di-mount
  }, [fetchClasses]);


  // Effect untuk memuat absensi saat kelas atau tanggal berubah
  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadStudentAttendance(selectedClass, selectedDate);
    }
  }, [selectedClass, selectedDate, loadStudentAttendance]);

  // Handle ketika kelas dipilih
  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setSearchTerm(''); // Reset search term when class changes
  };

  // Ini Wajib Kamu Ingat! (Mengirim Absensi Manual ke Backend)
  // Ketika status siswa diubah, kirim request PUT/POST ke backend.
  const updateStudentStatus = async (studentId: string, status: StudentAttendanceStatus['status'], notes?: string) => {
    try {
      setError(null);
      const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Panggil API untuk mencatat absensi
      await api.post('/attendance', {
        studentId,
        date: selectedDate,
        status,
        timeIn: status === 'present' ? currentTime : null, // Hanya set timeIn jika hadir
        notes: notes || null
      });

      // Setelah berhasil, muat ulang data absensi untuk kelas tersebut
      if (selectedClass && selectedDate) {
        await loadStudentAttendance(selectedClass, selectedDate);
      }
      console.log(`Absensi ${studentId} diubah menjadi ${status}`);
    } catch (err) {
      console.error('Error updating attendance status:', err);
      let msg = 'Gagal memperbarui status absensi.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = `Gagal: ${err.response.data.message}`;
      }
      setError(msg);
    }
  };

  // Filter siswa berdasarkan search term
  const filteredStudents = studentsAttendance.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge class (styling)
  const getStatusBadgeClass = (status: StudentAttendanceStatus['status']) => {
    switch (status) {
      case 'present':
        return 'bg-success-100 text-success-700';
      case 'absent':
        return 'bg-error-100 text-error-700';
      case 'sick':
        return 'bg-warning-100 text-warning-700';
      case 'permit':
        return 'bg-accent-100 text-accent-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Ini Wajib Kamu Ingat! (Kontrol Akses Frontend dengan `hasPermission`)
  // Jika user tidak memiliki izin 'view_attendance', jangan tampilkan konten.
  if (!hasPermission('view_attendance')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk melihat halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Absensi Siswa</h1>
        
        <div className="flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {selectedClass && (
            <button
              onClick={() => setActiveTab(activeTab === 'list' ? 'qr' : 'list')}
              className="btn-primary"
            >
              {activeTab === 'list' ? 'Mode QR Code' : 'Mode Daftar'}
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Class List */}
        <div className="md:col-span-1">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Daftar Kelas</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {classes.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">Tidak ada kelas yang terdaftar.</div>
              ) : (
                classes.map((classItem) => ( // Menggunakan `classes` state
                  <button
                    key={classItem.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      selectedClass === classItem.name ? 'bg-primary-50' : '' // Bandingkan dengan class.name
                    }`}
                    onClick={() => handleClassSelect(classItem.name)} // Mengirim class.name sebagai ID yang dipilih
                  >
                    <div className="font-medium text-gray-900">Kelas {classItem.name}</div>
                    <div className="text-sm text-gray-500">{classItem.homeroom_teacher_name || '-'}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Student List or QR Code */}
        <div className="md:col-span-3">
          {!selectedClass ? (
            <div className="card p-6 flex flex-col items-center justify-center text-center h-full">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Kelas</h3>
              <p className="text-gray-500">
                Silakan pilih kelas dari daftar untuk melihat dan mengelola absensi siswa.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : activeTab === 'list' ? (
            <div className="card overflow-hidden">
              <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Siswa Kelas {selectedClass}
                </h2>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {/* <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Filter className="h-5 w-5" />
                  </button> */}
                  
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Download className="h-5 w-5" />
                  </button>
                  
                  <button 
                    className="p-1 text-gray-500 hover:text-gray-700"
                    onClick={() => selectedClass && loadStudentAttendance(selectedClass, selectedDate)}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NIS
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
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
                      {hasPermission('mark_attendance') && (
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={hasPermission('mark_attendance') ? 7 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
                          Tidak ada data siswa untuk kelas ini atau tanggal ini.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.nis}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(student.status)}`}>
                              {student.status === 'present' ? 'Hadir' : 
                               student.status === 'absent' ? 'Tanpa Keterangan' : 
                               student.status === 'sick' ? 'Sakit' : 
                               student.status === 'permit' ? 'Izin' : 'Belum Absen'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.timeIn || '-'}
                          </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(() => {
                            if (student.status === 'present') {
                              return student.timeIn && student.timeIn > '07:30:00' ? '⏰ Terlambat' : '✅ Hadir Tepat Waktu';
                            } else if (student.status === 'absent') {
                              return '❌ Tanpa Keterangan';
                            } else if (student.status === 'sick') {
                              return student.notes ? `🤒 Sakit - ${student.notes}` : '🤒 Sakit';
                            } else if (student.status === 'permit') {
                              return student.notes ? `📄 Izin - ${student.notes}` : '📄 Izin';
                            } else {
                              return '-';
                            }
                          })()}
                        </td>


                          {hasPermission('mark_attendance') && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => updateStudentStatus(student.id, 'present')}
                                  className={`px-2 py-1 text-xs rounded ${student.status === 'present' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700 hover:bg-success-50 hover:text-success-700'}`}
                                >
                                  H
                                </button>
                                <button 
                                  onClick={() => updateStudentStatus(student.id, 'absent')}
                                  className={`px-2 py-1 text-xs rounded ${student.status === 'absent' ? 'bg-error-100 text-error-700' : 'bg-gray-100 text-gray-700 hover:bg-error-50 hover:text-error-700'}`}
                                >
                                  A
                                </button>
                                <button 
                                  onClick={() => updateStudentStatus(student.id, 'sick')}
                                  className={`px-2 py-1 text-xs rounded ${student.status === 'sick' ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-gray-700 hover:bg-warning-50 hover:text-warning-700'}`}
                                >
                                  S
                                </button>
                                <button 
                                  onClick={() => updateStudentStatus(student.id, 'permit')}
                                  className={`px-2 py-1 text-xs rounded ${student.status === 'permit' ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-700 hover:bg-accent-50 hover:text-accent-700'}`}
                                >
                                  I
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Menampilkan {filteredStudents.length} dari {studentsAttendance.length} siswa
                </div>
                
                <div className="flex space-x-2 text-sm">
                  <span className="text-success-700 bg-success-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-success-500 mr-1"></div>
                    Hadir: {studentsAttendance.filter(s => s.status === 'present').length}
                  </span>
                  <span className="text-error-700 bg-error-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-error-500 mr-1"></div>
                    Tanpa Keterangan: {studentsAttendance.filter(s => s.status === 'absent').length}
                  </span>
                  <span className="text-warning-700 bg-warning-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-warning-500 mr-1"></div>
                    Sakit: {studentsAttendance.filter(s => s.status === 'sick').length}
                  </span>
                  <span className="text-accent-700 bg-accent-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-accent-500 mr-1"></div>
                    Izin: {studentsAttendance.filter(s => s.status === 'permit').length}
                  </span>
                </div>
              </div>
            </div>
          ) : ( // Mode QR Code
            <div className="card overflow-hidden">
              <div className="p-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Mode QR Code - Kelas {selectedClass}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Fitur tampilan QR Code siswa sedang dalam pengembangan.
                </p>
                <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-700 text-left">
                  <p className="font-semibold mb-1">Catatan:</p>
                  <p>Mode QR Code di halaman ini hanya tampilan placeholder. Fungsi scan QR sesungguhnya ada di halaman "Scanner QR".</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
