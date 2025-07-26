import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import axios from 'axios';

// Interface untuk hasil pemindaian
interface ScanResult {
  id: string;
  name: string;
  class: string;
  timestamp: Date;
  success: boolean;
  message: string;
}

const ScannerPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const successSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  // Efek untuk membersihkan scanner saat komponen dilepas
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Gagal membersihkan html5QrcodeScanner:", err));
      }
    };
  }, []);

  // Fungsi untuk menghentikan scanner secara manual
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.clear()
        .then(() => {
          setScanning(false);
          setLastResult(null);
          setIsProcessing(false);
        })
        .catch(err => console.error("Gagal menghentikan html5QrcodeScanner:", err));
    } else {
      setScanning(false);
    }
  };

  // Fungsi yang dipanggil saat scanner gagal mendeteksi QR
  const onScanFailure = (error: string) => {
    if (error && (error.includes("NotAllowedError") || error.includes("Permission denied"))) {
      setScanMessage("Akses kamera ditolak. Izinkan akses kamera di pengaturan browser Anda.");
      setMessageType('error');
      setScanning(false);
    } else if (error && error.includes("NotFoundError")) {
      setScanMessage("Tidak ada kamera ditemukan. Pastikan kamera terpasang dan berfungsi.");
      setMessageType('error');
      setScanning(false);
    }
  };

  // Logika Inti Pemindaian (tidak berubah)
  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setLastResult(null);
    setScanMessage(null);
    setMessageType(null);

    let qrDataParsed: { id?: string; name?: string; class?: string } = {};

    try {
      try {
        qrDataParsed = JSON.parse(decodedText);
        if (!qrDataParsed.id || !qrDataParsed.name || !qrDataParsed.class) throw new Error("Data QR tidak lengkap.");
      } catch (e) {
        const result: ScanResult = { id: 'error-format', name: 'QR Tidak Valid', class: 'N/A', timestamp: new Date(), success: false, message: 'Format QR Code tidak valid.' };
        setLastResult(result);
        setScanMessage("Format QR Tidak Valid");
        setMessageType('error');
        errorSoundRef.current?.play();
        setTimeout(() => setIsProcessing(false), 2000);
        return;
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      await api.post('/attendance/scan', { qrData: decodedText, date: currentDate, timeIn: currentTime });

      const result: ScanResult = { id: qrDataParsed.id!, name: qrDataParsed.name!, class: qrDataParsed.class!, timestamp: new Date(), success: true, message: `Absensi berhasil: ${qrDataParsed.name!}` };
      setLastResult(result);
      setScanResults(prev => [result, ...prev]);
      setScanMessage(`Berhasil: ${qrDataParsed.name}`);
      setMessageType('success');
      successSoundRef.current?.play();

    } catch (error) {
      let msg = 'Gagal mencatat absensi.';
      if (axios.isAxiosError(error) && error.response) msg = error.response.data.message || msg;
      const result: ScanResult = { id: qrDataParsed.id || 'error', name: qrDataParsed.name || 'Tidak Dikenal', class: qrDataParsed.class || '-', timestamp: new Date(), success: false, message: msg };
      setLastResult(result);
      setScanMessage(msg);
      setMessageType('error');
      errorSoundRef.current?.play();
    } finally {
      setTimeout(() => setIsProcessing(false), 3000);
    }
  };

  const startScanner = () => {
    if (!hasPermission('mark_attendance') || !scannerDivRef.current || scanning) return;
    
    // Ukuran qrbox harus sama dengan ukuran div panduan visual
    const qrboxSize = 250; 
    const newScanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: qrboxSize, height: qrboxSize },
        rememberLastUsedCamera: true,
      },
      false
    );
    scannerRef.current = newScanner;

    try {
      newScanner.render(onScanSuccess, onScanFailure);
      setScanning(true);
      setIsProcessing(false);
    } catch (err: any) {
      setScanMessage(`Gagal memulai scanner: ${err.message || 'Periksa izin kamera.'}`);
      setMessageType('error');
      setScanning(false);
    }
  };

  const QrCodeIconComponent = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
  );

  if (!hasPermission('mark_attendance')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk menggunakan halaman scanner ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- START: Perbaikan UI dengan CSS --- */}
      <style>{`
        /* Menyembunyikan footer dan tombol stop dari library html5-qrcode */
        #qr-reader__dashboard {
          display: none !important;
        }
        /* Menghilangkan border default dari area scan library */
        #qr-reader__scan_region {
          border: none !important;
        }
        /* Menyembunyikan elemen yang tidak diinginkan */
        #qr-shaded-region {
          display: none !important;
        }
      `}</style>
      {/* --- END: Perbaikan UI dengan CSS --- */}

      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto"></audio>
      <audio ref={errorSoundRef} src="/sounds/error.mp3" preload="auto"></audio>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Scanner Absensi QR</h1>
        {scanning ? (
          <button onClick={stopScanner} className="btn bg-gray-600 text-white hover:bg-gray-700">
            Hentikan Scanner
          </button>
        ) : (
          <button onClick={startScanner} className="btn-primary">
            Mulai Scanner
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Scanner QR Code</h2>
            
            <div className="relative w-full h-[480px] bg-black rounded-lg overflow-hidden shadow-inner">
              <div ref={scannerDivRef} id="qr-reader" className="w-full h-full"></div>
              
              {!scanning && (
                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-center p-4">
                  <QrCodeIconComponent className="h-16 w-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 font-medium">Scanner tidak aktif</p>
                </div>
              )}

              {scanning && !isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-[250px] h-[250px]">
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-lg"></div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white z-10 transition-opacity duration-300">
                  {messageType === 'success' ? 
                    <CheckCircle className="h-16 w-16 text-green-400 mb-4" /> : 
                    <XCircle className="h-16 w-16 text-red-400 mb-4" />
                  }
                  <h3 className="text-2xl font-bold">{scanMessage}</h3>
                  {lastResult && lastResult.success && <p className="text-lg">{`${lastResult.name} - ${lastResult.class}`}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Riwayat Sesi Ini</h2>
            </div>
            {scanResults.length === 0 ? (
              <div className="p-5 text-center text-gray-500">Belum ada riwayat</div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {scanResults.map((result, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 flex items-start">
                    {result.success ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{result.name}</p>
                      <p className="text-xs text-gray-500">Kelas {result.class}</p>
                      <p className="text-xs text-gray-500 mt-1">{result.timestamp.toLocaleTimeString('id-ID')}</p>
                      {!result.success && <p className="text-xs text-red-600 mt-1">{result.message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {scanResults.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button onClick={() => setScanResults([])} className="text-sm text-gray-600 hover:text-gray-900">Hapus Riwayat</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
