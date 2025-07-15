import React, { useState, useEffect, useCallback } from 'react';
import {Download, Search, Users, RefreshCw, AlertCircle, SendHorizonalIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';

// Ini Wajib Kamu Ingat! (Konsistensi Interface Kelas)
// Interface ini harus sesuai dengan data kelas yang dikembalikan oleh backend.
interface MonthItem {
  bulan_alpha: string;
}

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
  status: 'absent' | 'none'; // 'none' jika belum ada record
  total_absent: string;
  absent_dates: string;
  phone_number: string;
}

const AlphaPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [studentsAttendance, setStudentsAttendance] = useState<
    StudentAttendanceStatus[]
  >([]);
  const [loadingNotification, setLoadingNotification] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ini Wajib Kamu Ingat! (State Baru untuk Daftar Kelas Dinamis)
  const [month, setMonth] = useState<MonthItem[]>([]); // Untuk menyimpan daftar bulan dari backend
  const [classes, setClasses] = useState<ClassItem[]>([]); // Untuk menyimpan daftar kelas dari backend

  // Fungsi untuk memuat status absensi siswa per kelas dan tanggal dari backend
  const loadStudentAttendance = useCallback(
    async (className: string, monthName: string) => {
      try {
        setIsLoading(true);
        setError(null);
        // Panggil API untuk mendapatkan status absensi siswa per kelas dan tanggal
        const response = await api.get(`/attendance/status-by-month`, {
          params: { className, monthName },
        });
        setStudentsAttendance(response.data || []);
      } catch (err) {
        console.error("Error loading student attendance:", err);
        let msg = "Gagal memuat status absensi siswa. Silakan coba lagi.";
        if (
          axios.isAxiosError(err) &&
          err.response &&
          err.response.data &&
          err.response.data.message
        ) {
          msg = err.response.data.message;
        }
        setError(msg);
        setStudentsAttendance([]); // Clear students on error
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fungsi untuk mengambil daftar kelas dari backend
  const fetchClasses = useCallback(async () => {
    try {
      // Endpoint /api/classes sudah diupdate di backend untuk mengembalikan kelas sesuai role user
      const response = await api.get("/classes");
      setClasses(response.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      // Jangan set error global di sini agar tidak menimpa error absensi
    }
  }, []);

  useEffect(() => {
    fetchClasses(); // Ambil daftar kelas saat komponen pertama kali di-mount
  }, [fetchClasses]);

  // Fungsi untuk mengambil bulan dari backend
  const fetchMonth = useCallback(async () => {
    try {
      // Endpoint /api/classes sudah diupdate di backend untuk mengembalikan kelas sesuai role user
      const response = await api.get(`/attendance/absent-month`);
      setMonth(response.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      // Jangan set error global di sini agar tidak menimpa error absensi
    }
  }, []);

  useEffect(() => {
    fetchMonth(); // Ambil daftar bulan saat komponen pertama kali di-mount
  }, [fetchMonth]);

  // Effect untuk memuat absensi saat kelas atau tanggal berubah
  useEffect(() => {
    if (selectedClass && selectedMonth) {
      loadStudentAttendance(selectedClass, selectedMonth);
    }
  }, [selectedClass, selectedMonth, loadStudentAttendance]);

  // Handle ketika kelas dipilih
  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setSearchTerm(""); // Reset search term when class changes
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setSearchTerm(""); // Reset search term when class changes
  };

  // Filter siswa berdasarkan search term
  const filteredStudents = studentsAttendance.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge class (styling)
  const getStatusBadgeClass = (status: StudentAttendanceStatus["status"]) => {
    switch (status) {
      case "absent":
        return "bg-error-100 text-error-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Ini Wajib Kamu Ingat! (Kontrol Akses Frontend dengan `hasPermission`)
  // Jika user tidak memiliki izin 'view_attendance', jangan tampilkan konten.
  if (!hasPermission("view_attendance")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk melihat halaman ini.</p>
      </div>
    );
  }

  function formatMonthYear(ymString: string): string {
    // Buat objek Date. Kita tambahkan '-01' agar menjadi tanggal yang valid,
    // karena 'YYYY-MM' saja bisa memicu perilaku aneh di beberapa browser/lingkungan.
    // Misalnya, '2025-07' menjadi '2025-07-01'.
    const date = new Date(`${ymString}-01`);

    // Pastikan tanggal valid sebelum memformat
    if (isNaN(date.getTime())) {
      return "Invalid Date"; // Atau tangani error sesuai kebutuhan
    }

    // Gunakan toLocaleString untuk memformat bulan dan tahun
    // 'id-ID' untuk Bahasa Indonesia
    // 'en-US' untuk Bahasa Inggris
    const options: Intl.DateTimeFormatOptions = {
      month: "long", // 'long' untuk nama bulan lengkap (misal: "Juli")
      year: "numeric", // 'numeric' untuk tahun (misal: "2025")
    };

    return date.toLocaleString("id-ID", options);
  }

  const sendNotification = useCallback(async (student: StudentAttendanceStatus) => {
    if (loadingNotification === student.id) {
      console.log(student.phone_number);
      
      await api.post("/sendWa", {
        phone_number: student.phone_number,
      });
      return;
    }

    setLoadingNotification(student.id);

    try {
      const response = await api.post("/attendance/sendWa", {
        phone_number: student.phone_number,
        siswa: student,
      });

      const result = await response.data.message;
      console.log(`Notification sent successfully for ${student.name}:`, result);
      alert(`Notifikasi berhasil dikirim untuk ${student.name}!`);

    } catch (error) {
      console.error(`Failed to send notification for ${student.name}:`, error);
      alert(`Gagal mengirim notifikasi untuk ${student.name}: ${(error as Error).message}`);
    } finally {
      setLoadingNotification(null);
    }
  }, [loadingNotification]); 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Absensi Siswa</h1>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Class List */}
        <div className="md:col-span-1 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">
                Daftar Bulan Alpha
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {month.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Tidak ada bulan alpha.
                </div>
              ) : (
                month.map(
                  (
                    MonthItem // Menggunakan `classes` state
                  ) => (
                    <button
                      key={MonthItem.bulan_alpha}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        selectedMonth === MonthItem.bulan_alpha
                          ? "bg-primary-50"
                          : "" // Bandingkan dengan class.name
                      }`}
                      onClick={() => handleMonthSelect(MonthItem.bulan_alpha)} // Mengirim class.name sebagai ID yang dipilih
                    >
                      <div className="font-medium text-gray-900">
                        {formatMonthYear(MonthItem.bulan_alpha)}
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">
                Daftar Kelas
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {classes.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Tidak ada kelas yang terdaftar.
                </div>
              ) : (
                classes.map(
                  (
                    classItem // Menggunakan `classes` state
                  ) => (
                    <button
                      key={classItem.id}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        selectedClass === classItem.name ? "bg-primary-50" : "" // Bandingkan dengan class.name
                      }`}
                      onClick={() => handleClassSelect(classItem.name)} // Mengirim class.name sebagai ID yang dipilih
                    >
                      <div className="font-medium text-gray-900">
                        Kelas {classItem.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {classItem.homeroom_teacher_name || "-"}
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </div>
        </div>

        {/* Student List or QR Code */}
        <div className="md:col-span-3">
          {!selectedMonth ? (
            <div className="card p-6 flex flex-col items-center justify-center text-center h-full">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pilih Bulan dan kelas
              </h3>
              <p className="text-gray-500">
                Silakan pilih bulan dan kelas dari daftar untuk melihat dan
                mengelola absensi siswa.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="p-4 bg-white border-b border-gray-200 flex flex-wrap justify-between items-center space-y-3">
                <h2 className="text-lg font-medium text-gray-900">
                  Siswa Kelas {selectedClass} Bulan{" "}
                  {formatMonthYear(selectedMonth)}
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
                    onClick={() =>
                      selectedClass &&
                      selectedMonth &&
                      loadStudentAttendance(selectedClass, selectedMonth)
                    }
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        No
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        NIS
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nama
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total Absent
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tanggal
                      </th>
                      {hasPermission("send_notification") && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Aksi
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={hasPermission("send_notification") ? 7 : 6}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
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
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                student.status
                              )}`}
                            >
                              {student.status === "absent"
                                ? "Tanpa Keterangan"
                                : "Belum Absen"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.total_absent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.absent_dates}
                          </td>

                          {hasPermission("send_notification") && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => sendNotification(student)} // Ini yang benar!
                                disabled={loadingNotification === student.id} // Disable saat notifikasi sedang dikirim
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                {loadingNotification === student.id ? (
                                  <span>Mengirim...</span> // Teks saat loading
                                ) : (
                                  <SendHorizonalIcon className="h-5 w-5" />
                                )}
                              </button>
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
                  Menampilkan {filteredStudents.length} dari{" "}
                  {studentsAttendance.length} siswa
                </div>

                <div className="flex space-x-2 text-sm">
                  <span className="text-error-700 bg-error-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-error-500 mr-1"></div>
                    Tanpa Keterangan:{" "}
                    {
                      studentsAttendance.filter((s) => s.status === "absent")
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlphaPage;
