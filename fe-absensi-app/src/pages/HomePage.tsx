import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, BookOpen, QrCode, Users, Calendar, Clock } from 'lucide-react';
import api from '../lib/api';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

const ExpandableText: React.FC<{ content: string }> = ({ content }) => {
  const words = content.split(' ');
  const preview = words.slice(0, 15).join(' ');
  return <p className="text-gray-600 mb-4">{preview + (words.length > 15 ? '...' : '')}</p>;
};

const HomePage: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/80 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/8471835/pexels-photo-8471835.jpeg)',
          }}
        ></div>

        <div className="relative h-full flex items-center z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight slide-up">
                Pendidikan Berkualitas di SD N 1 Bumirejo
              </h1>
              <p className="mt-4 text-xl text-white/90 slide-up" style={{ animationDelay: '0.1s' }}>
                Membangun karakter, mengembangkan potensi, dan menciptakan generasi unggul demi masa depan bangsa.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 slide-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/about" className="btn-primary">
                  Tentang Kami
                </Link>
                <Link to="/contact" className="btn-outline bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Hubungi Kami
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 z-20 text-center">
          <a
            href="#features"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
          >
            <ChevronRight className="h-6 w-6 rotate-90" />
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Program Unggulan Kami</h2>
            <p className="mt-4 text-lg text-gray-600">
              Kami menyediakan berbagai program pendidikan yang inovatif untuk mengembangkan potensi siswa secara maksimal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kurikulum Merdeka</h3>
              <p className="text-gray-600">
                Implementasi kurikulum merdeka yang berfokus pada pengembangan karakter, literasi, dan numerasi siswa.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                <QrCode className="h-7 w-7 text-secondary-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Absensi Berbasis QR</h3>
              <p className="text-gray-600">
                Sistem absensi modern menggunakan teknologi QR Code untuk memantau kehadiran siswa secara efisien.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-accent-100 flex items-center justify-center mb-4">
                <Award className="h-7 w-7 text-accent-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ekstrakurikuler Beragam</h3>
              <p className="text-gray-600">
                Berbagai kegiatan ekstrakurikuler untuk mengembangkan minat dan bakat siswa di bidang seni, olahraga, dan akademik.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/programs" className="btn-primary">
              Lihat Semua Program
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">250+</div>
              <div className="flex justify-center">
                <Users className="h-5 w-5 mr-1 text-primary-300" />
                <span className="text-primary-300">Siswa</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="flex justify-center">
                <Users className="h-5 w-5 mr-1 text-primary-300" />
                <span className="text-primary-300">Guru</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold mb-2">12+</div>
              <div className="flex justify-center">
                <Calendar className="h-5 w-5 mr-1 text-primary-300" />
                <span className="text-primary-300">Program</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="flex justify-center">
                <Clock className="h-5 w-5 mr-1 text-primary-300" />
                <span className="text-primary-300">Tahun Pengalaman</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Preview Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Berita Terbaru</h2>
            <Link to="/news" className="mt-4 md:mt-0 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
              Lihat Semua Berita
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <p className="text-center text-gray-600 text-lg col-span-full">Loading news...</p>
            ) : error ? (
              newsList.length === 0 ? null : <p className="text-center text-red-600 font-semibold col-span-full">{error}</p>
            ) : newsList.length === 0 ? (
              <p className="text-center text-gray-600 text-lg col-span-full">Tidak ada berita tersedia.</p>
            ) : (
              newsList.slice(0, 3).map((news) => (
                <div key={news.id} className="card overflow-hidden">
                  {news.imageUrl && (
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-5">
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full mb-3">
                      Berita
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{news.title}</h3>
                    <ExpandableText content={news.content} />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{new Date(news.date).toLocaleDateString()}</span>
                      <Link to={`/news/${news.id}`} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        Baca Selengkapnya
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-800 to-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Bergabunglah dengan Kami</h2>
              <p className="text-white/90 text-lg">
                Berikan pendidikan terbaik untuk putra-putri Anda di SD N 1 Bumirejo. Kunjungi kami atau hubungi untuk informasi pendaftaran.
              </p>
            </div>
            <div className="md:w-1/3 flex flex-col gap-4">
              <Link to="/contact" className="btn bg-white text-primary-800 hover:bg-gray-100 text-center">
                Hubungi Kami
              </Link>
              <Link to="/about" className="btn bg-transparent border border-white text-white hover:bg-white/10 text-center">
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
