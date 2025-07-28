import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, AlertCircle, X } from 'lucide-react'; // Import ikon

interface ProgramItem {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

interface ProgramFormData {
  title: string;
  content: string;
  imageUrl?: string;
}

const ProgramManagementPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [programsList, setProgramsList] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [expandedProgramIds, setExpandedProgramIds] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading form
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [programToDeleteId, setProgramToDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProgramFormData>();

  // --- Authorization ---
  // Centralize permission check for cleaner code.
  // This variable can be used throughout the component to show/hide management UI.
  const canManage = hasPermission('manage_programs') || user?.role === 'admin';

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/programs');
      setProgramsList(response.data);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to fetch programs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const openCreateModal = () => {
    setEditingProgram(null);
    reset({ title: '', content: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (program: ProgramItem) => {
    setEditingProgram(program);
    reset({
      title: program.title,
      content: program.content,
      imageUrl: program.imageUrl,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProgram(null);
    setError(null);
    reset();
  };

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingProgram) {
        await api.put(`/programs/${editingProgram.id}`, data);
      } else {
        await api.post('/programs', data);
      }
      closeModal(); // Close modal immediately on success for better UX
      await fetchPrograms();
    } catch (err: any) {
      let msg = 'Gagal menyimpan program. Pastikan semua data terisi dengan benar.';
      // Provide more specific error messages from the backend if available
      if (err.response && err.response.data && err.response.data.message) {
        msg = `Gagal: ${err.response.data.message}`;
      }
      setError(msg);
      console.error("Error saving program:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirmation = (id: number) => {
    setProgramToDeleteId(id);
    setConfirmDeleteModal(true);
  };

  const deleteProgram = async () => {
    if (!programToDeleteId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.delete(`/programs/${programToDeleteId}`);
      await fetchPrograms();
      setConfirmDeleteModal(false);
      setProgramToDeleteId(null);
    } catch (err: any) {
      let msg = 'Gagal menghapus program.';
      // Provide more specific error messages from the backend if available
      if (err.response && err.response.data && err.response.data.message) {
        msg = `Gagal: ${err.response.data.message}`;
      }
      setError(msg);
      console.error("Error deleting news:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleExpanded = (id: number) => {
    setExpandedProgramIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  // --- Page Level Authorization ---
  // This top-level check prevents users without permission from rendering the component at all.
  // It's a crucial security and UX measure.
  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk mengelola halaman program.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Berita</h1>

        {canManage && (
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Tambah Program
          </button>
        )}
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  {canManage && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {programsList.map((program) => {
                  const isExpanded = expandedProgramIds.has(program.id);
                  const words = program.content.split(' ');
                  const preview = words.slice(0, 8).join(' ');
                  return (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {program.imageUrl ? (
                          <img
                            src={program.imageUrl}
                            alt={program.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {program.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isExpanded ? program.content : preview + (words.length > 8 ? '...' : '')}
                        {words.length > 8 && (
                          <button
                            onClick={() => toggleExpanded(program.id)}
                            className="text-primary-600 ml-2 underline"
                            type="button"
                          >
                            {isExpanded ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(program)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirmation(program.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">{editingProgram ? 'Edit Program' : 'Tambah Program Baru'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Judul</label>
                  <input
                    {...register('title', { required: 'Judul wajib diisi' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Konten</label>
                  <textarea
                    {...register('content', { required: 'Konten wajib diisi' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={4}
                  />
                  {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL Gambar (Opsional)</label>
                  <input
                    {...register('imageUrl')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2">
                <button type="button" onClick={closeModal} className="btn-outline">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Memproses...' : (editingProgram ? 'Simpan Perubahan' : 'Tambah Program')}
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
              <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus Berita</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700">Apakah Anda yakin ingin menghapus berita ini? Aksi ini tidak bisa dibatalkan.</p>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => { setConfirmDeleteModal(false); setProgramToDeleteId(null); }}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  onClick={deleteProgram}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagementPage;
