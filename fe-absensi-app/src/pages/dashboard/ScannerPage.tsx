import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';


interface ScanResult {
  id: string;
  name: string;
  class: string;
  timestamp: Date;
  success: boolean;
  message: string;
}

const ScannerPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Gagal membersihkan html5QrcodeScanner:", err));
      }
    };
  }, []);

  const stopScanner = () => {
    console.log('>>> stopScanner() dipanggil <<<');
    if (scannerRef.current) {
      scannerRef.current.clear()
        .then(() => {
          console.log('stopScanner: Scanner berhasil dihentikan.');
          setScanning(false);
        })
        .catch(err => console.error("stopScanner: Gagal menghentikan html5QrcodeScanner:", err));
    } else {
      console.log('stopScanner: Scanner tidak aktif atau tidak ada instance.');
      setScanning(false);
    }
  };

  const onScanFailure = (error: string) => {
    if (error && (error.includes("NotAllowedError") || error.includes("Permission denied"))) {
      setScanning(false);
      playErrorSound();
    } else if (error && error.includes("NotFoundError")) {
      setScanning(false);
      playErrorSound();
    }
    // Abaikan error umum seperti "QR code not found" agar tidak mengganggu UI.
  };

  const playSuccessSound = () => {
    if (successSoundRef.current) {
      successSoundRef.current.play();
    } else {
      const audio = new Audio('/success.mp3');
      audio.play();
    }
  };

  const playErrorSound = () => {
    if (errorSoundRef.current) {
      errorSoundRef.current.play();
    } else {
      const audio = new Audio('/error.mp3');
      audio.play();
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    let qrDataParsed: { id?: string; name?: string; class?: string } = {};

    try {
      try {
        qrDataParsed = JSON.parse(decodedText);
        if (!qrDataParsed.id || !qrDataParsed.name || !qrDataParsed.class) {
          throw new Error("Data QR tidak lengkap (ID, Nama, Kelas wajib ada).");
        }
      } catch (e) {
        playErrorSound();
        setTimeout(() => setIsProcessing(false), 2000);
        return;
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      await api.post('/attendance/scan', {
        qrData: decodedText,
        date: currentDate,
        timeIn: currentTime
      });

      const result: ScanResult = {
        id: qrDataParsed.id!,
        name: qrDataParsed.name!,
        class: qrDataParsed.class!,
        timestamp: new Date(),
        success: true,
        message: `Absensi berhasil: ${qrDataParsed.name!}`,
      };
      setScanResults(prev => [result, ...prev]);
      playSuccessSound();

    } catch (error) {
      playErrorSound();
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
    }
  };

  const startScanner = () => {
    console.log('>>> startScanner() dipanggil <<<');
    if (!hasPermission('mark_attendance')) {
      console.log('startScanner: Izin "mark_attendance" tidak dimiliki.');
      return;
    }
    if (!scannerDivRef.current) {
      console.log('startScanner: scannerDivRef.current TIDAK tersedia.');
      return;
    }
    if (scanning) {
      console.log('startScanner: Scanner sudah aktif, tidak perlu memulai lagi.');
      return;
    }
    scannerDivRef.current.innerHTML = '';
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 30,
        qrbox: { width: 250, height: 250 },
        aspectRatio: window.innerWidth / window.innerHeight,
        disableFlip: false,
        rememberLastUsedCamera: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      },
      false
    );
    let renderSuccess = false;
    try {
      scannerRef.current.render(onScanSuccess, onScanFailure);
      renderSuccess = true;
    } catch (err: any) {
      console.error('startScanner: Gagal merender scanner (synchronous error):', err);
      setScanning(false);
    }
    if (renderSuccess) {
      setScanning(true);
      console.log('startScanner: Scanner berhasil dirender dan state scanning di-set TRUE.');
    }
  };

  const resetScanner = () => {
    console.log('>>> resetScanner() dipanggil <<<');
    stopScanner();
    setTimeout(() => {
      startScanner();
    }, 500);
  };

  if (!hasPermission('mark_attendance')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk menggunakan halaman scanner ini.</p>
      </div>
    );
  }

  const QrCodeIconComponent = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Scanner Absensi QR</h1>
        {scanning ? (
          <button
            onClick={stopScanner}
            className="btn bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
          >
            Hentikan Scanner
          </button>
        ) : (
          <button
            onClick={startScanner}
            className="btn-primary"
          >
            Mulai Scanner
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Scanner QR Code</h2>
            <div
              ref={scannerDivRef}
              id="qr-reader"
              className="max-w-full"
            ></div>
            {!scanning && (
              <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <QrCodeIconComponent className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Scanner QR Tidak Aktif</h3>
                <p className="mt-2 text-gray-500 max-w-md">
                  Klik tombol "Mulai Scanner" untuk memulai pemindaian kode QR absensi siswa.
                </p>
                <div className="mt-6 border-t pt-4">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="mt-2">Pastikan anda menggunakan QR code dari siswa yang *sudah ada di database*.</p>
                  </div>
                </div>
              </div>
            )}
            {scanning && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={resetScanner}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset Scanner
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Riwayat Pemindaian</h2>
            </div>
            {scanResults.length === 0 ? (
              <div className="p-5 text-center text-gray-500">
                Belum ada riwayat pemindaian
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {scanResults.map((result, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error-500 flex-shrink-0" />
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {result.success ? result.name : result.message}
                        </p>
                        {result.success && (
                          <p className="text-xs text-gray-500">
                            Kelas {result.class}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {result.timestamp.toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {scanResults.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setScanResults([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Hapus Riwayat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;