import React from 'react';
import { Award, BookOpen, Users, Target, MapPin } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-primary-800 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Tentang SD N 1 Bumirejo</h1>
            <p className="text-lg md:text-xl text-primary-100">
              Kami berkomitmen untuk memberikan pendidikan berkualitas yang membentuk karakter dan mengembangkan potensi setiap siswa.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Vision */}
            <div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary-700" />
                </div>
                <h2 className="ml-3 text-2xl font-bold text-gray-900">Visi</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Menjadi sekolah dasar unggulan yang menghasilkan lulusan berakhlak mulia, berprestasi akademik, dan memiliki keterampilan hidup untuk menghadapi tantangan masa depan."
              </p>
            </div>

            {/* Mission */}
            <div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-secondary-700" />
                </div>
                <h2 className="ml-3 text-2xl font-bold text-gray-900">Misi</h2>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="h-5 w-5 text-secondary-600 mr-2">•</span>
                  <span>Menyelenggarakan pendidikan dengan pendekatan yang berpusat pada siswa</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-secondary-600 mr-2">•</span>
                  <span>Mengembangkan karakter dan nilai-nilai moral dalam setiap aspek pembelajaran</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-secondary-600 mr-2">•</span>
                  <span>Menerapkan teknologi dalam proses belajar mengajar</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-secondary-600 mr-2">•</span>
                  <span>Membangun kemitraan dengan orang tua dan komunitas</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-secondary-600 mr-2">•</span>
                  <span>Menciptakan lingkungan belajar yang aman, nyaman, dan kondusif</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-gray-50">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sejarah Sekolah</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Perjalanan SD N 1 Bumirejo dalam memberikan pendidikan berkualitas bagi generasi bangsa.
            </p>
          </div>

          <div className="relative border-l-2 border-primary-200 pl-8 ml-4 space-y-12">
            <div>
              <div className="absolute -left-4 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Pendirian (1975)</h3>
                <p className="mt-2 text-gray-600">
                  SD N 1 Bumirejo didirikan sebagai upaya pemerintah untuk meningkatkan akses pendidikan di daerah Bumirejo dan sekitarnya.
                </p>
              </div>
            </div>

            <div>
              <div className="absolute -left-4 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Pengembangan (1990-2000)</h3>
                <p className="mt-2 text-gray-600">
                  Masa pengembangan infrastruktur dan peningkatan kualitas pendidikan dengan penambahan fasilitas perpustakaan dan laboratorium.
                </p>
              </div>
            </div>

            <div>
              <div className="absolute -left-4 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Era Modernisasi (2000-2015)</h3>
                <p className="mt-2 text-gray-600">
                  Implementasi teknologi dalam proses belajar mengajar dan peningkatan kompetensi guru melalui berbagai pelatihan.
                </p>
              </div>
            </div>

            <div>
              <div className="absolute -left-4 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <span className="text-sm font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Saat Ini (2015-Sekarang)</h3>
                <p className="mt-2 text-gray-600">
                  Fokus pada pendidikan karakter, implementasi kurikulum merdeka, dan digitalisasi sistem administrasi sekolah termasuk absensi berbasis QR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School values */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nilai-Nilai Kami</h2>
            <p className="text-primary-100 max-w-3xl mx-auto">
              Prinsip-prinsip yang menjadi landasan dalam setiap kegiatan dan program sekolah kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-primary-800/50 rounded-lg p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-primary-700 flex items-center justify-center mx-auto mb-4">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Integritas</h3>
              <p className="text-primary-100">
                Kejujuran dan konsistensi dalam setiap tindakan dan keputusan
              </p>
            </div>

            <div className="bg-primary-800/50 rounded-lg p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-primary-700 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kerjasama</h3>
              <p className="text-primary-100">
                Membangun sinergi antara sekolah, orang tua, dan masyarakat
              </p>
            </div>

            <div className="bg-primary-800/50 rounded-lg p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-primary-700 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kreatifitas</h3>
              <p className="text-primary-100">
                Mendorong pemikiran inovatif dan pengembangan ide-ide baru
              </p>
            </div>

            <div className="bg-primary-800/50 rounded-lg p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-primary-700 flex items-center justify-center mx-auto mb-4">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keunggulan</h3>
              <p className="text-primary-100">
                Berusaha mencapai standar tertinggi dalam setiap aspek pendidikan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Organization Structure */}
      <section className="py-16 bg-white">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Struktur Organisasi</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Tim pengelola yang bertanggung jawab atas kemajuan dan perkembangan SD N 1 Bumirejo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Principal */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-primary-100 text-primary-800 text-4xl font-bold">
                  BS
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Budi Santoso, S.Pd.</h3>
              <p className="text-primary-600 font-medium">Kepala Sekolah</p>
              <p className="mt-2 text-gray-600 text-sm">
                Memimpin dan mengarahkan seluruh kegiatan sekolah sesuai dengan visi dan misi
              </p>
            </div>

            {/* Vice Principal */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-secondary-100 text-secondary-800 text-4xl font-bold">
                  SW
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Sri Wahyuni, M.Pd.</h3>
              <p className="text-secondary-600 font-medium">Wakil Kepala Sekolah</p>
              <p className="mt-2 text-gray-600 text-sm">
                Mendukung kepala sekolah dan mengkoordinasikan kegiatan akademik
              </p>
            </div>

            {/* Admin */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-accent-100 text-accent-800 text-4xl font-bold">
                  AP
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Ahmad Prasetyo</h3>
              <p className="text-accent-600 font-medium">Kepala Tata Usaha</p>
              <p className="mt-2 text-gray-600 text-sm">
                Mengelola administrasi dan sistem informasi sekolah
              </p>
            </div>

            {/* Curriculum */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-primary-100 text-primary-800 text-4xl font-bold">
                  RH
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Rina Hastuti, S.Pd.</h3>
              <p className="text-primary-600 font-medium">Koordinator Kurikulum</p>
              <p className="mt-2 text-gray-600 text-sm">
                Mengembangkan dan mengimplementasikan kurikulum pembelajaran
              </p>
            </div>

            {/* Student Affairs */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-secondary-100 text-secondary-800 text-4xl font-bold">
                  DP
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Doni Prasetya, S.Pd.</h3>
              <p className="text-secondary-600 font-medium">Koordinator Kesiswaan</p>
              <p className="mt-2 text-gray-600 text-sm">
                Mengelola kegiatan kesiswaan dan pembinaan karakter siswa
              </p>
            </div>

            {/* Facilities */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-accent-100 text-accent-800 text-4xl font-bold">
                  FW
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Fajar Wibowo</h3>
              <p className="text-accent-600 font-medium">Koordinator Sarpras</p>
              <p className="mt-2 text-gray-600 text-sm">
                Mengelola sarana dan prasarana sekolah
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Lokasi Kami</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              SD N 1 Bumirejo berlokasi strategis dan mudah diakses dari berbagai arah
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="flex items-start mb-4">
                <MapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Alamat</h3>
                  <p className="text-gray-600">
                    Jl. Pendidikan No. 123, Bumirejo<br />
                    Kecamatan Example, Kabupaten Example<br />
                    Provinsi Example, 12345
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-medium text-primary-800">1</span>
                  </div>
                  <p className="ml-3 text-gray-600">5 menit dari Terminal Bus Kota</p>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-medium text-primary-800">2</span>
                  </div>
                  <p className="ml-3 text-gray-600">10 menit dari Pusat Kota</p>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-medium text-primary-800">3</span>
                  </div>
                  <p className="ml-3 text-gray-600">Dilalui oleh angkutan umum kota</p>
                </div>
              </div>
            </div>

            <div className="h-96 bg-gray-300 rounded-lg overflow-hidden">
              {/* Embed a map here - this is a placeholder */}
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Peta Lokasi SD N 1 Bumirejo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Tertarik Bergabung dengan Kami?</h2>
            <p className="text-primary-100 mb-8">
              Kunjungi kami atau hubungi untuk informasi lebih lanjut tentang pendaftaran dan program sekolah.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/contact" className="btn bg-white text-primary-800 hover:bg-gray-100">
                Hubungi Kami
              </a>
              <a href="/programs" className="btn bg-transparent border border-white text-white hover:bg-white/10">
                Lihat Program Sekolah
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;