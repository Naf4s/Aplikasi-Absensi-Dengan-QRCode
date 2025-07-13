import React, { useEffect, useState } from 'react';
import api from '../lib/api';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

const ExpandableText: React.FC<{ content: string; onReadMore: () => void }> = ({ content, onReadMore }) => {
  const words = content.split(' ');
  const preview = words.slice(0, 8).join(' ');

  return (
    <p className="text-gray-700 mb-4 max-h-20 overflow-hidden text-ellipsis">
      {preview + (words.length > 8 ? '...' : '')}
      {words.length > 8 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore();
          }}
          className="text-blue-600 ml-2 underline"
          type="button"
        >
          Read More
        </button>
      )}
    </p>
  );
};

const NewsPage: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

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

  const closeModal = () => {
    setSelectedNews(null);
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-20">
      <h1 className="text-3xl font-bold text-center mb-8">Berita Sekolah</h1>

      {loading ? (
        <p className="text-center text-gray-600 text-lg">Loading news...</p>
      ) : error ? (
        newsList.length === 0 ? null : <p className="text-center text-red-600 font-semibold">{error}</p>
      ) : newsList.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">Tidak ada berita tersedia.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => setSelectedNews(news)}
              >
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
                  <ExpandableText content={news.content} onReadMore={() => setSelectedNews(news)} />
                </div>
              </div>
            ))}
          </div>

          {selectedNews && (
            <div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeModal();
                }
              }}
            >
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                  aria-label="Close"
                >
                </button>
                {selectedNews.imageUrl && (
                  <img
                    src={selectedNews.imageUrl}
                    alt={selectedNews.title}
                    className="w-full max-h-96 object-cover rounded mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold mb-4">{selectedNews.title}</h2>
                <p className="text-gray-500 text-sm mb-2">{new Date(selectedNews.date).toLocaleDateString()}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNews.content}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;
