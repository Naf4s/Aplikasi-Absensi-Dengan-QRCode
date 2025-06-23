import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ScanResult {
  id: string;
  name: string;
  class: string;
  timestamp: Date;
  success: boolean;
  message: string;
}

const ScannerPage: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    if (scannerDivRef.current) {
      // Clear the div content
      scannerDivRef.current.innerHTML = '';
      
      // Create and render the scanner
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.0,
          disableFlip: false,
        },
        false
      );
      
      scannerRef.current.render(onScanSuccess, onScanFailure);
      setScanning(true);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setScanning(false);
    }
  };

  const resetScanner = () => {
    stopScanner();
    startScanner();
  };

  const onScanSuccess = (decodedText: string) => {
    try {
      const studentData = JSON.parse(decodedText);
      
      // Create a result object
      const result: ScanResult = {
        id: studentData.id,
        name: studentData.name,
        class: studentData.class,
        timestamp: new Date(),
        success: true,
        message: 'Absensi berhasil dicatat',
      };
      
      // Add to results array
      setScanResults(prev => [result, ...prev]);
      setLastResult(result);
      
      // Pause scanner for 3 seconds to show result
      stopScanner();
      setTimeout(() => {
        startScanner();
      }, 3000);
      
    } catch (error) {
      const result: ScanResult = {
        id: 'error',
        name: 'Unknown',
        class: 'Unknown',
        timestamp: new Date(),
        success: false,
        message: 'Format QR tidak valid',
      };
      
      setScanResults(prev => [result, ...prev]);
      setLastResult(result);
    }
  };

  const onScanFailure = (error: string) => {
    // Only handle non-empty errors to avoid cluttering the console
    if (error && error !== 'QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.') {
      console.error('QR scan error:', error);
    }
  };

  // Sample QR code data for testing
  const sampleQRData = JSON.stringify({
    id: '12345',
    name: 'Budi Santoso',
    class: '5A',
  });

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
            
            {!scanning && !lastResult && (
              <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <QrCode className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Scanner QR Tidak Aktif</h3>
                <p className="mt-2 text-gray-500 max-w-md">
                  Klik tombol "Mulai Scanner" untuk memulai pemindaian kode QR absensi siswa.
                </p>
              </div>
            )}
            
            {lastResult && !scanning && (
              <div className={`rounded-lg p-6 mb-4 flex items-center ${
                lastResult.success ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
              }`}>
                {lastResult.success ? (
                  <CheckCircle className="h-8 w-8 mr-4" />
                ) : (
                  <XCircle className="h-8 w-8 mr-4" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{lastResult.success ? 'Absensi Berhasil!' : 'Gagal Memindai'}</h3>
                  {lastResult.success ? (
                    <div>
                      <p><span className="font-medium">Nama:</span> {lastResult.name}</p>
                      <p><span className="font-medium">Kelas:</span> {lastResult.class}</p>
                      <p><span className="font-medium">Waktu:</span> {lastResult.timestamp.toLocaleTimeString('id-ID')}</p>
                    </div>
                  ) : (
                    <p>{lastResult.message}</p>
                  )}
                </div>
              </div>
            )}
            
            <div ref={scannerDivRef} id="qr-reader" className="max-w-full"></div>
            
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
            
            {/* Sample QR data for testing */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700">Untuk Demo:</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Gunakan data QR code berikut untuk simulasi absensi.
              </p>
              <div className="bg-gray-100 p-3 rounded-md">
                <code className="text-xs break-all">{sampleQRData}</code>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Scans */}
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

// Import QR code icon since it's a custom component
const QrCode = ({ className }: { className?: string }) => (
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

export default ScannerPage;