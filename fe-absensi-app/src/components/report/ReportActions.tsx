import React from 'react';
import { Download, Printer } from 'lucide-react';

interface ReportActionsProps {
  onExportExcel: () => void;
  onPrintReport: () => void;
}

const ReportActions: React.FC<ReportActionsProps> = ({ 
  onExportExcel, 
  onPrintReport 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button onClick={onExportExcel} className="btn-outline flex items-center">
        <Download className="h-5 w-5 mr-1" />
        Unduh Laporan (Excel)
      </button>
      <button onClick={onPrintReport} className="btn-outline flex items-center">
        <Printer className="h-5 w-5 mr-1" />
        Cetak
      </button>
    </div>
  );
};

export default ReportActions; 