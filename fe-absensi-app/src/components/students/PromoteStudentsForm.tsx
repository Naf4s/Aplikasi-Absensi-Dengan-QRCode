import React, { useState } from 'react';
import api from '../../lib/api';
import { GraduationCap, Loader2, AlertCircle, Search, X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
}

interface Props {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const PromoteStudentsForm: React.FC<Props> = ({ onSuccess, onError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentsToHoldBack, setStudentsToHoldBack] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);

  const openPromotionModal = async () => {
    setIsModalOpen(true);
    setIsFetchingStudents(true);
    setErrorMessage(null);
    try {
      const response = await api.get('/students');
      setAllStudents(response.data || []);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal memuat daftar siswa.';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsFetchingStudents(false);
    }
  };

  const handleToggleHoldBack = (studentId: string) => {
    setStudentsToHoldBack(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handlePromotion = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await api.post('/students/promote', {
        excludeStudentIds: Array.from(studentsToHoldBack),
      });

      onSuccess(response.data.message || 'Promosi siswa berhasil.');
      setIsModalOpen(false);
      setStudentsToHoldBack(new Set());
    } catch (err: any) {
      const message = err.response?.data?.message || 'Terjadi kesalahan saat memproses promosi.';
      onError(message);
      // Error message will be shown on the main page via onError callback
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = allStudents
    .filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.includes(searchTerm) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      return parseInt(a.class, 10) - parseInt(b.class, 10);
    });

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6 border border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Promosi Siswa
          </h2>
          <p className="text-sm text-gray-500">
            Menaikkan tingkat semua siswa ke kelas selanjutnya dan meluluskan siswa di tingkat akhir.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Proses ini akan memindahkan semua siswa ke tingkat kelas berikutnya.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={openPromotionModal}
          >
            Mulai Promosi
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">Konfirmasi Promosi Siswa</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <p className="text-sm text-gray-600">
                Secara default, semua siswa akan naik ke tingkat berikutnya. Pilih siswa di bawah ini jika ada yang <strong>tinggal kelas</strong> (tidak dipromosikan).
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, atau kelas siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {isFetchingStudents ? (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary-600" />
                  <p className="mt-2 text-gray-500">Memuat daftar siswa...</p>
                </div>
              ) : (
                <div className="border rounded-md max-h-64 overflow-y-auto">
                  {filteredStudents.length > 0 ? filteredStudents.map(student => (
                    <label key={student.id} className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={studentsToHoldBack.has(student.id)}
                        onChange={() => handleToggleHoldBack(student.id)}
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-500">NIS: {student.nis} - Kelas: {student.class}</p>
                      </div>
                    </label>
                  )) : <p className="p-4 text-center text-gray-500">Tidak ada siswa yang cocok dengan pencarian.</p>}
                </div>
              )}
              <p className="text-sm text-warning-700 bg-warning-50 p-3 rounded-md">
                <strong>Perhatian:</strong> {studentsToHoldBack.size} siswa dipilih untuk tidak naik kelas. Siswa di kelas 6 akan ditandai sebagai lulus. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex justify-end space-x-3 p-5 border-t bg-gray-50">
              <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Batal
              </button>
              <button type="button" className="btn-primary" onClick={handlePromotion} disabled={isSubmitting || isFetchingStudents}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Memproses...</span>
                ) : `Konfirmasi dan Jalankan Promosi`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromoteStudentsForm;
