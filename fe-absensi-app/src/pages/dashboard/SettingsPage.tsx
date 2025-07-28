
import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AcademicYearForm from '../../components/settings/AcademicYearForm';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const SettingsPage = () => {
  const { hasPermission } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  // Ref untuk menyimpan ID dari setTimeout agar bisa di-clear
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State khusus untuk integrasi WhatsApp
  const [qr, setQr] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null); // State baru untuk error fetch QR

  const handleSuccess = useCallback((message: string) => {
    // Hapus timeout sebelumnya jika ada untuk me-reset timer
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setPageMessage(message);
    setPageError(null);
    
    notificationTimeoutRef.current = setTimeout(() => {
      setPageMessage(null);
    }, 5000);
  }, []);

  const handleError = useCallback((message: string) => {
    // Hapus timeout sebelumnya jika ada untuk me-reset timer
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setPageError(message);
    setPageMessage(null);
    
    notificationTimeoutRef.current = setTimeout(() => {
      setPageError(null);
    }, 5000);
  }, []);

  // Dibungkus dengan useCallback agar stabil dan ditambahkan penanganan error
  const fetchQRStatus = useCallback(async () => {
    try {
      const response = await api.get("/settings/wa-status");
      const data = response.data;
      setQr(data.qr);
      setIsReady(data.isReady);
      setQrError(null); // Hapus error jika fetch berhasil
    } catch (error) {
      console.error("❌ Gagal fetch QR status:", error);
      setQrError("Gagal mengambil status WhatsApp. Pastikan backend berjalan dan terhubung.");
      // Reset state on error untuk menghindari menampilkan data lama
      setQr(null);
      setIsReady(false);
    }
  }, []);

  // Refactor useEffect untuk polling yang lebih aman
  useEffect(() => {
    if (!hasPermission('manage_access')) {
      return; // Keluar jika user tidak punya izin
    }

    fetchQRStatus(); // Panggil pertama kali saat komponen dimuat
    const intervalId = setInterval(fetchQRStatus, 5000); // Polling setiap 5 detik

    // Fungsi cleanup untuk membersihkan interval saat komponen di-unmount
    return () => {
      clearInterval(intervalId);
      // Hapus juga timeout notifikasi jika komponen di-unmount
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [hasPermission, fetchQRStatus]);

  const canManageSettings = hasPermission('manage_access');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Aplikasi</h1>

      {pageError && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start mb-6">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageError}</span>
        </div>
      )}

      {pageMessage && (
        <div className="bg-success-50 text-success-700 p-4 rounded-lg flex items-start mb-6">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageMessage}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Pengaturan Tahun Ajaran */}
        {canManageSettings && (
          <div className="bg-white rounded-lg shadow p-6">
            <AcademicYearForm onSuccess={handleSuccess} onError={handleError} />
          </div>
        )}

        {/* Pengaturan Integrasi WhatsApp */}
        {canManageSettings && (
          <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Integrasi WhatsApp</h2>
            {qrError ? (
              <div className="text-center text-error-500 font-medium p-4 bg-error-50 rounded-md">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{qrError}</p>
              </div>
            ) : !isReady && qr ? (
              <div className="flex flex-col items-center justify-center">
                <p className="text-gray-700 mb-3">Scan QR code ini dengan WhatsApp:</p>
                <div className="p-2 border border-gray-300 bg-white rounded shadow-sm">
                  <QRCodeSVG value={qr} size={200} level="M" fgColor="#000000" bgColor="#FFFFFF" includeMargin />
                </div>
                <p className="mt-3 text-sm text-gray-600">Buka WhatsApp &gt; Pengaturan &gt; Perangkat Tertaut &gt; Tautkan Perangkat.</p>
              </div>
            ) : isReady ? (
              <div className="text-center text-success-600 font-medium p-4 bg-success-50 rounded-md">
                <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                <p>WhatsApp sudah terhubung dan siap digunakan!</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto mb-3"></div>
                <p>Menunggu QR Code dari server...</p>
                <p className="text-sm">Pastikan server WhatsApp backend berjalan.</p>
              </div>
            )}
        </div>
        )}

        {!canManageSettings && (
           <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex items-start">
             <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
             <span>Anda tidak memiliki izin untuk mengelola pengaturan.</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
