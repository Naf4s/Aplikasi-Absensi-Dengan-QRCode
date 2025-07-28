import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import { ChevronDownIcon } from '@heroicons/react/20/solid';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Users, RefreshCw, AlertCircle } from 'lucide-react';
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
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [studentsAttendance, setStudentsAttendance] = useState<StudentAttendanceStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
  );
  const [activeTab, setActiveTab] = useState<'list' | 'qr'>('list'); // Mode daftar atau QR
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const [classes, setClasses] = useState<ClassItem[]>([]); 

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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Absensi Siswa
          </h1>
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 w-full sm:w-[180px] min-w-[140px]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Calendar className="h-5 w-5" />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {selectedClass && (
            <button
              onClick={() => {
                if (activeTab === 'list') {
                  navigate('/dashboard/scanner');
                } else {
                  setActiveTab('list');
                }
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {activeTab === 'list' ? 'Mode QR Code' : 'Mode Daftar'}
            </button>
          )}
        </div>
      </header>
      
      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Class List: Dropdown di mobile, sidebar di desktop */}
        <aside className="md:col-span-1" aria-label="Daftar Kelas">
          <section className="card overflow-hidden">
            <header className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-500" />
                Daftar Kelas
              </h2>
              {/* Dropdown di mobile dengan Menu */}
              <nav className="md:hidden" aria-label="Pilih Kelas">
                <label htmlFor="kelas-dropdown" className="sr-only">Pilih Kelas</label>
                <select
                  id="kelas-dropdown"
                  className="border rounded px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 w-full"
                  value={selectedClass || ''}
                  onChange={e => handleClassSelect(e.target.value)}
                  disabled={classes.length === 0}
                >
                  <option value="" disabled>Pilih Kelas...</option>
                  {classes.map(classItem => (
                    <option key={classItem.id} value={classItem.name}>
                      {classItem.name} {classItem.homeroom_teacher_name ? `- ${classItem.homeroom_teacher_name}` : ''}
                    </option>
                  ))}
                </select>
              </nav>
            </header>
            {/* Sidebar di desktop */}
            <nav className="hidden md:block divide-y divide-gray-200" aria-label="Sidebar Kelas">
              {classes.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">Tidak ada kelas yang terdaftar.</div>
              ) : (
                classes.map((classItem) => (
                  <button
                    key={classItem.id}
                    className={`w-full text-left p-4 flex items-center gap-3 hover:bg-primary-50 transition-all duration-150`}
                    onClick={() => handleClassSelect(classItem.name)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">Kelas {classItem.name}</div>
                      <div className="text-xs text-gray-500">{classItem.homeroom_teacher_name || '-'}</div>
                    </div>
                  </button>
                ))
              )}
            </nav>
          </section>
        </aside>
        
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

              <div className="p-4 bg-white border-b border-gray-200">
                {/* Mobile: title + buttons inline, search below. Desktop: horizontal layout. */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Title and buttons row */}
                  <div className="flex flex-row items-center justify-between w-full">
                    <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center">Siswa Kelas <span className="text-primary-600 ml-1">{selectedClass}</span></h2>
                    <div className="flex flex-row gap-2 items-center">
                      <button
                        className="p-2 rounded-lg bg-gray-100 hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition"
                        onClick={() => navigate('/dashboard/reports')}
                        title="Lihat Laporan"
                      >
                        Lihat Laporan
                      </button>
                      <button 
                        className="p-2 rounded-lg bg-gray-100 hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition"
                        onClick={() => selectedClass && loadStudentAttendance(selectedClass, selectedDate)}
                        title="Refresh Data"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {/* Search input below for mobile, right for desktop */}
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 w-full"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="w-full overflow-x-auto">
                <table className="min-w-[700px] w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[40px]">No</th>
                      <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[60px]">NIS</th>
                      <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">Nama</th>
                      <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">Status</th>
                      <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">Jam Masuk</th>
                      <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">Keterangan</th>
                      {hasPermission('mark_attendance') && (
                        <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={hasPermission('mark_attendance') ? 7 : 6} className="px-6 py-10 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                            <span className="font-semibold">Tidak ada data siswa untuk kelas ini atau tanggal ini.</span>
                            <button
                              className="mt-4 px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition"
                              onClick={() => selectedClass && loadStudentAttendance(selectedClass, selectedDate)}
                            >
                              Refresh Data
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className="hover:bg-primary-50 transition-all duration-150 border-b border-gray-100">
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.nis}</td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(student.status)}`}>
                              {student.status === 'present' ? 'Hadir' : 
                               student.status === 'absent' ? 'Tanpa Keterangan' : 
                               student.status === 'sick' ? 'Sakit' : 
                               student.status === 'permit' ? 'Izin' : 'Belum Absen'}
                            </span>
                          </td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">{student.timeIn || '-'}</td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
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
                            <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => updateStudentStatus(student.id, 'present')}
                                  className={`px-2 py-1 text-xs rounded ${student.status === 'present' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700 hover:bg-success-50 hover:text-success-700'}`}
                                  aria-label="Tandai Hadir"
                                >
                                  H
                                </button>
                                <button 
                                  onClick={() => updateStudentStatus(student.id, 'absent')}
                                  className={`px-2 py-1 text-xs rounded ${student.status === 'absent' ? 'bg-error-100 text-error-700' : 'bg-gray-100 text-gray-700 hover:bg-error-50 hover:text-error-700'}`}
                                  aria-label="Tandai Tanpa Keterangan"
                                >
                                  A
                                </button>
                                <button 
                                  onClick={() => updateStudentStatus(student.id, 'sick')}
                                  className={`px-2 py-1 text-xs rounded ${student.status === 'sick' ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-gray-700 hover:bg-warning-50 hover:text-warning-700'}`}
                                  aria-label="Tandai Sakit"
                                >
                                  S
                                </button>
                                <button 
                                  onClick={() => updateStudentStatus(student.id, 'permit')}
                                  className={`px-2 py-1 text-xs rounded ${student.status === 'permit' ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-700 hover:bg-accent-50 hover:text-accent-700'}`}
                                  aria-label="Tandai Izin"
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
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                  Menampilkan <span className="font-semibold text-gray-900">{filteredStudents.length}</span> dari <span className="font-semibold text-gray-900">{studentsAttendance.length}</span> siswa
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center px-3 py-2 rounded-lg bg-success-50 border border-success-100 min-w-[90px]">
                    <span className="h-2 w-2 rounded-full bg-success-500 mr-2"></span>
                    <span className="font-semibold text-success-700">Hadir:</span>
                    <span className="ml-2 text-success-700 font-bold">{studentsAttendance.filter(s => s.status === 'present').length}</span>
                  </div>
                  <div className="flex items-center px-3 py-2 rounded-lg bg-error-50 border border-error-100 min-w-[90px]">
                    <span className="h-2 w-2 rounded-full bg-error-500 mr-2"></span>
                    <span className="font-semibold text-error-700">Tanpa Keterangan:</span>
                    <span className="ml-2 text-error-700 font-bold">{studentsAttendance.filter(s => s.status === 'absent').length}</span>
                  </div>
                  <div className="flex items-center px-3 py-2 rounded-lg bg-warning-50 border border-warning-100 min-w-[70px]">
                    <span className="h-2 w-2 rounded-full bg-warning-500 mr-2"></span>
                    <span className="font-semibold text-warning-700">Sakit:</span>
                    <span className="ml-2 text-warning-700 font-bold">{studentsAttendance.filter(s => s.status === 'sick').length}</span>
                  </div>
                  <div className="flex items-center px-3 py-2 rounded-lg bg-accent-50 border border-accent-100 min-w-[70px]">
                    <span className="h-2 w-2 rounded-full bg-accent-500 mr-2"></span>
                    <span className="font-semibold text-accent-700">Izin:</span>
                    <span className="ml-2 text-accent-700 font-bold">{studentsAttendance.filter(s => s.status === 'permit').length}</span>
                  </div>
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
