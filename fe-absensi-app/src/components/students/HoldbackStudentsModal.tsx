import React, { useState, useMemo, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface HoldbackStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (heldBackStudentIds: string[]) => void;
  allStudents: Student[];
  classes: ClassItem[];
  initialHeldBackIds: string[];
}

const HoldbackStudentsModal: React.FC<HoldbackStudentsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  allStudents,
  classes,
  initialHeldBackIds,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    setSelectedIds(new Set(initialHeldBackIds));
  }, [initialHeldBackIds, isOpen]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const searchMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.nis.includes(searchTerm);
      const classMatch = filterClass ? student.class === filterClass : true;
      return searchMatch && classMatch;
    });
  }, [allStudents, searchTerm, filterClass]);

  const handleToggleStudent = (studentId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selectedIds));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-900">Pilih Siswa yang Tidak Naik Kelas</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari Nama atau NIS..."
                value={searchTerm}
                onChange