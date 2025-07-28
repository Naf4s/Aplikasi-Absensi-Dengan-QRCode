import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, CalendarDays } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const [academicYear, setAcademicYear] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentSettings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/settings');
        const settings = response.data;
        const yearSetting = settings.find((s: any) => s.key === 'current_academic_year');
        const semesterSetting = settings.find((s: any) => s.key === 'current_semester');

        if (yearSetting) {
          setAcademicYear(yearSetting.value);
        }
        if (semesterSetting) {
          // Mengubah nilai numerik menjadi teks yang mudah dibaca
          setSemester(semesterSetting.value === '1' ? 'Ganjil' : 'Genap');
        }
      } catch (error) {
        console.error("Gagal memuat pengaturan untuk header:", error);
        setAcademicYear('N/A');
        setSemester('N/A');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentSettings();
  }, []);

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
          <span className="text-lg font-bold text-primary-800">SIABSEN</span>
        </Link>

        {/* Info Tahun Ajaran & Semester */}
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <div className="h-5 bg-gray-200 rounded-md w-40 animate-pulse"></div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-primary-50 text-primary-800 border border-primary-200">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm font-medium">
                {academicYear} | {semester}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;