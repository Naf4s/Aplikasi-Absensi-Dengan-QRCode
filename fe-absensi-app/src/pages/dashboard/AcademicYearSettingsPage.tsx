import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AcademicYearForm from '../../components/settings/AcademicYearForm';
import PromoteStudentsForm from '../../components/students/PromoteStudentsForm';
import api from '../../lib/api';
import axios from 'axios';

interface ClassItem {
  id: string;
  name: string;
  homeroom_teacher_id?: string | null;
  homeroom_teacher_name?: string | null;
}

const AcademicYearSettingsPage: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');
  const [currentSemester, setCurrentSemester] = useState('');

  const fetchInitialData = useCallback(async () => {
    setPageError(null);
    try {
      const settingsRes = await api.get('/settings');
      const settings = settingsRes.data;
      const academicYear = settings.find((s: any) => s.key === 'current_academic_year')?.value || '';
      const semester = settings.find((s: any) => s.key === 'current_semester')?.value || '';

      setCurrentAcademicYear(academicYear);
      setCurrentSemester(semester);

      const classRes = await api.get('/classes');
      setClasses(classRes.data || []);
      setPageMessage(null);
    } catch (err) {
      console.error('Gagal mengambil data awal:', err);
      let msg = 'Gagal memuat data pengaturan.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setPageError(msg);
    }
  }, []);

  useEffect(() => {
    if (hasPermission('manage_academic_year')) {
      fetchInitialData();
    } else {
      setPageError('Anda tidak memiliki izin untuk melihat halaman ini.');
    }
  }, [hasPermission, fetchInitialData]);

  const handleSuccess = useCallback((message: string) => {
    setPageMessage(message);
    setPageError(null);
    fetchInitialData();
  }, [fetchInitialData]);

  const handleError = useCallback((message: string) => {
    setPageError(message);
    setPageMessage(null);
  }, []);

  if (!hasPermission('manage_academic_year') && currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk melihat halaman pengaturan tahun ajaran.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan Tahun Ajaran & Promosi Siswa</h1>

      {pageError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageError}</span>
        </div>
      )}

      {pageMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageMessage}</span>
        </div>
      )}

      <AcademicYearForm onSuccess={handleSuccess} onError={handleError} />

      <PromoteStudentsForm
        onClose={() => {}}
        onSuccess={handleSuccess}
        onError={handleError}
        classes={classes}
        currentAcademicYear={currentAcademicYear}
        currentSemester={currentSemester}
      />
    </div>
  );
};

export default AcademicYearSettingsPage;
