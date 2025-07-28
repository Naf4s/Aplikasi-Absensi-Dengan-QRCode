import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Plus, Info, AlertCircle } from 'lucide-react'; 
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';
import * as XLSX from 'xlsx';

import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import StudentFormModal from '../../components/students/StudentFormModal';
import ImportResultsModal from '../../components/students/ImportResultsModal';
import ImportGuidelinesModal from '../../components/students/ImportGuidelinesModal';
import StudentTable from '../../components/students/StudentTable'; 
import StudentQrModal from '../../components/students/StudentQrModal'; 


interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
  birth_date: string; 
  address?: string;
  parent_name?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface untuk Kelas)
interface ClassItem {
  id: string;
  name: string;
  homeroom_teacher_id?: string | null;
  homeroom_teacher_name?: string | null;
}

// Interface untuk konfigurasi sorting
interface SortConfig {
  key: keyof Student | null; // Kunci kolom untuk sorting (misal: 'name', 'nis', 'class')
  direction: 'ascending' | 'descending' | null; // Arah sorting
}

const StudentsPage: React.FC = () => {
  // State untuk filter per kolom
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  // State untuk pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  // Handler filter per kolom
  const handleColumnFilterChange = (key: keyof Student, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset ke halaman 1 saat filter berubah
  };
  // Handler pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
  };
  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(1);
  };
  // State untuk error import modal
  const [importError, setImportError] = useState<string | null>(null);
  const { user: currentUser, hasPermission } = useAuth();
  
  // --- START: DEKLARASI SEMUA STATE DAN REF DI BAGIAN PALING ATAS KOMPONEN ---
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // Ini Wajib Kamu Ingat! (State baru untuk modal QR Code)
  const [qrStudentData, setQrStudentData] = useState<Student | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null); // Menggunakan pageError untuk error umum halaman
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState<string | null>(null); 
  // Removed duplicate declarations of sortConfig and setSortConfig
  // const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' }); 

  // Removed unused formData and someKey states
  // const [formData, setFormData] = useState<Omit<Student, 'id' | 'created_at' | 'updated_at'>>({
  //   nis: '', name: '', class: '', gender: 'L', birth_date: '',
  //   address: '', parent_name: '', phone_number: ''
  // });

  // Fix TS error: key can be null, so change type to allow null
  // const [someKey, setSomeKey] = useState<keyof Student | null>(null);

  // Fix TS error: null is not assignable to keyof Student
  // Change sortConfig key type to allow null
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  const fileInputRef = useRef<HTMLInputElement>(null); 
  const [importResults, setImportResults] = useState<any[] | null>(null);
  const [showImportResultsModal, setShowImportResultsModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

  const [classes, setClasses] = useState<ClassItem[]>([]); 
  // State untuk filter kelas pada ekspor massal (pindah ke modal)
  const [selectedClassExport, setSelectedClassExport] = useState<string>('');
  // State untuk kontrol dialog export QR
  const [showExportQrDialog, setShowExportQrDialog] = useState(false);
  // --- END: DEKLARASI SEMUA STATE DAN REF ---

  const resetForm = useCallback(() => { 
    // Removed setFormData call since formData state is removed
    setSelectedStudent(null);
    setShowForm(false);
    setPageError(null); 
  }, [setSelectedStudent, setShowForm, setPageError]);

  const loadStudents = useCallback(async () => { 
    try {
      setIsLoading(true);
      setPageError(null); 
      const response = await api.get('/students');
      setStudents(response.data || []);
    } catch (err) {
      console.error('Error loading students:', err);
      let msg = 'Gagal memuat data siswa. Silakan coba lagi.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setPageError(msg); 
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [setStudents, setIsLoading, setPageError]); 

  const fetchClasses = useCallback(async () => { 
    try {
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  }, [setClasses]); 

  const handleDelete = async () => { 
    if (!studentToDeleteId) return;

    setPageError(null); 
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
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setPageError(msg); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmation = (id: string) => { 
    setStudentToDeleteId(id); 
    setShowConfirmModal(true);
  };

  const handleFormSubmit = useCallback(async (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => { 
    setPageError(null); 
    setIsLoading(true);

    try {
      const selectedClassName = data.class;
      if (!classes.some(c => c.name === selectedClassName)) {
        setPageError('Nama kelas tidak valid atau tidak terdaftar di sistem.'); 
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
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setPageError(msg); 
    } finally {
      setIsLoading(false);
    }
  }, [classes, selectedStudent, loadStudents, resetForm, setIsLoading, setPageError]); 

  const handleEdit = useCallback((student: Student) => { 
    setSelectedStudent(student);
    // Removed setFormData call since formData state is removed
    setShowForm(true);
  }, [setSelectedStudent, setShowForm]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => { 
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setPageError(null); 
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
            setImportResults(studentsToImport); 
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
        setPageError(null); // Jangan tampilkan di atas tabel, gunakan modal khusus
        setImportError(err.message || 'Terjadi kesalahan saat mengimpor siswa.');
        setImportResults(null); 
        setShowImportResultsModal(false);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; 
      }
    };
    reader.readAsArrayBuffer(file);
  }, [classes, loadStudents, setImportResults, setShowImportResultsModal, setPageError, setIsLoading]); 


  const handleSort = useCallback((key: keyof Student) => {
    let direction: SortConfig['direction'] = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null; 
      // key = null; // Cannot assign null to key of type keyof Student, so set to undefined instead
      key = undefined as unknown as keyof Student; 
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);


  const sortedStudents = useMemo(() => { 
    let filtered = [...students];
    // Filter global search
    filtered = filtered.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Filter per kolom
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(student => {
          const val = String(student[key as keyof Student] || '').toLowerCase();
          return val.includes(value.toLowerCase());
        });
      }
    });
    // Sorting
    if (sortConfig.key !== null && sortConfig.direction !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === 'ascending' ? comparison : -comparison;
        } else if (aValue !== undefined && bValue !== undefined) {
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          } else if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return filtered;
  }, [students, searchTerm, columnFilters, sortConfig]);

  // Data untuk halaman saat ini
  const pagedStudents = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    return sortedStudents.slice(startIdx, startIdx + rowsPerPage);
  }, [sortedStudents, page, rowsPerPage]);


  const generateQRData = (student: Student) => {
    if (!student) return '';
    return JSON.stringify({
      id: student.id,
      nis: student.nis,
      name: student.name,
      class: student.class
    });
  };

  // Fungsi untuk ekspor QR Codes, dipanggil dari modal
  // Fix onClick handler type error by wrapping function to accept event and call with className
  // Removed unused exportAllQRCodesToXLSXHandler function

  const exportAllQRCodesToXLSX = useCallback(async (className?: string) => {
    const studentsToExport = className
      ? students.filter(s => s.class === className)
      : students;
    if (studentsToExport.length === 0) {
      setPageError(className ? `Tidak ada data siswa untuk kelas ${className}.` : "Tidak ada data siswa untuk diekspor.");
      return;
    }
    setIsLoading(true);
    setPageError(null);
    try {
      const QRCodeLib = await import('qrcode');
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const imagesFolder = zip.folder('qr-images');
      const data = await Promise.all(studentsToExport.map(async (student) => {
        const qrData = generateQRData(student);
        const qrPngDataUrl = await QRCodeLib.toDataURL(qrData, { margin: 1, width: 256 });
        const base64 = qrPngDataUrl.split(',')[1];
        const fileName = `${student.nis}_${student.name.replace(/\s+/g, '_')}.png`;
        if (imagesFolder) {
          imagesFolder.file(fileName, base64, { base64: true });
        }
        return {
          NIS: student.nis,
          Nama: student.name,
          Kelas: student.class,
          Gender: student.gender === 'L' ? 'Laki-laki' : 'Perempuan',
          'Tanggal Lahir': student.birth_date,
          'Nama Orang Tua': student.parent_name,
          'QR Code (PNG)': `qr-images/${fileName}`
        };
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'QR Siswa');
      const xlsxBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      zip.file('qr-codes-all-students.xlsx', xlsxBlob);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = className
        ? `qr-codes-${className.replace(/\s+/g, '_')}.zip`
        : 'qr-codes-all-students.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error: any) {
      console.error("Error exporting QR codes to ZIP:", error);
      setPageError("Gagal mengekspor QR Code ke ZIP.");
    } finally {
      setIsLoading(false);
      setShowExportQrDialog(false);
    }
  }, [students, setPageError, setIsLoading]);
  // --- END: Deklarasi Semua Fungsi ---

  // useEffect untuk memuat data awal
  useEffect(() => {
    loadStudents();
    if (currentUser?.role === 'admin') { 
      fetchClasses();
    }
  }, [loadStudents, fetchClasses, currentUser]); 

  // --- START: Bagian JSX (Tampilan Komponen) ---
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
      {/* Modal Alert untuk Error Import Siswa */}
      {importError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 flex flex-col items-center animate-slide-up">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Gagal Impor Siswa</h2>
            <p className="text-center text-gray-700 mb-4">{importError}</p>
            <button
              className="btn-primary w-full"
              onClick={() => setImportError(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Manajemen Siswa</h1>
          {/* Tombol versi web (desktop/tablet) */}
          <div className="hidden sm:flex space-x-2 items-center">
            <button
              onClick={() => setShowGuidelinesModal(true)}
              className="btn-outline flex items-center text-gray-600 hover:text-gray-900"
            >
              <Info className="h-5 w-5 mr-1" />
              Ketentuan Impor
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-outline flex items-center"
            >
              <Info className="h-5 w-5 mr-1" />
              Import Excel
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <button
              onClick={() => setShowExportQrDialog(true)}
              className="btn-outline flex items-center ml-2"
              disabled={isLoading || students.length === 0}
              title="Export Semua QR Code ke XLSX"
            >
              Export QR Codes
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              Tambah Siswa
            </button>
          </div>
      {/* Modal untuk memilih kelas sebelum ekspor QR Code */}
      {showExportQrDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl max-w-xs w-full p-6 flex flex-col items-center animate-slide-up">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Export QR Codes</h2>
            <label htmlFor="select-class-export" className="mb-2 text-sm text-gray-700 w-full">Pilih Kelas</label>
            <select
              id="select-class-export"
              className="border rounded px-2 py-1 mb-4 w-full"
              value={selectedClassExport}
              onChange={e => setSelectedClassExport(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            <div className="flex w-full gap-2">
              <button
                className="btn-outline flex-1"
                onClick={() => setShowExportQrDialog(false)}
                disabled={isLoading}
              >Batal</button>
              <button
                className="btn-primary flex-1"
                onClick={() => exportAllQRCodesToXLSX(selectedClassExport)}
                disabled={isLoading || students.length === 0}
              >Export</button>
            </div>
          </div>
        </div>
      )}
        </div>
        {/* Tombol versi mobile */}
        <div className="flex flex-wrap gap-2 mt-3 sm:hidden">
          <button
            onClick={() => setShowGuidelinesModal(true)}
            className="btn-outline flex items-center text-gray-600 hover:text-gray-900 px-2 py-1 text-xs rounded"
            style={{ minWidth: 0 }}
          >
            <Info className="h-4 w-4 mr-1" />
            Ketentuan Impor
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-outline flex items-center px-2 py-1 text-xs rounded"
            style={{ minWidth: 0 }}
          >
            <Info className="h-4 w-4 mr-1" />
            Import Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => exportAllQRCodesToXLSX()}
            className="btn-outline flex items-center px-2 py-1 text-xs rounded"
            disabled={isLoading || students.length === 0}
            title="Export Semua QR Code ke XLSX"
            style={{ minWidth: 0 }}
          >
            Export QR Codes
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center px-2 py-1 text-xs rounded"
            style={{ minWidth: 0 }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {pageError && ( 
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageError}</span>
        </div>
      )}

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen StudentTable) */}
      <StudentTable 
        students={pagedStudents}
        isLoading={isLoading}
        error={pageError}
        onEdit={handleEdit}
        onDeleteConfirmation={handleDeleteConfirmation}
        onShowQR={id => { 
          const studentFound = students.find(s => s.id === id);
          if (studentFound) {
            setQrStudentData(studentFound); 
          }
        }}
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        onSort={handleSort}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={sortedStudents.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen StudentFormModal) */}
      <StudentFormModal
        isOpen={showForm}
        onClose={resetForm}
        onSubmit={handleFormSubmit}
        initialData={selectedStudent}
        isLoading={isLoading} 
        formError={pageError} 
        classes={classes} 
      />

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen StudentQrModal) */}
      <StudentQrModal
        isOpen={!!qrStudentData} 
        onClose={() => setQrStudentData(null)} 
        student={qrStudentData} 
        onError={setPageError} 
      />

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
