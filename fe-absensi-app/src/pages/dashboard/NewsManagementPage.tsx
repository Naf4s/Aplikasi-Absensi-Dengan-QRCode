import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [expandedNewsIds, setExpandedNewsIds] = useState<Set<number>>(new Set());

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsFormData>();


  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/news');
      setNewsList(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch news');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openCreateModal = () => {
    setEditingNews(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (news: NewsItem) => {
    setEditingNews(news);
    reset({
      title: news.title,
      content: news.content,
      date: news.date,
      imageUrl: news.imageUrl,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
  };

  const onSubmit = async (data: NewsFormData) => {
    try {
      if (editingNews) {
        await api.put(`/news/${editingNews.id}`, data);
      } else {
        await api.post('/news', data);
      }
      closeModal();
      fetchNews();
    } catch (err) {
      alert('Failed to save news');
    }
  };

  const deleteNews = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch (err) {
      alert('Failed to delete news');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage News</h1>

        {user?.role === 'admin' && (
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center"
          >
            Add News
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading news...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
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
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <button
                            onClick={() => openEditModal(news)}
                            className="text-primary-600 hover:text-primary-900 transition-colors mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNews(news.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{editingNews ? 'Edit News' : 'Add News'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Content</label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                />
                {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Image URL</label>
                <input
                  {...register('imageUrl')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
                >
                  {editingNews ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagementPage;
