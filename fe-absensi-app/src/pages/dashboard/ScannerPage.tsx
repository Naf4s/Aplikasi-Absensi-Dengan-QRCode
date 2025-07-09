import React, { useState, useEffect, useRef } from 'react'; 
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; 
import api from '../../lib/api';
import axios from 'axios';

// Interface untuk riwayat pemindaian
interface ScanHistoryEntry {
  studentName: string;
  studentClass: string;
  timestamp: string;
  status: 'success' | 'failed';
  message: string;
}

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

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Gagal membersihkan html5QrcodeScanner:", err));
      }
    };
  }, []); 

  // --- START: Deklarasi fungsi-fungsi kontrol scanner ---
  // Didefinisikan tanpa useCallback agar tidak ada masalah circular dependency dan initialization.

  const stopScanner = () => {
    console.log('>>> stopScanner() dipanggil <<<');
    if (scannerRef.current) {
      scannerRef.current.clear()
        .then(() => { // .then() ini adalah Promise dari clear(), bukan render()
          console.log('stopScanner: Scanner berhasil dihentikan.');
          setScanning(false);
          setScanMessage(null);
          setMessageType(null);
          setLastResult(null);
        })
        .catch(err => console.error("stopScanner: Gagal menghentikan html5QrcodeScanner:", err));
    } else {
      console.log('stopScanner: Scanner tidak aktif atau tidak ada instance.');
      setScanning(false);
    }
  };

  const onScanFailure = (error: string) => {
    // Ini Wajib Kamu Ingat! (Error Handling onScanFailure)
    // Jika scanner gagal, kita perlu memberi tahu user.
    if (error && error.includes("NotAllowedError") || error.includes("Permission denied")) {
      setScanMessage("Akses kamera ditolak. Izinkan akses kamera di pengaturan browser Anda.");
      setMessageType('error');
    } else if (error && error.includes("NotFoundError")) {
      setScanMessage("Tidak ada kamera ditemukan. Pastikan kamera terpasang dan berfungsi.");
      setMessageType('error');
    } else if (error && !error.includes("No MultiFormat Readers")) { // Filter error yang terlalu umum
       setScanMessage(`Terjadi masalah scanner: ${error}`);
       setMessageType('error');
    }
    setScanning(false); // Pastikan state scanning false jika gagal
    console.error('onScanFailure:', error); // Log error asli dari scanner
  };

  const onScanSuccess = async (decodedText: string) => {
    console.log('onScanSuccess dipanggil dengan:', decodedText);
    stopScanner(); 

    setLastResult(null);

    let qrDataParsed: { id?: string; name?: string; class?: string } = {};

    try {
      try {
        qrDataParsed = JSON.parse(decodedText);
        if (!qrDataParsed.id || !qrDataParsed.name || !qrDataParsed.class) {
          throw new Error("Data QR tidak lengkap (ID, Nama, Kelas wajib ada).");
        }
      } catch (e) {
        console.error('Error parsing QR data:', e);
        const result: ScanResult = {
          id: 'error-format',
          name: 'QR Tidak Valid',
          class: 'N/A',
          timestamp: new Date(),
          success: false,
          message: 'Format QR Code tidak valid atau tidak lengkap.',
        };
        setLastResult(result);
        setScanResults(prev => [result, ...prev]);
        setScanMessage("Gagal mencatat absensi: Format QR tidak valid.");
        setMessageType('error');
        return;
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      console.log('Mengirim data absensi ke backend:', { qrData: decodedText, date: currentDate, timeIn: currentTime });
      const response = await api.post('/attendance/scan', {
        qrData: decodedText,
        date: currentDate,
        timeIn: currentTime
      });

      console.log('Respons backend:', response.data);
      const result: ScanResult = {
        id: qrDataParsed.id!,
        name: qrDataParsed.name!,
        class: qrDataParsed.class!,
        timestamp: new Date(),
        success: true,
        message: `Absensi berhasil dicatat untuk ${qrDataParsed.name} Kelas ${qrDataParsed.class}.`,
      };
      setLastResult(result);
      setScanResults(prev => [result, ...prev]);
      setScanMessage(`Absensi berhasil dicatat untuk ${qrDataParsed.name} Kelas ${qrDataParsed.class}.`);
      setMessageType('success');

    } catch (error) {
      console.error('Error selama pencatatan absensi:', error);
      let msg = 'Terjadi kesalahan saat mencatat absensi.';
      if (axios.isAxiosError(error) && error.response) {
        msg = error.response.data.message || msg;
      }
      const result: ScanResult = {
        id: qrDataParsed.id || 'error',
        name: qrDataParsed.name || 'Tidak Dikenal',
        class: qrDataParsed.class || '-',
        timestamp: new Date(),
        success: false,
        message: msg,
      };
      setLastResult(result);
      setScanResults(prev => [result, ...prev]);
      setScanMessage(msg);
      setMessageType('error');
    } finally {
        console.log('Selesai proses scan, mencoba restart scanner otomatis...');
        setTimeout(() => {
            if (!scanning) {
                startScanner(); 
            } else {
                console.log('Scanner sudah aktif, tidak perlu restart.');
            }
        }, 3000);
    }
  };

  const startScanner = () => {
    console.log('>>> startScanner() dipanggil <<<');

    if (!hasPermission('mark_attendance')) {
      console.log('startScanner: Izin "mark_attendance" tidak dimiliki.');
      setScanMessage("Anda tidak memiliki izin untuk menggunakan scanner absensi.");
      setMessageType('error');
      return;
    }
    console.log('startScanner: Izin "mark_attendance" dimiliki.');

    if (!scannerDivRef.current) {
      console.log('startScanner: scannerDivRef.current TIDAK tersedia.');
      setScanMessage("Elemen scanner tidak ditemukan di DOM. Mohon refresh halaman.");
      setMessageType('error');
      return;
    }
    console.log('startScanner: scannerDivRef.current tersedia:', scannerDivRef.current);

    if (scanning) {
        console.log('startScanner: Scanner sudah aktif, tidak perlu memulai lagi.');
        return;
    }
    console.log('startScanner: Scanner belum aktif, akan memulai.');

    scannerDivRef.current.innerHTML = '';
    
    // Ini Wajib Kamu Ingat! (Inisialisasi html5-qrcode)
    // Instansiasi scanner baru setiap kali start.
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 30,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );
    
    console.log('startScanner: Mencoba merender scanner...');
    // PERBAIKAN UTAMA: Panggil render() tanpa .then().catch() karena tidak mengembalikan Promise.
    // Error handling untuk render() dilakukan melalui try-catch sinkronus di sini
    // dan onScanFailure untuk error asinkronus dari html5-qrcode.
    try {
      scannerRef.current.render(onScanSuccess, onScanFailure);
      console.log('startScanner: Scanner berhasil dirender.');
      setScanning(true); // Set state scanning menjadi true
      setScanMessage(null);
      setMessageType(null);
      setLastResult(null);
    } catch (err: any) { // Tangkap error synchronous yang mungkin dilempar oleh render()
      console.error('startScanner: Gagal merender scanner (synchronous error):', err);
      setScanMessage(`Gagal memulai scanner: ${err.message || 'Periksa izin kamera.'}`);
      setMessageType('error');
      setScanning(false);
    }
  };

  const resetScanner = () => {
    console.log('>>> resetScanner() dipanggil <<<');
    stopScanner(); 
    setTimeout(() => { 
      startScanner(); 
    }, 500); 
  };

  // --- END: Deklarasi fungsi-fungsi kontrol scanner ---


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
        {/* Scanner */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Scanner QR Code</h2>
            
            {(scanMessage || (lastResult && !scanning)) && (
                <div className="flex flex-col gap-2 rounded-lg p-6 mb-4 items-center justify-center text-center">
                    <div className={`rounded-full p-2 ${messageType === 'success' ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
                        {messageType === 'success' ? <CheckCircle className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
                    </div>
                    <h3 className={`font-semibold text-xl ${messageType === 'success' ? 'text-success-800' : 'text-error-800'}`}>{scanMessage}</h3>
                    {lastResult && lastResult.success && (
                        <div className="text-gray-700">
                            <p><span className="font-medium">Nama:</span> {lastResult.name}</p>
                            <p><span className="font-medium">Kelas:</span> {lastResult.class}</p>
                            <p><span className="font-medium">Waktu:</span> {lastResult.timestamp.toLocaleTimeString('id-ID')}</p>
                        </div>
                    )}
                    {lastResult && !lastResult.success && (
                        <p className="text-gray-700">{lastResult.message}</p>
                    )}
                </div>
            )}

            <div 
                ref={scannerDivRef} 
                id="qr-reader" 
                className="max-w-full" // Always visible to avoid zero width/height issue
            ></div>

            {!scanning && ( // Hanya tampilkan placeholder jika scanner TIDAK aktif
              <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <QrCodeIconComponent className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Scanner QR Tidak Aktif</h3>
                <p className="mt-2 text-gray-500 max-w-md">
                  Klik tombol "Mulai Scanner" untuk memulai pemindaian kode QR absensi siswa.
                </p>
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700">Untuk Demo:</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    Gunakan data QR code berikut untuk simulasi absensi.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <code className="text-xs break-all">
                      [QR CODE DARI SISWA YANG SUDAH KAMU TAMBAHKAN, MISALNYA: {JSON.stringify({"id":"UUID_SISWA","nis":"12345","name":"Nama Siswa","class":"Kelas A"})}]
                    </code>
                    <p className="mt-2">Pastikan kamu menghasilkan QR code dari siswa yang *sudah ada di database*.</p>
                  </div>
                </div>
              </div>
            )}
            
            {scanning && ( // Tampilkan reset scanner jika aktif
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