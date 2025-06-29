import React from 'react';
import { X } from 'lucide-react';

// Ini Wajib Kamu Ingat! (Props untuk ImportResultsModal)
// Komponen ini menerima hasil impor dan fungsi penutup.
interface ImportResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: any[] | null; // Array hasil impor
}

const ImportResultsModal: React.FC<ImportResultsModalProps> = ({ isOpen, onClose, results }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-900">Hasil Impor Siswa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-5 max-h-96 overflow-y-auto">
          {results && results.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className={result.status === 'success' ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.student?.nis || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.student?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.status === 'success' ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">Tidak ada hasil impor.</p>
          )}
        </div>
        <div className="p-5 border-t flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportResultsModal;
