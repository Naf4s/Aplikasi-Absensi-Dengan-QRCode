import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PromoteStudentsForm from '../../components/students/PromoteStudentsForm';
import api from '../../lib/api';
import axios from 'axios';

interface ClassItem {
  id: string;
  name: string;
  homeroom_teacher_id?: string | null;
  homeroom_teacher_name?: string | null;
}

const PromotionSettingsPage: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');


  const fetchInitialData = useCallback(async () => {
    setPageError(null);
    try {
      const settingsRes = await api.get('/settings');
      const settings = settingsRes.data;
      const academicYear = settings.find((s: any) => s.key === 'current_academic_year')?.value || '';


      setCurrentAcademicYear(academicYear);


      const classRes = await api.get('/classes');
      setClasses(classRes.data || []);
      setPageMessage(null);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      let msg = 'Failed to load settings data.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setPageError(msg);
    }
  }, []);

  useEffect(() => {
    if (hasPermission('manage_classes')) {
      fetchInitialData();
    } else {
      setPageError('You do not have permission to view this page.');
    }
  }, [hasPermission, fetchInitialData]);

  const handleSuccess = useCallback((message: string) => {
    setPageMessage(message);
    setPageError(null);
    fetchInitialData();
  }, [fetchInitialData]);

  const handleError = useCallback((message: string) => {
    setPageError(message);
    setPageMessage(null);
  }, []);

  if (!hasPermission('manage_classes') && currentUser?.role !== 'admin') {
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
        onClose={() => {}}
        onSuccess={handleSuccess}
        onError={handleError}
        classes={classes}
        currentAcademicYear={currentAcademicYear}
      />
    </div>
  );
};

export default PromotionSettingsPage;
