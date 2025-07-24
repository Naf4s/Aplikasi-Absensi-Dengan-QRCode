import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout'; 
import DashboardLayout from './layouts/DashboardLayout'; 
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages (yang akan tetap digunakan)
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import NewsPage from './pages/NewsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';

// Protected Pages (Dashboard SIPABSEN)
import DashboardPage from './pages/dashboard/DashboardPage'; // Default dashboard page
import AttendancePage from './pages/dashboard/AttendancePage';
import ScannerPage from './pages/dashboard/ScannerPage';
import StudentsPage from './pages/dashboard/StudentsPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import UsersPage from './pages/dashboard/UsersPage';
import AcademicYearSettingsPage from './pages/dashboard/AcademicYearSettingsPage';
import ClassesPage from './pages/dashboard/ClassesPage'; // Import ClassesPage yang baru
import PromotionSettingsPage from './pages/dashboard/PromotionSettingsPage'; // Import PromotionSettingsPage
import AlphaPage from './pages/dashboard/AlphaPage';
import NewsManagementPage from './pages/dashboard/NewsManagementPage'; // Import NewsManagementPage

// Komponen ini akan menangani redirect setelah login
const AuthRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'teacher') {
          navigate('/dashboard/attendance', { replace: true });
        } else { // admin atau role lain
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/login-form', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes (Web Profile) */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
          
          {/* Halaman Login */}
          <Route path="/login" element={<AuthRedirect />} /> 
          <Route path="/login-form" element={<LoginPage />} />
          

          {/* Protected Routes (Dashboard SIPABSEN) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout /> 
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="scanner" element={<ScannerPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="users" element={<UsersPage />} /> 
            <Route path="settings/academic-year" element={<AcademicYearSettingsPage />} />
            <Route path="settings/promotion" element={<PromotionSettingsPage />} /> {/* Added promotion route */}
            <Route path="classes" element={<ClassesPage />} />{/* Route baru untuk Manajemen Kelas */}
            <Route path="alpha" element={<AlphaPage />} />
            <Route path="news-management" element={<NewsManagementPage />} /> {/* Added News Management route */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
