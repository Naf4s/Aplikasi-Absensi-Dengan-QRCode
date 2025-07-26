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

  // --- START: State dan Ref Baru ---
  // State untuk mencegah pemrosesan ganda saat QR masih di depan kamera
  const [isProcessing, setIsProcessing] = useState(false);
  // Ref untuk elemen audio
  const successSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);
  // --- END: State dan Ref Baru ---

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
    console.log('>>> stopScanner() dipanggil <<<');
    if (scannerRef.current) {
      scannerRef.current.clear()
        .then(() => {
          console.log('stopScanner: Scanner berhasil dihentikan.');
          setScanning(false);
          setScanMessage(null);
          setMessageType(null);
          setLastResult(null);
          setIsProcessing(false); // Reset status proses
        })
        .catch(err => console.error("stopScanner: Gagal menghentikan html5QrcodeScanner:", err));
    } else {
      console.log('stopScanner: Scanner tidak aktif atau tidak ada instance.');
      setScanning(false);
    }
  };

  // Fungsi yang dipanggil saat scanner gagal mendeteksi QR
  const onScanFailure = (error: string) => {
    // Fungsi ini menangani error dari library scanner, bukan error logika aplikasi
    if (error && (error.includes("NotAllowedError") || error.includes("Permission denied"))) {
      setScanMessage("Akses kamera ditolak. Izinkan akses kamera di pengaturan browser Anda.");
      setMessageType('error');
      setScanning(false);
    } else if (error && error.includes("NotFoundError")) {
      setScanMessage("Tidak ada kamera ditemukan. Pastikan kamera terpasang dan berfungsi.");
      setMessageType('error');
      setScanning(false);
    }
    // Error umum seperti "QR code not found" akan diabaikan agar tidak mengganggu UI.
  };

  // --- START: Logika Inti Pemindaian yang Dimodifikasi ---
  const onScanSuccess = async (decodedText: string) => {
    // 1. Gatekeeper: Jika sedang memproses, abaikan scan baru.
    if (isProcessing) {
      return;
    }

    // 2. Kunci Proses: Langsung set isProcessing ke true untuk mencegah scan ganda.
    setIsProcessing(true);
    setLastResult(null);

    let qrDataParsed: { id?: string; name?: string; class?: string } = {};

    try {
      // 3. Validasi Format QR
      try {
        qrDataParsed = JSON.parse(decodedText);
        if (!qrDataParsed.id || !qrDataParsed.name || !qrDataParsed.class) {
          throw new Error("Data QR tidak lengkap (ID, Nama, Kelas wajib ada).");
        }
      } catch (e) {
        // Jika format QR salah, tampilkan error dan mainkan suara error
        const result: ScanResult = {
          id: 'error-format', name: 'QR Tidak Valid', class: 'N/A',
          timestamp: new Date(), success: false, message: 'Format QR Code tidak valid atau tidak lengkap.',
        };
        setLastResult(result);
        setScanMessage("Format QR tidak valid.");
        setMessageType('error');
        errorSoundRef.current?.play();
        // Cooldown singkat agar bisa scan lagi cepat
        setTimeout(() => setIsProcessing(false), 1000);
        return;
      }

      // 4. Kirim Data ke Backend
      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      await api.post('/attendance/scan', {
        qrData: decodedText, date: currentDate, timeIn: currentTime
      });

      // 5. Proses Hasil Sukses
      const result: ScanResult = {
        id: qrDataParsed.id!, name: qrDataParsed.name!, class: qrDataParsed.class!,
        timestamp: new Date(), success: true, message: `Absensi berhasil: ${qrDataParsed.name!}`,
      };
      setLastResult(result);
      setScanResults(prev => [result, ...prev]);
      setScanMessage(`Berhasil: ${qrDataParsed.name}`);
      setMessageType('success');
      successSoundRef.current?.play(); // Mainkan suara berhasil

    } catch (error) {
      // 6. Proses Hasil Gagal (dari backend)
      let msg = 'Gagal mencatat absensi.';
      if (axios.isAxiosError(error) && error.response) {
        msg = error.response.data.message || msg;
      }
      const result: ScanResult = {
        id: qrDataParsed.id || 'error', name: qrDataParsed.name || 'Tidak Dikenal', class: qrDataParsed.class || '-',
        timestamp: new Date(), success: false, message: msg,
      };
      setLastResult(result);
      setScanResults(prev => [result, ...prev]);
      setScanMessage(msg);
      setMessageType('error');
      errorSoundRef.current?.play(); // Mainkan suara error
    } finally {
      // Cooldown singkat agar bisa scan lagi cepat
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000); // Cooldown 1 detik
    }
  };
  // --- END: Logika Inti Pemindaian yang Dimodifikasi ---

  const startScanner = () => {
    if (!hasPermission('mark_attendance')) {
      setScanMessage("Anda tidak memiliki izin untuk menggunakan scanner absensi.");
      setMessageType('error');
      return;
    }
    if (!scannerDivRef.current) {
      setScanMessage("Elemen scanner tidak ditemukan di DOM. Mohon refresh halaman.");
      setMessageType('error');
      return;
    }
    if (scanning) {
      return; // Sudah aktif
    }

    scannerDivRef.current.innerHTML = '';
    const newScanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 30, // FPS bisa diturunkan untuk efisiensi
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false // verbose = false
    );
    scannerRef.current = newScanner;

    try {
      newScanner.render(onScanSuccess, onScanFailure);
      setScanning(true);
      setIsProcessing(false); // Pastikan status proses reset saat memulai
      setScanMessage(null);
      setMessageType(null);
      setLastResult(null);
    } catch (err: any) {
      setScanMessage(`Gagal memulai scanner: ${err.message || 'Periksa izin kamera.'}`);
      setMessageType('error');
      setScanning(false);
    }
  };

  // Komponen Ikon QR (tidak berubah)
  const QrCodeIconComponent = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
  );

  // Render logic untuk akses ditolak (tidak berubah)
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
      {/* Elemen Audio untuk respons suara, tidak terlihat oleh pengguna */}
      <audio ref={successSoundRef} src="/sounds/success.mp3" preload="auto"></audio>
      <audio ref={errorSoundRef} src="/sounds/error.mp3" preload="auto"></audio>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Scanner Absensi QR</h1>
        {scanning ? (
          <button onClick={stopScanner} className="btn bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500">
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
            
            {/* Area Pesan Status */}
            {(scanMessage || lastResult) && (
                <div className={`flex flex-col gap-2 rounded-lg p-4 mb-4 items-center justify-center text-center transition-opacity duration-300 ${isProcessing ? 'opacity-100' : 'opacity-0'}`}>
                    {messageType && (
                      <div className={`rounded-full p-2 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {messageType === 'success' ? <CheckCircle className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
                      </div>
                    )}
                    <h3 className={`font-semibold text-xl ${messageType === 'success' ? 'text-green-800' : 'text-red-800'}`}>{scanMessage}</h3>
                    {lastResult && (
                        <div className="text-gray-700">
                            {lastResult.success ? (
                              <>
                                <p><span className="font-medium">Nama:</span> {lastResult.name}</p>
                                <p><span className="font-medium">Kelas:</span> {lastResult.class}</p>
                              </>
                            ) : (
                              <p className="text-sm">{lastResult.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Waktu: {lastResult.timestamp.toLocaleTimeString('id-ID')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Area Scanner */}
            <div ref={scannerDivRef} id="qr-reader" className="max-w-full"></div>

            {/* Placeholder saat scanner tidak aktif */}
            {!scanning && (
              <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                <QrCodeIconComponent className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Scanner Tidak Aktif</h3>
                <p className="mt-2 text-gray-500 max-w-md">Klik "Mulai Scanner" untuk mengaktifkan kamera dan memindai QR code.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Riwayat Pemindaian (tidak berubah) */}
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
                <button onClick={() => setScanResults([])} className="text-sm text-gray-600 hover:text-gray-900">
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