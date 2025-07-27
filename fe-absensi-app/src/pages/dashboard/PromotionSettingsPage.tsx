import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PromoteStudentsForm from '../../components/students/PromoteStudentsForm';

const PromotionSettingsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  const handleSuccess = useCallback((message: string) => {
    setPageMessage(message);
    setPageError(null);
  }, []);

  const handleError = useCallback((message: string) => {
    setPageError(message);
    setPageMessage(null);
  }, []);

  // Izin untuk mengakses halaman ini adalah 'manage_classes'
  if (!hasPermission('manage_classes')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p>You do not have permission to view this promotion page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Student Promotion</h1>

      {pageError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageError}</span>
        </div>
      )}

      {pageMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{pageMessage}</span>
        </div>
      )}

      <PromoteStudentsForm
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
};

export default PromotionSettingsPage;
