
import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AcademicYearForm from '../../components/settings/AcademicYearForm';
import { useAuth } from '../../contexts/AuthContext';

const SettingsPage = () => {
  const { hasPermission } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  const [qr, setQr] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleSuccess = useCallback((message: string) => {
    setPageMessage(message);
    setPageError(null);
  }, []);

  const handleError = useCallback((message: string) => {
    setPageError(message);
    setPageMessage(null);
  }, []);

  const fetchQRStatus = async () => {
    try {
      const response = await fetch("/api/wa-status");
      const data = await response.json();
      setQr(data.qr);
      setIsReady(data.isReady);
    } catch (error) {
      console.error("❌ Gagal fetch QR status:", error);
    }
  };

  useEffect(() => {
    fetchQRStatus(); // ambil data awal
    const interval = setInterval(fetchQRStatus, 3000); // polling setiap 3 detik

    return () => clearInterval(interval); // bersihkan timer saat unmount
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Aplikasi</h1>

      {pageError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start mb-6">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageError}</span>
        </div>
      )}

      {pageMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start mb-6">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageMessage}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Pengaturan Tahun Ajaran */}
        {hasPermission('manage_access') && (
          <div className="bg-white rounded-lg shadow p-6">
            <AcademicYearForm onSuccess={handleSuccess} onError={handleError} />
          </div>
        )}

        {/* Pengaturan Integrasi WhatsApp */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Integrasi WhatsApp</h2>
          {!isReady && qr ? (
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-700 mb-3">Scan QR code ini dengan WhatsApp:</p>
              <div className="p-2 border border-gray-300 bg-white rounded shadow-sm">
                <QRCodeSVG value={qr} size={200} level="M" fgColor="#000000" bgColor="#FFFFFF" includeMargin />
              </div>
              <p className="mt-3 text-sm text-gray-600">Pastikan ponsel Anda terhubung ke internet.</p>
            </div>
          ) : isReady ? (
            <div className="text-center text-green-600 font-medium">
              <p>✅ WhatsApp sudah terhubung dan siap!</p>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Menunggu QR Code dari server...</p>
              <p className="text-sm">Pastikan server Anda berjalan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
