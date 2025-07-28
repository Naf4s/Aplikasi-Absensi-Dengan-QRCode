import React, { useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

// Ini Wajib Kamu Ingat! (Interface Props untuk StudentQrModal)
interface StudentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: { 
    id: string;
    nis: string;
    name: string;
    class: string;
  } | null; 
  onError: (message: string) => void; 
}

const StudentQrModal: React.FC<StudentQrModalProps> = ({ isOpen, onClose, student, onError }) => {
  if (!isOpen || !student) return null; 

  const generateQRData = (studentData: { id: string; nis: string; name: string; class: string }) => {
    return JSON.stringify({
      id: studentData.id,
      nis: studentData.nis,
      name: studentData.name,
      class: studentData.class
    });
  };

  const downloadQR = useCallback(() => { 
    setTimeout(() => {
      const canvas = document.getElementById(`qr-${student.id}`) as HTMLCanvasElement;
      if (canvas) {
        try {
          console.log(`[DOWNLOAD QR] Canvas ditemukan untuk ID: ${student.id}`, canvas);
          
          if (canvas.width === 0 || canvas.height === 0) {
              console.error(`[DOWNLOAD QR] Canvas ID ${student.id} memiliki dimensi nol. Tidak dapat mengunduh.`);
              onError("Gagal mengunduh QR Code: Gambar tidak terbentuk sempurna. Coba lagi."); 
              return;
          }

          const pngUrl = canvas.toDataURL("image/png"); 
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `qr-${student.id}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          console.log(`[DOWNLOAD QR] QR Code untuk ID ${student.id} berhasil dipicu unduhan.`);
        } catch (error: any) {
          console.error("[DOWNLOAD QR] Error generating QR code image or downloading:", error);
          onError("Gagal mengunduh QR Code. Pastikan browser mengizinkan unduhan pop-up."); 
        }
      } else {
        onError("Elemen QR Code tidak ditemukan untuk diunduh."); 
        console.error(`[DOWNLOAD QR] Elemen canvas dengan ID qr-${student.id} tidak ditemukan.`);
      }
    }, 700); 
  }, [student, onError]); 


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-900">QR Code Siswa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          {student && ( 
            <>
              <QRCodeCanvas
                id={`qr-${student.id}`} 
                value={generateQRData(student)}
                size={256}
                level="H"
                includeMargin={true}
              />
              <button
                onClick={downloadQR}
                className="mt-4 flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Download className="h-5 w-5 mr-2" />
                Download QR Code
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQrModal;
