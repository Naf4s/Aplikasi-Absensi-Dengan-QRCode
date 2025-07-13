import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search, Plus, Upload, Info } from 'lucide-react'; 
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
// import QRCode from 'qrcode'; // Temporarily commented out due to missing types, will handle alternative

// Ini Wajib Kamu Ingat! (Import Komponen yang Baru Dibuat)
// Pastikan komponen-komponen ini sudah ada di folder src/components/common/ dan src/components/students/
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import StudentFormModal from '../../components/students/StudentFormModal';
import ImportResultsModal from '../../components/students/ImportResultsModal';
import ImportGuidelinesModal from '../../components/students/ImportGuidelinesModal';
import StudentTable from '../../components/students/StudentTable'; 
import StudentQrModal from '../../components/students/StudentQrModal'; // Ini yang BARU diimpor!

// Ini Wajib Kamu Ingat! (Konsistensi Interface Global)
// Lebih baik definisikan interface ini di satu tempat (misal: src/types/models.ts)
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

// Ini Wajib Kamu Ingat! (Interface untuk Kelas)
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
  const { user: currentUser, hasPermission } = useAuth();
  
  // --- START: DEKLARASI SEMUA STATE DAN REF DI BAGIAN PALING ATAS KOMPONEN ---
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // Ini Wajib Kamu Ingat! (State baru untuk modal QR Code)
  const [qrStudentData, setQrStudentData] = useState<Student | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null); // Menggunakan pageError untuk error umum halaman
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState<string | null>(null); 
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' }); 

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'created_at' | 'updated_at'>>({
    nis: '', name: '', class: '', gender: 'L', birth_date: '',
    address: '', parent_name: '', phone_number: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null); 
  const [importResults, setImportResults] = useState<any[] | null>(null);
  const [showImportResultsModal, setShowImportResultsModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

  const [classes, setClasses] = useState<ClassItem[]>([]); 
  // --- END: DEKLARASI SEMUA STATE DAN REF ---


  // --- START: Deklarasi Fungsi-fungsi dengan useCallback / useMemo ---
  // Ini Wajib Kamu Ingat! (Fungsi dengan useCallback Dideklarasikan Setelah SEMUA State)
  // Ini memastikan semua dependensi (state, setter) sudah ada sebelum fungsi ini dibuat.

  const resetForm = useCallback(() => { 
    setFormData({
      nis: '', name: '', class: '', gender: 'L', birth_date: '',
      address: '', parent_name: '', phone_number: ''
    });
    setSelectedStudent(null);
    setShowForm(false);
    setPageError(null); 
  }, [setFormData, setSelectedStudent, setShowForm, setPageError]);

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
        setPageError(`Gagal mengimpor siswa: ${err.message || 'Terjadi kesalahan.'}`); 
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
      key = null; 
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);


  const sortedStudents = useMemo(() => { 
    let sortableStudents = [...students]; 

    sortableStudents = sortableStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key !== null && sortConfig.direction !== null) {
      sortableStudents.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === 'ascending' ? comparison : -comparison;
        } 
        else if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        } else if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableStudents;
  }, [students, searchTerm, sortConfig]); 


  const generateQRData = (student: Student) => {
    if (!student) return '';
    return JSON.stringify({
      id: student.id,
      nis: student.nis,
      name: student.name,
      class: student.class
    });
  };

  const exportAllQRCodesToPDF = useCallback(async () => {
    if (students.length === 0) {
      setPageError("Tidak ada data siswa untuk diekspor.");
      return;
    }
    setIsLoading(true);
    setPageError(null);
    try {
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4'
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const qrSize = 40;
      const textHeight = 10;
      const itemsPerRow = 2;
      const itemsPerPage = 8; // 2 columns x 4 rows
      let x = margin;
      let y = margin;
      let itemCount = 0;

      // Alternative QR code generation using canvas element
      const generateQRCodeDataUrl = (text: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          import('qrcode').then(QRCodeLib => {
            QRCodeLib.toCanvas(canvas, text, { margin: 1, width: 128 }, (error: any) => {
              if (error) reject(error);
              else resolve(canvas.toDataURL('image/png'));
            });
          }).catch(reject);
        });
      };

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const qrData = generateQRData(student);
        const qrImageDataUrl = await generateQRCodeDataUrl(qrData);

        // Add QR code image
        pdf.addImage(qrImageDataUrl, 'PNG', x, y, qrSize, qrSize);

        // Add student name and NIM below QR code, centered under QR code
        pdf.setFontSize(10);
        const centerX = x + qrSize / 2;
        pdf.text(student.name, centerX, y + qrSize + 5, { maxWidth: qrSize, align: 'center' });
        pdf.text(student.nis, centerX, y + qrSize + 12, { maxWidth: qrSize, align: 'center' });

        itemCount++;
        if (itemCount % itemsPerRow === 0) {
          x = margin;
          y += qrSize + textHeight + 15;
        } else {
          x += (pageWidth - 2 * margin) / itemsPerRow;
        }

        if (itemCount === itemsPerPage) {
          if (i !== students.length - 1) {
            pdf.addPage();
            x = margin;
            y = margin;
            itemCount = 0;
          }
        }
      }

      pdf.save('qr-codes-all-students.pdf');
    } catch (error: any) {
      console.error("Error exporting QR codes to PDF:", error);
      setPageError("Gagal mengekspor QR Code ke PDF.");
    } finally {
      setIsLoading(false);
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
            onClick={exportAllQRCodesToPDF}
            className="btn-outline flex items-center ml-2"
            disabled={isLoading || students.length === 0}
            title="Export Semua QR Code ke PDF"
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
      </div>

      {pageError && ( 
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageError}</span>
        </div>
      )}

      {/* Ini Wajib Kamu Ingat! (Penggunaan Komponen StudentTable) */}
      <StudentTable 
        students={sortedStudents} 
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
