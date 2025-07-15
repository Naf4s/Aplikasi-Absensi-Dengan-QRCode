import React from 'react';
import { NavLink } from 'react-router-dom'; // Gunakan NavLink untuk styling aktif
import { 
  X, School, LayoutDashboard, Users, QrCode, 
  ClipboardList, BarChart2, Settings, LogOut, BookOpen, GraduationCap, CalendarCheck, FileText, 
  Send
} from 'lucide-react'; // Import semua ikon yang dibutuhkan

// Added NewsManagement icon import
import { FileText as NewsIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Ini Wajib Kamu Ingat! (Prop untuk Kontrol Responsivitas)
// Komponen sidebar ini menerima 'isOpen' dan 'onClose' dari parent (DashboardLayout).
interface DashboardSidebarProps {
  isOpen: boolean; // Menunjukkan apakah sidebar terbuka (true) atau tertutup (false)
  onClose: () => void; // Fungsi untuk menutup sidebar (dipanggil saat klik X atau backdrop)
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasPermission } = useAuth(); // Dapatkan user, logout, dan hasPermission

  console.log('DashboardSidebar user:', user);

  // Ini Wajib Kamu Ingat! (Daftar Link Navigasi Dinamis Berdasarkan Role/Permission)
  // Membangun daftar link navigasi yang akan ditampilkan di sidebar.
  const getNavLinks = () => {
    const links = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' }, // Asumsi semua user login bisa lihat dashboard
      { name: 'Absensi', path: '/dashboard/attendance', icon: CalendarCheck, permission: 'mark_attendance' },
      { name: 'Scanner QR', path: '/dashboard/scanner', icon: QrCode, permission: 'mark_attendance' },
      { name: 'Siswa', path: '/dashboard/students', icon: GraduationCap, permission: 'manage_students' },
      { name: 'Laporan', path: '/dashboard/reports', icon: BarChart2, permission: 'view_attendance' },
      // Link Manajemen Pengguna dan Kelas hanya akan muncul jika user memiliki permission yang sesuai
      { name: 'Pengguna', path: '/dashboard/users', icon: Users, permission: 'manage_users' },
      { name: 'Kelas', path: '/dashboard/classes', icon: BookOpen, permission: 'manage_classes' },
      { name: 'kenaikan kelas', path: '/dashboard/settings/promotion', icon: GraduationCap, permission: 'manage_classes' },
      { name: 'Notifikasi Alpha', path: '/dashboard/alpha', icon: Send, permission: 'send_notification' },
      { name: 'News Management', path: '/dashboard/news-management', icon: NewsIcon, hideForRoles: ['teacher'] },
      { name: 'Pengaturan', path: '/dashboard/settings', icon: Settings, permission: 'manage_access', end: true }
    ];

  // Filter link berdasarkan permission user yang sedang login dan role
  const filteredLinks = links.filter(link => {
    if (!user) return false; // If no user, hide all links
    if (link.hideForRoles && user && link.hideForRoles.some(role => role.toLowerCase() === user.role.toLowerCase())) {
      return false;
    }
    return !link.permission || hasPermission(link.permission);
  });

  console.log('DashboardSidebar filtered navLinks:', filteredLinks.map(l => l.name));

  return filteredLinks;
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile sidebar backdrop (latar belakang gelap) */}
      {/* Ini Wajib Kamu Ingat! (Backdrop untuk Mobile Overlay Sidebar) */}
      {/* Muncul di mobile (md:hidden) saat sidebar terbuka (isOpen) untuk memblokir interaksi di luar sidebar. */}
      <div 
        className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose} // Menutup sidebar saat backdrop diklik
      />

      {/* Sidebar utama */}
      {/* Ini Wajib Kamu Ingat! (Kelas Responsif untuk Sidebar Itu Sendiri) */}
      {/* - fixed top-0 left-0 h-full w-64 z-40 bg-white border-r border-gray-200  */}
      {/* - transition-transform transform duration-300  */}
      {/* - ${isOpen ? 'translate-x-0' : '-translate-x-full'}  */}
      {/* - md:sticky md:top-0 md:translate-x-0 md:block md:flex-shrink-0 */}
      <div className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 
        transition-transform transform duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:sticky md:top-0 md:translate-x-0 md:block md:flex-shrink-0
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <School className="h-7 w-7 text-primary-800" />
              <h1 className="ml-2 text-lg font-bold text-gray-900">SIPABSEN</h1>
            </div>
            {/* Tombol tutup di mobile */}
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
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role === 'admin' ? 'Administrator' : 'Guru'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end || false}
                  // Ini Wajib Kamu Ingat! (Menutup Sidebar Saat Navigasi di Mobile)
                  // Saat link diklik di mobile, sidebar harus ditutup.
                  onClick={() => {
                    if (window.innerWidth < 768) { // Cek jika layar mobile
                      onClose();
                    }
                  }}
                  className={({ isActive }) => `
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${isActive 
                      ? 'bg-primary-50 text-primary-800' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <link.icon className="h-5 w-5 flex-shrink-0" /> {/* Gunakan komponen icon langsung */}
                  <span className="ml-3">{link.name}</span>
                </NavLink>
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
