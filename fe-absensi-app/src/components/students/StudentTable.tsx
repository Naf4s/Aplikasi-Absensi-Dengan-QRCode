import React from 'react';
import { Edit, Trash2, QrCode } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth untuk permission

// Ini Wajib Kamu Ingat! (Props untuk StudentTable)
// Komponen ini menerima daftar siswa, status loading, pesan error,
// dan fungsi-fungsi handler untuk edit/hapus/QR.
interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  onEdit: (student: Student) => void;
  onDeleteConfirmation: (id: string) => void;
  onShowQR: (id: string) => void;
  searchTerm: string; // Untuk menampilkan pesan "Tidak ada data siswa untuk filter ini"
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
  students, isLoading, error, onEdit, onDeleteConfirmation, onShowQR, searchTerm 
}) => {
  const { hasPermission } = useAuth(); // Dapatkan hasPermission

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
