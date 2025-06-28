import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, AlertCircle, X } from 'lucide-react'; // Import ikon
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';

// Ini Wajib Kamu Ingat! (Konsistensi Interface User)
// Pastikan interface ini sesuai dengan data user yang dikembalikan oleh backend (tanpa password).
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
}

const UsersPage: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth(); // Ganti nama user menjadi currentUser untuk menghindari konflik
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Untuk edit user
  const [formData, setFormData] = useState({ // State untuk form tambah/edit
    name: '',
    email: '',
    password: '',
    role: 'teacher' as 'admin' | 'teacher', // Default role
  });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);

  // Ini Wajib Kamu Ingat! (Fungsi Mengambil Data User dari Backend)
  // Digunakan `useCallback` agar fungsi tidak dibuat ulang setiap render, penting untuk `useEffect`.
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Panggil API GET untuk mengambil semua user
      const response = await api.get('/users'); // Endpoint: /api/users
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      let msg = 'Gagal memuat data pengguna. Silakan coba lagi.';
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hanya fetch user jika punya izin 'manage_users'
    if (hasPermission('manage_users')) {
      fetchUsers();
    } else {
      setIsLoading(false);
      setError('Anda tidak memiliki izin untuk melihat halaman ini.');
    }
  }, [fetchUsers, hasPermission]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Aktifkan loading untuk form submit

    try {
      if (selectedUser) {
        // Update user
        await api.put(`/users/${selectedUser.id}`, formData);
        console.log('User berhasil diperbarui:', formData);
      } else {
        // Create user
        await api.post('/users', formData);
        console.log('User berhasil ditambahkan:', formData);
      }
      resetForm();
      await fetchUsers(); // Muat ulang daftar user
    } catch (err) {
      console.error('Error saving user:', err);
      let msg = 'Terjadi kesalahan saat menyimpan data pengguna.';
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
      email: '',
      password: '',
      role: 'teacher',
    });
    setSelectedUser(null);
    setShowForm(false);
    setError(null);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Password tidak bisa diedit langsung, harus kosong atau diisi ulang
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDeleteConfirmation = (id: string) => {
    setUserToDeleteId(id);
    setConfirmDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDeleteId) return;

    setError(null);
    setIsLoading(true);

    try {
      await api.delete(`/users/${userToDeleteId}`);
      console.log('User berhasil dihapus:', userToDeleteId);
      setConfirmDeleteModal(false);
      setUserToDeleteId(null);
      await fetchUsers(); // Muat ulang daftar user
    } catch (err) {
      console.error('Error deleting user:', err);
      let msg = 'Terjadi kesalahan saat menghapus pengguna.';
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
  if (!hasPermission('manage_users') && currentUser?.role !== 'admin') { // Periksa juga role langsung
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk melihat halaman manajemen pengguna.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Tambah Pengguna
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
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data pengguna.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          {/* Admin tidak bisa menghapus akunnya sendiri */}
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteConfirmation(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
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
      )}

      {/* Add/Edit User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
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
                <label className="block text-sm font-medium text-gray-700">Nama</label>
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
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password {selectedUser ? '(Kosongkan jika tidak diubah)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!selectedUser} // Wajib jika menambah, opsional jika edit
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
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
                  {isLoading ? 'Memproses...' : (selectedUser ? 'Simpan Perubahan' : 'Tambah Pengguna')}
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
              <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus Pengguna</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700">Apakah Anda yakin ingin menghapus pengguna ini? Aksi ini tidak bisa dibatalkan.</p>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => { setConfirmDeleteModal(false); setUserToDeleteId(null); }}
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

export default UsersPage;
