import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useForm } from 'react-hook-form';

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
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage News</h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
        >
          Add News
        </button>
      </div>

      {loading ? (
        <p>Loading news...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <div key={news.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {news.imageUrl && (
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <p className="text-gray-500 text-sm mb-2">{new Date(news.date).toLocaleDateString()}</p>
                <h2 className="text-xl font-semibold mb-2">{news.title}</h2>
                <p className="text-gray-600 mb-4">{news.content}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => openEditModal(news)}
                    className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNews(news.id)}
                    className="text-red-600 font-medium hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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