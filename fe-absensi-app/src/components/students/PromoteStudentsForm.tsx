import React, { useState } from 'react';
import api from '../../lib/api';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  homeroom_teacher_id?: string | null;
  homeroom_teacher_name?: string | null;
}

interface Props {
  onClose?: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  classes: ClassItem[];
  currentAcademicYear: string;
}

const PromoteStudentsForm: React.FC<Props> = ({
  onSuccess,
  onError,
  onClose,
  classes,
  currentAcademicYear,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(currentAcademicYear);

  // Helper to generate academic year options for dropdown (e.g., 2024/2025, 2025/2026, 2026/2027,)
  const generateAcademicYearOptions = () => {
    const options: string[] = [];
    if (!currentAcademicYear || !currentAcademicYear.includes('/')) {
      // fallback to current year and next year if currentAcademicYear is invalid
      const now = new Date();
      const currentYear = now.getFullYear();
      for (let i = -1; i <= 3; i++) {
        const optionStart = currentYear + i;
        const optionEnd = currentYear + i + 1;
        options.push(optionStart + '/' + optionEnd);
      }
      return options;
    }
    const [startYearStr, endYearStr] = currentAcademicYear.split('/');
    const startYear = parseInt(startYearStr);
    const endYear = parseInt(endYearStr);
    if (isNaN(startYear) || isNaN(endYear)) {
      // fallback if parsing failed
      const now = new Date();
      const currentYear = now.getFullYear();
      for (let i = -1; i <= 3; i++) {
        const optionStart = currentYear + i;
        const optionEnd = currentYear + i + 1;
        options.push(optionStart + '/' + optionEnd);
      }
      return options;
    }
    for (let i = -1; i <= 3; i++) {
      const optionStart = startYear + i;
      const optionEnd = endYear + i;
      options.push(optionStart + '/' + optionEnd);
    }
    return options;
  };

  const handlePromotion = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await api.post('/students/promote', {
        academicYear: selectedAcademicYear,
      });

      onSuccess(response.data.message || 'Promosi siswa berhasil.');
      setConfirming(false);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Terjadi kesalahan saat memproses promosi.';
      onError(message);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 space-y-6 border border-gray-200">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Promosi Siswa
        </h2>
        <p className="text-sm text-gray-500">
          Promosikan seluruh siswa ke tingkat kelas berikutnya berdasarkan tahun ajaran aktif.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!confirming ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 flex items-center gap-2">
            <span>Tahun Ajaran Saat Ini:</span>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
            >
              {generateAcademicYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirming(true)}
          >
            Mulai Promosi
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-warning-700 bg-warning-50 p-3 rounded">
            Yakin ingin mempromosikan semua siswa ke kelas berikutnya? Tindakan ini tidak bisa dibatalkan.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setConfirming(false)}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handlePromotion}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Memproses...
                </span>
              ) : (
                'Konfirmasi Promosi'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoteStudentsForm;
