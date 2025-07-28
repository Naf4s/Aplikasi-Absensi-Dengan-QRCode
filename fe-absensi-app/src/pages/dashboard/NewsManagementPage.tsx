import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, AlertCircle, X } from 'lucide-react'; // Import ikon

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

interface NewsFormData {
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

const NewsManagementPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [expandedNewsIds, setExpandedNewsIds] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading form
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [newsToDeleteId, setNewsToDeleteId] = useState<number | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsFormData>();

  // --- Authorization ---
  // Centralize permission check for cleaner code.
  // This variable can be used throughout the component to show/hide management UI.
  const canManage = hasPermission('manage_news') || user?.role === 'admin';

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/news');
      setNewsList(response.data);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to fetch news');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openCreateModal = () => {
    setEditingNews(null);
    reset({ title: '', content: '', date: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (news: NewsItem) => {
    setEditingNews(news);
    reset({
      title: news.title,
      content: news.content,
      // The date from the backend might be a full ISO string (e.g., "2023-10-27T10:00:00.000Z").
      // The HTML <input type="date"> requires the format "YYYY-MM-DD".
      date: news.date.substring(0, 10),
      imageUrl: news.imageUrl,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
    setError(null);
    reset();
  };

  const onSubmit = async (data: NewsFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingNews) {
        await api.put(`/news/${editingNews.id}`, data);
      } else {
        await api.post('/news', data);
      }
      closeModal(); // Close modal immediately on success for better UX
      await fetchNews();
    } catch (err: any) {
      let msg = 'Gagal menyimpan berita. Pastikan semua data terisi dengan benar.';
      // Provide more specific error messages from the backend if available
      if (err.response && err.response.data && err.response.data.message) {
        msg = `Gagal: ${err.response.data.message}`;
      }
      setError(msg);
      console.error("Error saving news:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirmation = (id: number) => {
    setNewsToDeleteId(id);
    setConfirmDeleteModal(true);
  };

  const deleteNews = async () => {
    if (!newsToDeleteId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.delete(`/news/${newsToDeleteId}`);
      await fetchNews();
      setConfirmDeleteModal(false);
      setNewsToDeleteId(null);
    } catch (err: any) {
      let msg = 'Gagal menghapus berita.';
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
    setExpandedNewsIds(prev => {
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
        <p>Anda tidak memiliki izin untuk mengelola halaman berita.</p>
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
            Tambah Berita
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  {canManage && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newsList.map((news) => {
                  const isExpanded = expandedNewsIds.has(news.id);
                  const words = news.content.split(' ');
                  const preview = words.slice(0, 8).join(' ');
                  return (
                    <tr key={news.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {news.imageUrl ? (
                          <img
                            src={news.imageUrl}
                            alt={news.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(news.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {news.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isExpanded ? news.content : preview + (words.length > 8 ? '...' : '')}
                        {words.length > 8 && (
                          <button
                            onClick={() => toggleExpanded(news.id)}
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
                              onClick={() => openEditModal(news)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirmation(news.id)}
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
              <h2 className="text-xl font-bold text-gray-900">{editingNews ? 'Edit Berita' : 'Tambah Berita Baru'}</h2>
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
                  <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                  <input
                    type="date"
                    {...register('date', { required: 'Tanggal wajib diisi' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
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
                  {isSubmitting ? 'Memproses...' : (editingNews ? 'Simpan Perubahan' : 'Tambah Berita')}
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
                  onClick={() => { setConfirmDeleteModal(false); setNewsToDeleteId(null); }}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  onClick={deleteNews}
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

export default NewsManagementPage;
