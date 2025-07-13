import React from 'react';
import { X } from 'lucide-react';

// Ini Wajib Kamu Ingat! (Props untuk ImportGuidelinesModal)
// Komponen ini hanya menerima status buka/tutup dan fungsi penutup.
interface ImportGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportGuidelinesModal: React.FC<ImportGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-900">Ketentuan Impor Data Siswa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-5 max-h-96 overflow-y-auto text-sm text-gray-700">
          <p className="mb-4">Untuk mengimpor data siswa dari file Excel, ikuti ketentuan format tabel di bawah ini:</p>
          
          <table className="min-w-full divide-y divide-gray-200 mb-6 border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Header (Wajib)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi & Ketentuan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-mono text-gray-900 border-r">NIS</td>
                <td className="px-4 py-2">Nomor Induk Siswa. **Wajib unik.** Jika ada duplikasi NIS, baris tersebut akan gagal diimpor.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-gray-900 border-r">Nama</td>
                <td className="px-4 py-2">Nama lengkap siswa.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-gray-900 border-r">Kelas</td>
                <td className="px-4 py-2">Nama kelas siswa. **Harus sama persis dengan nama kelas yang sudah terdaftar di halaman "Manajemen Kelas".** (Contoh: "1", "2"). Jika kelas tidak ditemukan, impor siswa akan gagal.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-gray-900 border-r">JenisKelamin</td>
                <td className="px-4 py-2">Jenis kelamin siswa. **Hanya menerima "L" (Laki-laki) atau "P" (Perempuan).** Input akan otomatis dikonversi ke huruf kapital.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-gray-900 border-r">TanggalLahir</td>
                <td className="px-4 py-2">Tanggal lahir siswa. Format yang disarankan:YYYY-MM-DD (misal: 2010-05-20) atau format tanggal Excel standar.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-gray-900 border-r">Alamat</td>
                <td className="px-4 py-2">Alamat lengkap siswa (Opsional).</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-gray-900 border-r">NamaOrangTua</td>
                <td className="px-4 py-2">Nama orang tua/wali siswa (Opsional).</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-gray-900 border-r">NomorTelepon</td>
                <td className="px-4 py-2">Nomor telepon orang tua/wali siswa (Opsional).</td>
              </tr>
            </tbody>
          </table>

          <p className="font-semibold mb-2">Contoh Baris Header di Excel Anda:</p>
          <div className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-4">
            <code className="text-xs break-all">NIS | Nama | Kelas | JenisKelamin | TanggalLahir | Alamat | NamaOrangTua | NomorTelepon</code>
          </div>

          <p className="font-semibold mb-2">Catatan Penting:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pastikan baris pertama Excel adalah header kolom.</li>
            <li>Urutan kolom tidak harus sama persis dengan contoh, asalkan nama headernya sesuai.</li>
            <li>Baris kosong di Excel akan diabaikan.</li>
            <li>Hasil impor (sukses/gagal per siswa) akan ditampilkan setelah proses selesai.</li>
          </ul>
        </div>
        <div className="p-5 border-t flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportGuidelinesModal;
