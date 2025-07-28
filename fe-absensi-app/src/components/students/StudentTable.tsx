import React from 'react';
import { Edit, Trash2, QrCode, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; 

// Ini Wajib Kamu Ingat! (Interface untuk SortConfig)
// Harus konsisten dengan yang didefinisikan di StudentsPage.tsx
interface SortConfig {
  key: keyof Student | null;
  direction: 'ascending' | 'descending' | null;
}

// Ini Wajib Kamu Ingat! (Props untuk StudentTable - Tambah sortConfig dan onSort)
interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  onEdit: (student: Student) => void;
  onDeleteConfirmation: (id: string) => void;
  onShowQR: (id: string) => void;
  searchTerm: string; 
  sortConfig: SortConfig; // Terima sortConfig dari parent
  onSort: (key: keyof Student) => void; // Terima fungsi onSort dari parent
  columnFilters: Record<string, string>;
  onColumnFilterChange: (key: keyof Student, value: string) => void;
  page: number;
  rowsPerPage: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

// Interface Student (diulang di sini atau bisa di file types global)
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

const StudentTable: React.FC<StudentTableProps> = ({ 
  students, isLoading, error, onEdit, onDeleteConfirmation, onShowQR, searchTerm, sortConfig, onSort,
  columnFilters, onColumnFilterChange, page, rowsPerPage, totalRows, onPageChange, onRowsPerPageChange
}) => {
  const { hasPermission } = useAuth(); // Dapatkan hasPermission

  // Ini Wajib Kamu Ingat! (Fungsi untuk Menampilkan Indikator Sorting)
  // Menampilkan ikon panah berdasarkan sortConfig saat ini.
  const getSortIcon = (key: keyof Student) => {
    if (sortConfig.key !== key) {
      return null; // Tidak ada ikon jika tidak diurutkan berdasarkan kolom ini
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    if (sortConfig.direction === 'descending') {
      return <ArrowDown className="h-4 w-4 ml-1" />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden" role="region" aria-label="Tabel data siswa">
      <div className="overflow-x-auto overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
        <table className="min-w-full divide-y divide-gray-200" aria-label="Tabel siswa">
          <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th scope="col" id="nis-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort('nis')} tabIndex={0} aria-label="Urutkan berdasarkan NIS" role="columnheader">
                <div className="flex items-center">NIS {getSortIcon('nis')}</div>
              </th>
              <th scope="col" id="name-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort('name')} tabIndex={0} aria-label="Urutkan berdasarkan Nama" role="columnheader">
                <div className="flex items-center">Nama {getSortIcon('name')}</div>
              </th>
              <th scope="col" id="class-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort('class')} tabIndex={0} aria-label="Urutkan berdasarkan Kelas" role="columnheader">
                <div className="flex items-center">Kelas {getSortIcon('class')}</div>
              </th>
              <th scope="col" id="gender-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort('gender')} tabIndex={0} aria-label="Urutkan berdasarkan Jenis Kelamin" role="columnheader">
                <div className="flex items-center">Jenis Kelamin {getSortIcon('gender')}</div>
              </th>
              <th scope="col" id="birthdate-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort('birth_date')} tabIndex={0} aria-label="Urutkan berdasarkan Tanggal Lahir" role="columnheader">
                <div className="flex items-center">Tanggal Lahir {getSortIcon('birth_date')}</div>
              </th>
              <th scope="col" id="parent-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort('parent_name')} tabIndex={0} aria-label="Urutkan berdasarkan Nama Orang Tua" role="columnheader">
                <div className="flex items-center">Nama Orang Tua {getSortIcon('parent_name')}</div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" id="aksi-header">Aksi</th>
            </tr>
            {/* Search input per kolom */}
            <tr>
              {/* NIS */}
              <td className="px-6 py-2">
                <input type="text" className="w-full border rounded px-2 py-1 text-xs" placeholder="Cari NIS" value={columnFilters.nis || ''} onChange={e => onColumnFilterChange('nis', e.target.value)} />
              </td>

              {/* Nama */}
              <td className="px-6 py-2">
                <input type="text" className="w-full border rounded px-2 py-1 text-xs" placeholder="Cari Nama" value={columnFilters.name || ''} onChange={e => onColumnFilterChange('name', e.target.value)} />
              </td>

              {/* Kelas */}
              <td className="px-2 py-1 sm:px-6 sm:py-2" headers="class-header">
                <label htmlFor="filter-class" className="sr-only">Filter Kelas</label>
                <select id="filter-class" className="w-full border rounded px-2 py-1 text-xs focus:ring-primary-500 focus:border-primary-500" value={columnFilters.class || ''} onChange={e => onColumnFilterChange('class', e.target.value)} aria-label="Filter Kelas">
                  <option value="">Semua Kelas</option>
                  {[...new Set(students.map(s => s.class))].sort().map(kls => (
                    <option key={kls} value={kls}>{kls}</option>
                  ))}
                </select>
              </td>
              {/* Gender */}
              <td className="px-2 py-1 sm:px-6 sm:py-2" headers="gender-header">
                <label htmlFor="filter-gender" className="sr-only">Filter Gender</label>
                <select id="filter-gender" className="w-full border rounded px-2 py-1 text-xs focus:ring-primary-500 focus:border-primary-500" value={columnFilters.gender || ''} onChange={e => onColumnFilterChange('gender', e.target.value)} aria-label="Filter Gender">
                  <option value="">Semua Gender</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </td>
              {/* Tanggal Lahir */}
              <td className="px-6 py-2">
                <input type="text" className="w-full border rounded px-2 py-1 text-xs" placeholder="Cari Tgl Lahir" value={columnFilters.birth_date || ''} onChange={e => onColumnFilterChange('birth_date', e.target.value)} />
              </td>
              {/* Orang Tua */}
              <td className="px-6 py-2">
                <input type="text" className="w-full border rounded px-2 py-1 text-xs" placeholder="Cari Orang Tua" value={columnFilters.parent_name || ''} onChange={e => onColumnFilterChange('parent_name', e.target.value)} />
              </td>
              
              <td headers="aksi-header"></td>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                    <span className="font-semibold">{searchTerm ? `Tidak ada siswa yang cocok dengan "${searchTerm}".` : 'Tidak ada data siswa.'}</span>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-primary-50 transition-all duration-150 border-b border-gray-100">
                  <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900" headers="nis-header">{student.nis}</td>
                  <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900" headers="name-header">{student.name}</td>
                  <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500" headers="class-header">{student.class}</td>
                  <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500" headers="gender-header">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500" headers="birthdate-header">{new Date(student.birth_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500" headers="parent-header">{student.parent_name}</td>
                  <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium" headers="aksi-header">
                    <div className="flex justify-end space-x-2">
                      {hasPermission('manage_students') && (
                        <>
                          <button onClick={() => onEdit(student)} className="text-primary-600 hover:text-primary-900 transition-transform duration-100 hover:scale-110" title="Edit Siswa" aria-label={`Edit data siswa ${student.name}`} tabIndex={0}><Edit className="h-5 w-5" /></button>
                          <button onClick={() => onDeleteConfirmation(student.id)} className="text-red-600 hover:text-red-900 transition-transform duration-100 hover:scale-110" title="Hapus Siswa" aria-label={`Hapus data siswa ${student.name}`} tabIndex={0}><Trash2 className="h-5 w-5" /></button>
                        </>
                      )}
                      {hasPermission('generate_qr') && (
                        <button onClick={() => onShowQR(student.id)} className="text-gray-600 hover:text-gray-900 transition-transform duration-100 hover:scale-110" title="Lihat QR" aria-label={`Lihat QR siswa ${student.name}`} tabIndex={0}><QrCode className="h-5 w-5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 sm:px-4 py-2 sm:py-3 border-t bg-gray-50 text-xs" role="navigation" aria-label="Navigasi halaman tabel siswa">
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="page-input" className="sr-only">Pindah ke halaman</label>
          <span className="hidden sm:inline">Go to page:</span>
          <input id="page-input" type="number" min={1} max={Math.ceil(totalRows / rowsPerPage)} value={page} onChange={e => onPageChange(Number(e.target.value))} className="border rounded px-1 w-12 focus:ring-primary-500 focus:border-primary-500" aria-label="Pindah ke halaman" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="rows-select" className="sr-only">Jumlah baris per halaman</label>
          <span className="hidden sm:inline">Show rows:</span>
          <select id="rows-select" value={rowsPerPage} onChange={e => onRowsPerPageChange(Number(e.target.value))} className="border rounded px-1 focus:ring-primary-500 focus:border-primary-500" aria-label="Jumlah baris per halaman">
            {[10, 25, 50, 100].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <span>{(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, totalRows)} of {totalRows}</span>
          <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className={`rounded-full px-2 py-1 border ${page === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white hover:bg-primary-50 text-primary-600'} transition-all`} aria-label="Halaman sebelumnya" tabIndex={0}>&#9664;</button>
          {/* Numbered page buttons */}
          {Array.from({ length: Math.ceil(totalRows / rowsPerPage) }, (_, i) => i + 1).map(p => (
            (p === page || p === 1 || p === Math.ceil(totalRows / rowsPerPage) || Math.abs(p - page) <= 1) && (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`rounded-full px-2 py-1 mx-0.5 border ${p === page ? 'bg-primary-600 text-white font-bold' : 'bg-white hover:bg-primary-50 text-primary-600'} transition-all`}
                style={{ minWidth: 28 }}
                aria-label={`Halaman ${p}${p === page ? ' (aktif)' : ''}`}
                tabIndex={0}
              >{p}</button>
            )
          ))}
          {Math.ceil(totalRows / rowsPerPage) > 5 && page < Math.ceil(totalRows / rowsPerPage) - 2 && <span className="mx-1">...</span>}
          <button disabled={page === Math.ceil(totalRows / rowsPerPage)} onClick={() => onPageChange(page + 1)} className={`rounded-full px-2 py-1 border ${page === Math.ceil(totalRows / rowsPerPage) ? 'bg-gray-200 text-gray-400' : 'bg-white hover:bg-primary-50 text-primary-600'} transition-all`} aria-label="Halaman berikutnya" tabIndex={0}>&#9654;</button>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
