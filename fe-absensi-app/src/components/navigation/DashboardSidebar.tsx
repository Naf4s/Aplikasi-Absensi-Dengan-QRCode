import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, School, LayoutDashboard, Users, QrCode, ClipboardList, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasPermission } = useAuth();
  
  const getNavLinks = () => {
    const links = [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Absensi', path: '/dashboard/attendance', icon: <ClipboardList className="w-5 h-5" />, permission: 'mark_attendance' },
      { name: 'Scanner QR', path: '/dashboard/scanner', icon: <QrCode className="w-5 h-5" />, permission: 'mark_attendance' },
    ];

    // Admin-only links
    if (user?.role === 'admin') {
      links.push(
        { name: 'Siswa', path: '/dashboard/students', icon: <Users className="w-5 h-5" />, permission: 'manage_students' },
        { name: 'Laporan', path: '/dashboard/reports', icon: <BarChart2 className="w-5 h-5" />, permission: 'view_attendance' },
        { name: 'Pengaturan', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" />, permission: 'manage_access' }
      );
    } else {
      // Teacher-only links
      links.push(
        { name: 'Laporan Kelas', path: '/dashboard/reports', icon: <BarChart2 className="w-5 h-5" />, permission: 'view_attendance' }
      );
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-white md:sticky transition-transform transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        border-r border-gray-200 md:block
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <School className="h-7 w-7 text-primary-800" />
              <h1 className="ml-2 text-lg font-bold text-gray-900">SIPABSEN</h1>
            </div>
            <button 
              className="md:hidden text-gray-500 hover:text-gray-600"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                    {user.name.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrator' : 'Guru'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navLinks.map((link) => (
                hasPermission(link.permission || '') && (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => `
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${isActive 
                        ? 'bg-primary-50 text-primary-800' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                  >
                    {link.icon}
                    <span className="ml-3">{link.name}</span>
                  </NavLink>
                )
              ))}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              onClick={logout}
            >
              <LogOut className="w-5 h-5 text-gray-500" />
              <span className="ml-3">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;