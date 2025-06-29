import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Edit, Trash2, QrCode, Download, X, AlertCircle, Upload, Info } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react'; 
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';
import * as XLSX from 'xlsx';

// Ini Wajib Kamu Ingat! (Import Komponen yang Baru Dibuat)
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import StudentFormModal from '../../components/students/StudentFormModal';
import ImportResultsModal from '../../components/students/ImportResultsModal';
import ImportGuidelinesModal from '../../components/students/ImportGuidelinesModal';
import StudentTable from '../../components/students/StudentTable'; // Tabel siswa utama

// Ini Wajib Kamu Ingat! (Konsistensi Interface Global)
// Lebih baik definisikan interface ini di satu tempat (misal: src/types/models.ts)
// Tapi untuk saat ini, kita bisa ulang atau buat file terpisah.
interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
  birth_date: string; // FormatYYYY-MM-DD
  address?: string;
  parent_name?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClassItem {
  id: string;
  name: string;
  homeroom_teacher_id?: string | null;
  homeroom_teacher_name?: string | null;
}

const StudentsPage: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  
  // --- START: Deklarasi Semua State di Bagian Paling Atas Komponen ---
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
    nis: '', name: '', class: '', gender: 'L', birth_date: '',
    address: '', parent_name: '', phone_number: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResults, setImportResults] = useState<any[] | null>(null);
  const [showImportResultsModal, setShowImportResultsModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

  const [classes, setClasses] = useState<ClassItem[]>([]); 
  // --- END: Deklarasi Semua State dan Ref ---


  // --- START: Deklarasi Fungsi-fungsi dengan useCallback ---
  // Ini Wajib Kamu Ingat! (Fungsi dengan useCallback Dideklarasikan Setelah SEMUA State)
  // Ini memastikan semua dependensi (state, setter) sudah ada sebelum fungsi ini dibuat.

  // PENTING: resetForm harus dideklarasikan di awal karena dipanggil oleh handleSubmit dan handleFormSubmit
  const resetForm = useCallback(() => {
    setFormData({
      nis: '', name: '', class: '', gender: 'L', birth_date: '',
      address: '', parent_name: '', phone_number: ''
    });
    setSelectedStudent(null);
    setShowForm(false);
    setError(null);
  }, [setFormData, setSelectedStudent, setShowForm, setError]);

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/students');
      setStudents(response.data || []);
    } catch (err) {
      console.error('Error loading students:', err);
      let msg = 'Gagal memuat data siswa. Silakan coba lagi.';
      if (axios.isAxiosError(err) && axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [setStudents, setIsLoading, setError]); 

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  }, [setClasses]); 

  const handleDelete = useCallback(async () => { 
    if (!studentToDeleteId) return;

    setError(null);
    setIsLoading(true);

    try {
      await api.delete(`/students/${studentToDeleteId}`);
      console.log('Siswa berhasil dihapus:', studentToDeleteId);
      setShowConfirmModal(false); 
      setStudentToDeleteId(null); 
      await loadStudents(); 
    } catch (err) {
      console.error('Error deleting student:', err);
      let msg = 'Terjadi kesalahan saat menghapus siswa.';
      if (axios.isAxiosError(err) && axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [studentToDeleteId, loadStudents, setShowConfirmModal, setStudentToDeleteId, setError, setIsLoading]); 

  const handleDeleteConfirmation = useCallback((id: string) => {
    setStudentToDeleteId(id); 
    setShowConfirmModal(true);
  }, [setStudentToDeleteId, setShowConfirmModal]); 

  const handleFormSubmit = useCallback(async (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null); // Clear form-specific error
    setIsLoading(true);

    try {
      const selectedClassName = data.class;
      if (!classes.some(c => c.name === selectedClassName)) {
        setError('Nama kelas tidak valid atau tidak terdaftar di sistem.');
        setIsLoading(false);
        return;
      }

      if (selectedStudent) {
        await api.put(`/students/${selectedStudent.id}`, data);
        console.log('Siswa berhasil diperbarui:', data);
      } else {
        await api.post('/students', data);
        console.log('Siswa berhasil ditambahkan:', data);
      }
      
      await loadStudents();
      resetForm();
    } catch (err) {
      console.error('Error saving student:', err);
      let msg = 'Terjadi kesalahan saat menyimpan data siswa.';
      if (axios.isAxiosError(err) && axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg); // Set form-specific error
    } finally {
      setIsLoading(false);
    }
  }, [classes, selectedStudent, loadStudents, resetForm, setIsLoading, setError]); // Dependencies

  const handleEdit = useCallback((student: Student) => {
    setSelectedStudent(student);
    setFormData({
      nis: student.nis, name: student.name, class: student.class, gender: student.gender, birth_date: student.birth_date,
      address: student.address || '', parent_name: student.parent_name || '', phone_number: student.phone_number || ''
    });
    setShowForm(true);
  }, [setSelectedStudent, setFormData, setShowForm]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        const jsonStudents: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); 

        if (jsonStudents.length < 2) {
            throw new Error("File Excel kosong atau tidak memiliki header.");
        }

        const allExpectedHeaders = ['nis', 'nama', 'kelas', 'jeniskelamin', 'tanggallahir', 'alamat', 'namaorangtua', 'nomortelepon'];
        const headers = jsonStudents[0].map((h: string) => h ? h.toLowerCase().replace(/[^a-z0-9]/g, '') : ''); 
        const requiredHeaders = ['nis', 'nama', 'kelas', 'jeniskelamin', 'tanggallahir'];
        
        const missingRequiredHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingRequiredHeaders.length > 0) {
            throw new Error(`Header Excel tidak lengkap. Diperlukan: ${requiredHeaders.join(', ')}. Yang hilang: ${missingRequiredHeaders.join(', ')}`);
        }

        const studentsToImport = [];
        const validClassNames = classes.map(c => c.name); 

        for (let i = 1; i < jsonStudents.length; i++) { 
            const row = jsonStudents[i];
            
            if (!row || row.length === 0 || row.every((cell: any) => cell === null || cell === undefined || String(cell).trim() === '')) {
                continue; 
            }

            let rowStatus = 'success';
            let rowMessage = 'Siap diimpor.';
            const student: any = {}; 

            allExpectedHeaders.forEach(headerKey => { 
                const colIndex = headers.indexOf(headerKey);
                if (colIndex !== -1 && row[colIndex] !== undefined) {
                    student[headerKey] = row[colIndex];
                }
            });

            const classNameFromExcel = String(student.kelas || '').trim();
            if (!validClassNames.includes(classNameFromExcel)) {
                rowStatus = 'failed';
                rowMessage = `Kelas "${classNameFromExcel}" tidak ditemukan di database.`;
            }
            
            for (const reqHeader of requiredHeaders) {
                if (!String(student[reqHeader] || '').trim()) {
                    rowStatus = 'failed';
                    rowMessage = `Data kolom '${reqHeader}' kosong.`;
                    break; 
                }
            }

            const studentMapped = {
                nis: String(student.nis || '').trim(),
                name: String(student.nama || '').trim(),
                class: classNameFromExcel, 
                gender: String(student.jeniskelamin || '').trim().toUpperCase() === 'P' ? 'P' : 'L', 
                birth_date: student.tanggallahir ? 
                    (typeof student.tanggallahir === 'number' 
                        ? XLSX.SSF.parse_date_code(student.tanggallahir).toISOString().split('T')[0] 
                        : new Date(student.tanggallahir).toISOString().split('T')[0]) 
                    : '', 
                address: String(student.alamat || '').trim(), 
                parent_name: String(student.namaorangtua || '').trim(), 
                phone_number: String(student.nomortelepon || '').trim(), 
            };

            studentsToImport.push({
                student: studentMapped,
                status: rowStatus,
                message: rowMessage
            });
        }

        const validStudentsForBackend = studentsToImport.filter(s => s.status === 'success').map(s => s.student);

        if (validStudentsForBackend.length === 0 && studentsToImport.length > 0) {
            setImportResults(studentsToImport);
            setShowImportResultsModal(true);
            throw new Error("Tidak ada siswa yang valid untuk diimpor ke database.");
        } else if (studentsToImport.length === 0) {
            setImportResults(studentsToImport); // Tampilkan modal kosong/header saja
            setShowImportResultsModal(true);
            throw new Error("Tidak ada data siswa yang valid ditemukan setelah header.");
        }

        const response = await api.post('/students/bulk-import', validStudentsForBackend);
        
        const finalResults = studentsToImport.map(s => {
            if (s.status === 'failed') return s; 
            const backendResult = response.data.results.find((br: any) => br.student.nis === s.student.nis);
            return backendResult || s; 
        });

        setImportResults(finalResults);
        setShowImportResultsModal(true);
        await loadStudents(); 
        
      } catch (err: any) {
        console.error('Error processing file or importing students:', err);
        setError(`Gagal mengimpor siswa: ${err.message || 'Terjadi kesalahan.'}`);
        setImportResults(null); 
        setShowImportResultsModal(false);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; 
      }
    };
    reader.readAsArrayBuffer(file);
  }, [classes, loadStudents, setImportResults, setShowImportResultsModal, setError, setIsLoading]); 
  // --- END: Deklarasi Fungsi-fungsi dengan useCallback ---


  // useEffect untuk memuat data awal
  useEffect(() => {
    loadStudents();
    if (currentUser?.role === 'admin') { 
      fetchClasses();
    }
  }, [loadStudents, fetchClasses, currentUser]); 

  // Filter siswa untuk tampilan tabel
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate QR data
  const generateQRData = (student: Student) => {
    if (!student) return '';
    return JSON.stringify({
      id: student.id,
      nis: student.nis,
      name: student.name,
      class: student.class
    });
  };

  // Download QR
  const downloadQR = (studentId: string) => {
    const canvas = document.getElementById(`qr-${studentId}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      document.body.removeChild(downloadLink);
    }
  };

  // Otorisasi Frontend - Melindungi Halaman
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
          {/* Tombol Ketentuan Impor */}
          <button
            onClick={() => setShowGuidelinesModal(true)}
            className="btn-outline flex items-center text-gray-600 hover:text-gray-900"
          >
            <Info className="h-5 w-5 mr-1" />
            Ketentuan Impor
          </button>
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

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen StudentTable) */}
      <StudentTable 
        students={filteredStudents}
        isLoading={isLoading}
        error={error} // Passing error to StudentTable for display
        onEdit={handleEdit}
        onDeleteConfirmation={handleDeleteConfirmation}
        onShowQR={id => setShowQR(id)} 
        searchTerm={searchTerm}
      />

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen StudentFormModal) */}
      <StudentFormModal
        isOpen={showForm}
        onClose={resetForm}
        onSubmit={handleFormSubmit}
        initialData={selectedStudent}
        isLoading={isLoading} 
        formError={error} 
        classes={classes} 
      />

      {/* QR Code Modal (tetap di sini karena menggunakan state showQR dari StudentsPage) */}
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

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen ConfirmDeleteModal) */}
      <ConfirmDeleteModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus Siswa"
        message="Apakah Anda yakin ingin menghapus siswa ini? Aksi ini akan menghapus semua data terkait siswa ini (termasuk absensi)."
      />

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen ImportResultsModal) */}
      <ImportResultsModal
        isOpen={showImportResultsModal}
        onClose={() => setShowImportResultsModal(false)}
        results={importResults}
      />

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen ImportGuidelinesModal) */}
      <ImportGuidelinesModal
        isOpen={showGuidelinesModal}
        onClose={() => setShowGuidelinesModal(false)}
      />
    </div>
  );
};

export default StudentsPage;
