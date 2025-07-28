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
    {/* Ganti 'items-center' menjadi 'items-start' di sini */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      {/* Vision */}
      <div>
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary-700" />
          </div>
          <h2 className="ml-3 text-2xl font-bold text-gray-900">Visi</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          "Terwujudnya siswa berprestasi dan berbudi pekerti luhur berdasarkan iman dan taqwa, mandiri serta dapat menguasai imtaq dan iptek"
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
            <span>Meningkatkan keimanan dan ketakwaan kepada Tuhan Yang Maha Esa</span>
          </li>
          <li className="flex items-start">
            <span className="h-5 w-5 text-secondary-600 mr-2">•</span>
            <span>Melaksanakan pembelajaran dan bimbingan secara aktif</span>
          </li>
          <li className="flex items-start">
            <span className="h-5 w-5 text-secondary-600 mr-2">•</span>
            <span>Membina dan mengembangkan minat dan bakat untuk meraih prestasi</span>
          </li>
          <li className="flex items-start">
            <span className="h-5 w-5 text-secondary-600 mr-2">•</span>
            <span>Membina dan mengembangkan budi pekerti luhur serta budaya bangsa menuju bangsa yang santun</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

      {/* History */}
      <section className="py-16 bg-gray-50">
        <div className="container-narrow">
          <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Sejarah Sekolah</h2>
        </div>
        <div className="container-narrow">
            <div className="text-justify mb-12">
            <p className="text-gray-600 max-w-3xl mx-auto">
              SD Negeri 1 Bumirejo terletak di Desa Bumirejo, Kecamatan Mojotengah, Kabupaten Wonosobo, Jawa Tengah. Sekolah ini didirikan pada tanggal 1 Desember 1984 berdasarkan SK Pendirian Nomor 421.2/033/VII/29/84. Sejak berdiri, SD Negeri 1 Bumirejo bernaung di bawah Dinas Pendidikan dan Kebudayaan, serta mengikuti kebijakan dan program Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia.
              <br /><br />
              Di awal berdirinya, SD Negeri 1 Bumirejo hanya memiliki sarana belajar yang terbatas. Seiring waktu, sekolah ini terus berbenah untuk memenuhi kebutuhan belajar-mengajar bagi anak-anak di Desa Bumirejo dan sekitarnya. Hingga sekarang, SD Negeri 1 Bumirejo memiliki 6 ruang kelas, 1 perpustakaan, 1 mushola, fasilitas sanitasi yang memadai, serta aliran listrik dari PLN. 
              <br /><br />
              Saat ini, sekolah ini menyelenggarakan pembelajaran dengan Kurikulum Merdeka, sesuai dengan kebijakan pendidikan terbaru. Berdasarkan data resmi, SD Negeri 1 Bumirejo berstatus terakreditasi B, dengan akreditasi terakhir berlaku hingga 2027.
              <br /><br />
              Hingga sekarang, SD Negeri 1 Bumirejo terus berupaya menjadi tempat belajar yang nyaman dan mendukung perkembangan peserta didik, meskipun masih ada tantangan seperti keterbatasan akses internet. Dengan dukungan orang tua, masyarakat desa, serta pemerintah, sekolah ini diharapkan dapat berkembang lebih baik di masa depan.
            </p>
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
                  HM
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Hallay Megasari, S.Pd.SD</h3>
              <p className="text-primary-600 font-medium">Kepala Sekolah</p>
              <p className="mt-2 text-gray-600 text-sm">
                Memimpin dan mengarahkan seluruh kegiatan sekolah sesuai dengan visi dan misi.
              </p>
            </div>

            {/* Vice Principal */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-secondary-100 text-secondary-800 text-4xl font-bold">
                  UR
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Udin Rahmat, S.Ag.</h3>
              <p className="text-secondary-600 font-medium">Komite Sekolah</p>
              <p className="mt-2 text-gray-600 text-sm">
                Memberikan dukungan, saran, dan pertimbangan dalam perumusan serta pelaksanaan kebijakan sekolah demi peningkatan mutu pendidikan.
              </p>
            </div>

            {/* Admin */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-accent-100 text-accent-800 text-4xl font-bold">
                  W
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Windarti, S.Pust, S.Pd</h3>
              <p className="text-accent-600 font-medium">Pustakawan</p>
              <p className="mt-2 text-gray-600 text-sm">
                Mengelola perpustakaan dan menyediakan bahan bacaan untuk mendukung proses pembelajaran siswa.
              </p>
            </div>

            {/* Curriculum */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-primary-100 text-primary-800 text-4xl font-bold">
                  A
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Asmanah, S.Pd.SD.</h3>
              <p className="text-primary-600 font-medium">Guru Kelas 1</p>
              <p className="mt-2 text-gray-600 text-sm">
                Merencanakan dan melaksanakan pembelajaran sesuai kurikulum untuk membentuk kompetensi siswa.
              </p>
            </div>

            {/* Student Affairs */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-secondary-100 text-secondary-800 text-4xl font-bold">
                  RYL
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Resti Yunita Lestari, S.Pd.</h3>
              <p className="text-secondary-600 font-medium">Guru Kelas 2</p>
              <p className="mt-2 text-gray-600 text-sm">
                Merencanakan dan melaksanakan pembelajaran sesuai kurikulum untuk membentuk kompetensi siswa.
              </p>
            </div>

            {/* Facilities */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-accent-100 text-accent-800 text-4xl font-bold">
                  MA
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Mutawasilatul Afikah, S.Pd</h3>
              <p className="text-accent-600 font-medium">Guru Kelas 3</p>
              <p className="mt-2 text-gray-600 text-sm">
                Merencanakan dan melaksanakan pembelajaran sesuai kurikulum untuk membentuk kompetensi siswa.
              </p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-primary-100 text-primary-800 text-4xl font-bold">
                  M
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Mufid, S.Pd</h3>
              <p className="text-primary-600 font-medium">Guru Kelas 4</p>
              <p className="mt-2 text-gray-600 text-sm">
                Merencanakan dan melaksanakan pembelajaran sesuai kurikulum untuk membentuk kompetensi siswa.
              </p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-secondary-100 text-secondary-800 text-4xl font-bold">
                  TW
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Tri Riwayati, S.Pd</h3>
              <p className="text-secondary-600 font-medium">Guru Kelas 5</p>
              <p className="mt-2 text-gray-600 text-sm">
                Merencanakan dan melaksanakan pembelajaran sesuai kurikulum untuk membentuk kompetensi siswa.
              </p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-accent-100 text-accent-800 text-4xl font-bold">
                  TDS
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Titik Dwi Sujarti, S.Pd</h3>
              <p className="text-accent-600 font-medium">Guru Kelas 6</p>
              <p className="mt-2 text-gray-600 text-sm">
                Merencanakan dan melaksanakan pembelajaran sesuai kurikulum untuk membentuk kompetensi siswa.
              </p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-primary-100 text-primary-800 text-4xl font-bold">
                  WK
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Wiwik Kundari, S.Pd</h3>
              <p className="text-primary-600 font-medium">Guru Penjas</p>
              <p className="mt-2 text-gray-600 text-sm">
                Mengajarkan pendidikan jasmani, olahraga, dan kesehatan.
              </p>
            </div>
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4">
                <div className="w-full h-full rounded-full flex items-center justify-center bg-secondary-100 text-secondary-800 text-4xl font-bold">
                  MS
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Mujibatus Salamah, S.Pd.I</h3>
              <p className="text-secondary-600 font-medium">Guru PAI</p>
              <p className="mt-2 text-gray-600 text-sm">
                Mengajarkan Pendidikan Agama Islam sesuai kurikulum.
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
                    Jl. Dieng Km 4, Bumirejo, Kec. Mojotengah, Kab. Wonosobo Prov. Jawa Tengah, 56351
                  </p>
                </div>
              </div>
            </div>

            <div className="h-96 bg-gray-300 rounded-lg overflow-hidden">
                <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.3758750471956!2d109.9152554!3d-7.317598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e700b395b6fb641%3A0x4ebd8ebbdc48fd60!2sSDN%201%20Bumirejo!5e0!3m2!1sid!2sid!4v1720267500000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
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