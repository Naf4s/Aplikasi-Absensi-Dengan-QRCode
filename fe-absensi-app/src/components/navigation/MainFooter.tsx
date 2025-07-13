import React from 'react';
import { Link } from 'react-router-dom';
import { School, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const MainFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center mb-4">
              <School className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold">SD N 1 Bumirejo</span>
            </div>
            <p className="text-gray-400 mb-4">
              Sistem Profil & Absensi Berbasis QR untuk mendukung pendidikan yang berkualitas dan transparan.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition">Tentang Kami</Link>
              </li>
              <li>
                <Link to="/programs" className="text-gray-400 hover:text-white transition">Program Sekolah</Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-400 hover:text-white transition">Berita Terkini</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition">Hubungi Kami</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition">Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informasi Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-400 mt-1 flex-shrink-0" />
                <p className="ml-2 text-gray-400">Jl. Dieng Km 4, Bumirejo, Kec. Mojotengah, Kab. Wonosobo Prov. Jawa Tengah, 56351</p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <p className="ml-2 text-gray-400">-</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <p className="ml-2 text-gray-400">sdn1.bumen@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} SD N 1 Bumirejo. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;