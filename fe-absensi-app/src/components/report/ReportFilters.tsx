import React from 'react';
import { Filter } from 'lucide-react';

interface ReportFiltersProps {
  filterClass: string;
  setFilterClass: (value: string) => void;
  filterMonthYear: string;
  setFilterMonthYear: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterSearchTerm: string;
  setFilterSearchTerm: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  classList: string[];
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filterClass,
  setFilterClass,
  filterMonthYear,
  setFilterMonthYear,
  filterStatus,
  setFilterStatus,
  filterSearchTerm,
  setFilterSearchTerm,
  onApplyFilters,
  onResetFilters,
  classList
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label htmlFor="filterClass" className="form-label">Filter Kelas</label>
        <select
          id="filterClass"
          className="form-input"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          <option value="">Semua Kelas</option>
          {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="filterMonthYear" className="form-label">Filter Bulan & Tahun</label>
        <input
          type="month"
          id="filterMonthYear"
          className="form-input"
          value={filterMonthYear}
          onChange={(e) => setFilterMonthYear(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="filterStatus" className="form-label">Filter Status</label>
        <select
          id="filterStatus"
          className="form-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="present">Hadir</option>
          <option value="absent">Tanpa Keterangan</option>
          <option value="sick">Sakit</option>
          <option value="permit">Izin</option>
        </select>
      </div>
      <div>
        <label htmlFor="filterSearch" className="form-label">Cari Nama/NIS</label>
        <input
          type="text"
          id="filterSearch"
          className="form-input"
          placeholder="Cari siswa..."
          value={filterSearchTerm}
          onChange={(e) => setFilterSearchTerm(e.target.value)}
        />
      </div>
      <div className="md:col-span-4 flex justify-end space-x-2">
        <button onClick={onResetFilters} className="btn-outline">
          Reset Filter
        </button>
        <button onClick={onApplyFilters} className="btn-primary flex items-center">
          <Filter className="h-4 w-4 mr-1" />
          Terapkan Filter
        </button>
      </div>
    </div>
  );
};

export default ReportFilters; 