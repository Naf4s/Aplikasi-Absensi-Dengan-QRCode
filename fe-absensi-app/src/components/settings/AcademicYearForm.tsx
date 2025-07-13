import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CalendarDays, School } from 'lucide-react';

interface Props {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AcademicYearForm: React.FC<Props> = ({ onSuccess, onError }) => {
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambil data awal dari /settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        const settings = response.data;

        const academicYearSetting = settings.find((s: any) => s.key === 'current_academic_year');
        const semesterSetting = settings.find((s: any) => s.key === 'current_semester');

        if (academicYearSetting) setAcademicYear(academicYearSetting.value);
        if (semesterSetting) setSemester(semesterSetting.value);
      } catch (err) {
        console.error('Gagal memuat pengaturan:', err);
        onError('Gagal memuat pengaturan.');
      }
    };

    fetchSettings();
  }, [onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/settings', [
        { key: 'current_academic_year', value: academicYear },
        { key: 'current_semester', value: semester }
      ]);

      onSuccess('Tahun ajaran dan semester berhasil diperbarui.');
    } catch (err) {
      console.error('Gagal menyimpan:', err);
      onError('Gagal menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-6 border border-gray-200">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <School className="h-5 w-5" />
          Pengaturan Tahun Ajaran
        </h2>
        <p className="text-sm text-gray-500">Setel tahun ajaran dan semester aktif saat ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Contoh: 2025/2026"
            required
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  );
};

export default AcademicYearForm;
