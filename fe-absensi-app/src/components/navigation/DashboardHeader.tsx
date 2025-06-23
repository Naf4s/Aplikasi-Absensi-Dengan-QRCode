import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';


interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden text-gray-500 hover:text-gray-600"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Header title - visible on desktop */}
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* School link - visible on mobile */}
        <Link to="/" className="md:hidden flex items-center">
          <span className="text-lg font-bold text-primary-800">SIPABSEN</span>
        </Link>

        {/* Right side icons */}
        <div className="flex items-center space-x-3">
          <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
            <Bell className="h-6 w-6" />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                {user?.name.charAt(0) || 'U'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;