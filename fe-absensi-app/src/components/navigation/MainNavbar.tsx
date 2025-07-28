import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, School, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

interface MainNavbarProps {
  isTransparent: boolean;
}

const MainNavbar: React.FC<MainNavbarProps> = ({ isTransparent }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang', path: '/about' },
    { name: 'Program', path: '/programs' },
    { name: 'Berita', path: '/news' },
    { name: 'Kontak', path: '/contact' },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isTransparent 
          ? 'bg-transparent text-white' 
          : 'bg-white text-gray-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Logo" className={`h-8 w-8 `} />
              <span className="ml-2 text-lg font-bold">SD N 1 Bumirejo</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition
                  ${isActive 
                    ? isTransparent 
                      ? 'bg-white/20 text-white' 
                      : 'bg-primary-50 text-primary-800'
                    : ''
                  }
                `}
              >
                {link.name}
              </NavLink>
            ))}

            {user ? (
              <Link
                to="/dashboard"
                className="ml-4 btn-primary"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className={`ml-4 flex items-center ${
                  isTransparent 
                    ? 'bg-white text-primary-800' 
                    : 'bg-primary-600 text-white'
                } px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition`}
              >
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isTransparent 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-white shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                block px-3 py-2 rounded-md text-base font-medium
                ${isActive 
                  ? 'bg-primary-50 text-primary-800' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
          
          {user ? (
            <Link
              to="/dashboard"
              className="block px-3 py-2 bg-primary-600 text-white rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="block px-3 py-2 bg-primary-600 text-white rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;