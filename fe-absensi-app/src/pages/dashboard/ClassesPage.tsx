import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, AlertCircle, X, Search } from 'lucide-react'; // Import ikon
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';

// Ini Wajib Kamu Ingat! (Konsistensi Interface Kelas dan User)
// Pastikan interface ini sesuai dengan data yang dikembalikan oleh backend.
interface ClassItem {
  id: string;
  name: string;
  homeroom_teacher_id?: string | null;
  homeroom_teacher_name?: string | null; // Nama guru dari join di backend
}

interface Teacher { // Interface untuk daftar guru yang bisa dijadikan walikelas
  id: string;
  name: string;
  email: string;
}

const ClassesPage: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]); // Untuk dropdown walikelas
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null); // Untuk edit kelas
  const [formData, setFormData] = useState({ // State untuk form tambah/edit
    name: '',
    homeroom_teacher_id: '' as string | null, // Bisa string ID guru atau null
  });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [classToDeleteId, setClassToDeleteId] = useState<string | null>(null);

  // Ini Wajib Kamu Ingat! (Fungsi Mengambil Data Kelas & Guru dari Backend)
  // Digunakan `useCallback` agar fungsi tidak dibuat ulang setiap render, penting untuk `useEffect`.
  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Panggil API GET untuk mengambil semua kelas
      const response = await api.get('/classes'); // Endpoint: /api/classes
      setClasses(response.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      let msg = 'Gagal memuat data kelas. Silakan coba lagi.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fungsi untuk mengambil daftar guru yang bisa jadi walikelas
  const fetchTeachers = useCallback(async () => {
    try {
      // Kita asumsikan ada endpoint /api/users dengan filter role=teacher
      // Jika tidak ada, kita bisa fetch semua user dan filter di frontend
      const response = await api.get('/users', { params: { role: 'teacher' } }); 
      setTeachers(response.data.filter((u: any) => u.role === 'teacher') || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      // Handle error, tapi jangan blokir page loading
    }
  }, []);


  useEffect(() => {
    // Hanya fetch kelas jika punya izin 'manage_classes' (akan kita tambahkan nanti di AuthContext)
    // Untuk sementara, kita asumsikan admin punya izin ini.
    if (hasPermission('manage_classes') || currentUser?.role === 'admin') {
      fetchClasses();
      fetchTeachers(); // Ambil daftar guru saat memuat halaman
    } else {
      setIsLoading(false);
      setError('Anda tidak memiliki izin untuk melihat halaman ini.');
    }
  }, [fetchClasses, fetchTeachers, hasPermission, currentUser?.role]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Jika value adalah string kosong, set jadi null untuk teacher_id
    setFormData(prev => ({
      ...prev,
      [name]: value === '' && name === 'homeroom_teacher_id' ? null : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Aktifkan loading untuk form submit

    try {
      if (selectedClass) {
        // Update kelas
        await api.put(`/classes/${selectedClass.id}`, formData);
        console.log('Kelas berhasil diperbarui:', formData);
      } else {
        // Create kelas
        await api.post('/classes', formData);
        console.log('Kelas berhasil ditambahkan:', formData);
      }
      resetForm();
      await fetchClasses(); // Muat ulang daftar kelas
    } catch (err) {
      console.error('Error saving class:', err);
      let msg = 'Terjadi kesalahan saat menyimpan data kelas.';
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
      name: '',
      homeroom_teacher_id: '',
    });
    setSelectedClass(null);
    setShowForm(false);
    setError(null);
  };

  const handleEditClick = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      homeroom_teacher_id: classItem.homeroom_teacher_id || '', // Jika null, ubah ke string kosong untuk select
    });
    setShowForm(true);
  };

  const handleDeleteConfirmation = (id: string) => {
    setClassToDeleteId(id);
    setConfirmDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!classToDeleteId) return;

    setError(null);
    setIsLoading(true);

    try {
      await api.delete(`/classes/${classToDeleteId}`);
      console.log('Kelas berhasil dihapus:', classToDeleteId);
      setConfirmDeleteModal(false);
      setClassToDeleteId(null);
      await fetchClasses(); // Muat ulang daftar kelas
    } catch (err) {
      console.error('Error deleting class:', err);
      let msg = 'Terjadi kesalahan saat menghapus kelas.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Ini Wajib Kamu Ingat! (Otorisasi Frontend - Melindungi Halaman)
  // Hanya user dengan role 'admin' yang bisa mengakses halaman ini.
  if (!hasPermission('manage_classes') && currentUser?.role !== 'admin') { // Periksa juga role langsung
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk melihat halaman manajemen kelas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kelas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Tambah Kelas
        </button>
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
                    Nama Kelas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Walikelas
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data kelas.
                    </td>
                  </tr>
                ) : (
                  classes.map((classItem) => (
                    <tr key={classItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {classItem.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {classItem.homeroom_teacher_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(classItem)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmation(classItem.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
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

      {/* Add/Edit Class Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Kelas</label>
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
                <label className="block text-sm font-medium text-gray-700">Walikelas</label>
                <select
                  name="homeroom_teacher_id"
                  value={formData.homeroom_teacher_id || ''} // Handle null untuk seleksi
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">-- Pilih Walikelas --</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.email})</option>
                  ))}
                </select>
                {/* Opsi untuk menghapus walikelas jika ada yang terpilih */}
                {formData.homeroom_teacher_id && (
                    <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, homeroom_teacher_id: null }))}
                        className="text-sm text-red-600 hover:text-red-800 mt-1"
                    >
                        Hapus Walikelas
                    </button>
                )}
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
                  {isLoading ? 'Memproses...' : (selectedClass ? 'Simpan Perubahan' : 'Tambah Kelas')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus Kelas</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700">Apakah Anda yakin ingin menghapus kelas ini? Aksi ini akan menghapus semua siswa di kelas ini dan absensi terkait.</p> {/* Tambah warning */}
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => { setConfirmDeleteModal(false); setClassToDeleteId(null); }}
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
    </div>
  );
};

export default ClassesPage;
