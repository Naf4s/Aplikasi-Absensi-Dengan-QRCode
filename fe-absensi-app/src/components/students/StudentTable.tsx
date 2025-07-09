import React from 'react';
import { Edit, Trash2, QrCode, ArrowUp, ArrowDown } from 'lucide-react'; // Import ArrowUp, ArrowDown
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
  students, isLoading, error, onEdit, onDeleteConfirmation, onShowQR, searchTerm, sortConfig, onSort
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Header Kolom yang Bisa Disorting */}
              <th scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('nis')} // Panggil onSort saat diklik
              >
                <div className="flex items-center">
                  NIS {getSortIcon('nis')}
                </div>
              </th>
              <th scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center">
                  Nama {getSortIcon('name')}
                </div>
              </th>
              <th scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('class')}
              >
                <div className="flex items-center">
                  Kelas {getSortIcon('class')}
                </div>
              </th>
              <th scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('gender')}
              >
                <div className="flex items-center">
                  Jenis Kelamin {getSortIcon('gender')}
                </div>
              </th>
              <th scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('birth_date')}
              >
                <div className="flex items-center">
                  Tanggal Lahir {getSortIcon('birth_date')}
                </div>
              </th>
              <th scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('parent_name')}
              >
                <div className="flex items-center">
                  Nama Orang Tua {getSortIcon('parent_name')}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? `Tidak ada siswa yang cocok dengan "${searchTerm}".` : 'Tidak ada data siswa.'}
                </td>
              </tr>
            ) : (
              students.map((student) => (
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
                      {hasPermission('manage_students') && (
                        <>
                          <button
                            onClick={() => onEdit(student)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => onDeleteConfirmation(student.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {hasPermission('generate_qr') && (
                        <button
                          onClick={() => onShowQR(student.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <QrCode className="h-5 w-5" />
                        </button>
                      )}
                    </div>
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

export default StudentTable;
