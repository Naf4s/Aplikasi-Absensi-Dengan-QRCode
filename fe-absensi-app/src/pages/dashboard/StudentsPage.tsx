import React, { useState, useEffect, useCallback, useRef } from 'react'; // Tambah useRef
import { Search, Plus, Edit, Trash2, QrCode, Download, X, AlertCircle, Upload } from 'lucide-react'; // Tambah Upload icon
import { QRCodeCanvas } from 'qrcode.react'; 
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import library XLSX

// Ini Wajib Kamu Ingat! (Konsistensi Interface Student)
// Pastikan interface ini sesuai dengan model siswa di backend.
interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
  birth_date: string; // Format YYYY-MM-DD
  address?: string;
  parent_name?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

// Ini Wajib Kamu Ingat! (Interface untuk Kelas)
// Interface ini harus sesuai dengan data kelas yang dikembalikan oleh backend.
interface ClassItem {
  id: string;
  name: string;
  homeroom_teacher_id?: string | null;
  homeroom_teacher_name?: string | null;
}

const StudentsPage: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'created_at' | 'updated_at'>>({
    nis: '',
    name: '',
    class: '',
    gender: 'L',
    birth_date: '',
    address: '',
    parent_name: '',
    phone_number: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref untuk input file Excel
  const [importResults, setImportResults] = useState<any[] | null>(null); // Untuk hasil impor
  const [showImportResultsModal, setShowImportResultsModal] = useState(false); // Modal hasil impor

  // Ini Wajib Kamu Ingat! (State Baru untuk Daftar Kelas Dinamis)
  const [classes, setClasses] = useState<ClassItem[]>([]); // Untuk menyimpan daftar kelas dari backend


  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/students');
      setStudents(response.data || []);
    } catch (err) {
      console.error('Error loading students:', err);
      let msg = 'Gagal memuat data siswa. Silakan coba lagi.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ini Wajib Kamu Ingat! (Fungsi untuk Mengambil Daftar Kelas dari Backend)
  const fetchClasses = useCallback(async () => {
    try {
      // Endpoint /api/classes dilindungi oleh authorizeRoles('admin')
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      // Jangan set error di sini agar tidak menimpa error utama loading siswa
    }
  }, []);

  useEffect(() => {
    loadStudents();
    // Panggil fetchClasses saat komponen pertama kali di-mount atau saat currentUser berubah
    if (currentUser?.role === 'admin') { // Hanya admin yang perlu daftar kelas lengkap untuk form ini
      fetchClasses();
    }
  }, [loadStudents, fetchClasses, currentUser]); // Tambah fetchClasses dan currentUser ke dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);
      if (selectedStudent) {
        await api.put(`/students/${selectedStudent.id}`, formData);
        console.log('Siswa berhasil diperbarui:', formData);
      } else {
        await api.post('/students', formData);
        console.log('Siswa berhasil ditambahkan:', formData);
      }
      
      await loadStudents();
      resetForm();
    } catch (err) {
      console.error('Error saving student:', err);
      let msg = 'Terjadi kesalahan saat menyimpan data siswa.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nis: '',
      name: '',
      class: '',
      gender: 'L',
      birth_date: '',
      address: '',
      parent_name: '',
      phone_number: ''
    });
    setSelectedStudent(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      nis: student.nis,
      name: student.name,
      class: student.class,
      gender: student.gender,
      birth_date: student.birth_date,
      address: student.address || '',
      parent_name: student.parent_name || '',
      phone_number: student.phone_number || ''
    });
    setShowForm(true);
  };

  const handleDeleteConfirmation = (id: string) => {
    setStudentToDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!studentToDeleteId) return;

    setError(null);
    setIsLoading(true);

    try {
      await api.delete(`/students/${studentToDeleteId}`);
      console.log('Siswa berhasil dihapus:', studentToDeleteId);
      setConfirmDeleteModal(false);
      setUserToDeleteId(null);
      await loadStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      let msg = 'Terjadi kesalahan saat menghapus siswa.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateQRData = (student: Student) => {
    if (!student) return '';
    return JSON.stringify({
      id: student.id,
      nis: student.nis,
      name: student.name,
      class: student.class
    });
  };

  const downloadQR = (studentId: string) => {
    const canvas = document.getElementById(`qr-${studentId}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${studentId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Ini Wajib Kamu Ingat! (Fungsi untuk Memproses File Excel)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setImportResults(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert worksheet to JSON array
        // header: 1 means first row is header, default is array of arrays
        const jsonStudents: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); 

        if (jsonStudents.length < 2) {
            throw new Error("File Excel kosong atau tidak memiliki header.");
        }

        // Ini Wajib Kamu Ingat! (Format Kolom Excel yang Diharapkan)
        // Sesuaikan mapping ini dengan kolom yang kamu harapkan di Excel
        // Contoh header yang diharapkan: NIS, Nama, Kelas, JenisKelamin, TanggalLahir, Alamat, NamaOrangTua, NomorTelepon
        const headers = jsonStudents[0].map((h: string) => h ? h.toLowerCase().replace(/[^a-z0-9]/g, '') : ''); // Bersihkan header dan handle null/undefined
        const requiredHeaders = ['nis', 'nama', 'kelas', 'jeniskelamin', 'tanggallahir'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`Header Excel tidak lengkap. Diperlukan: ${requiredHeaders.join(', ')}. Yang hilang: ${missingHeaders.join(', ')}`);
        }

        const studentsToImport = [];
        for (let i = 1; i < jsonStudents.length; i++) { // Mulai dari baris kedua (data)
            const row = jsonStudents[i];
            const student: any = {};
            // Pastikan baris memiliki data yang cukup sebelum diakses
            if (!row || row.length === 0 || row.every((cell: any) => cell === null || cell === undefined || String(cell).trim() === '')) {
                // Baris kosong, lewati
                continue;
            }

            requiredHeaders.forEach(reqHeader => {
                const colIndex = headers.indexOf(reqHeader);
                if (colIndex !== -1 && row[colIndex] !== undefined) {
                    student[reqHeader] = row[colIndex];
                }
            });

            // Map ke format yang sesuai dengan backend
            studentsToImport.push({
                nis: String(student.nis || '').trim(),
                name: String(student.nama || '').trim(),
                class: String(student.kelas || '').trim(), // Pastikan nama kelas dari Excel sesuai dengan nama kelas di DB
                gender: String(student.jeniskelamin || '').trim().toUpperCase() === 'P' ? 'P' : 'L', // Pastikan L/P
                // Tanggal lahir dari Excel (seringkali berupa angka serial Excel date number)
                // Jika dari Excel adalah number, XLSX.SSF.parse_date_code bisa membantu
                birth_date: student.tanggallahir ? 
                    (typeof student.tanggallahir === 'number' 
                        ? XLSX.SSF.parse_date_code(student.tanggallahir).toISOString().split('T')[0] 
                        : new Date(student.tanggallahir).toISOString().split('T')[0]) 
                    : '', // Format YYYY-MM-DD
                address: String(student.alamat || '').trim(),
                parent_name: String(student.namaorangtua || '').trim(),
                phone_number: String(student.nomortelepon || '').trim(),
            });
        }

        if (studentsToImport.length === 0) {
            throw new Error("Tidak ada data siswa yang valid ditemukan setelah header.");
        }

        // Kirim data ke backend untuk impor massal
        const response = await api.post('/students/bulk-import', studentsToImport);
        setImportResults(response.data.results);
        setShowImportResultsModal(true);
        await loadStudents(); // Muat ulang daftar siswa setelah impor
        
      } catch (err: any) {
        console.error('Error processing file or importing students:', err);
        setError(`Gagal mengimpor siswa: ${err.message || 'Terjadi kesalahan.'}`);
        setImportResults(null); // Clear previous results
        setShowImportResultsModal(false);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input file
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Ini Wajib Kamu Ingat! (Otorisasi Frontend - Melindungi Halaman)
  // Hanya admin yang bisa mengakses halaman ini.
  if (!hasPermission('manage_students') && currentUser?.role !== 'admin') {
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
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Siswa</h1>
        <div className="flex space-x-2">
          {/* Tombol Import Excel */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-outline flex items-center"
          >
            <Upload className="h-5 w-5 mr-1" />
            Import Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
          />
          {/* Tombol Tambah Siswa */}
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Kelamin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Lahir
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Orang Tua
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data siswa.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.nis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.birth_date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.parent_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmation(student.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setShowQR(student.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <QrCode className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Student Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIS</label>
                  <input
                    type="text"
                    name="nis"
                    required
                    value={formData.nis}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kelas</label>
                  <select
                    name="class"
                    required
                    value={formData.class}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Pilih Kelas</option>
                    {/* Ini Wajib Kamu Ingat! (Menggunakan Daftar Kelas Dinamis) */}
                    {/* Mengganti hardcoded classList dengan classes yang diambil dari backend */}
                    {classes.map((classItem) => ( // Gunakan `classes` state
                      <option key={classItem.id} value={classItem.name}> {/* value adalah class.name */}
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="birth_date"
                    required
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nama Orang Tua</label>
                  <input
                    type="text"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-70"
                >
                  {isLoading ? 'Memproses...' : (selectedStudent ? 'Simpan Perubahan' : 'Tambah Siswa')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">QR Code Siswa</h2>
              <button
                onClick={() => setShowQR(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center">
              {showQR && (
                <>
                  <QRCodeCanvas
                    id={`qr-${showQR}`}
                    value={generateQRData(students.find(s => s.id === showQR)!)}
                    size={512}
                    level="H"
                    includeMargin={true}
                  />
                  <button
                    onClick={() => downloadQR(showQR)}
                    className="mt-4 flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download QR Code
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus Siswa</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700">Apakah Anda yakin ingin menghapus siswa ini? Aksi ini akan menghapus semua data terkait siswa ini (termasuk absensi).</p>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => { setShowConfirmModal(false); setStudentToDeleteId(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Results Modal */}
      {showImportResultsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">Hasil Impor Siswa</h2>
              <button
                onClick={() => setShowImportResultsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto">
              {importResults && importResults.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importResults.map((result, index) => (
                      <tr key={index} className={result.status === 'success' ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.student?.nis || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.student?.name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.status === 'success' ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{result.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500">Tidak ada hasil impor.</p>
              )}
            </div>
            <div className="p-5 border-t flex justify-end">
              <button
                onClick={() => setShowImportResultsModal(false)}
                className="btn-primary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
