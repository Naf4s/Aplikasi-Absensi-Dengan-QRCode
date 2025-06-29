import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Ini Wajib Kamu Ingat! (Interface Props untuk StudentFormModal)
// Komponen ini akan menerima data siswa yang akan diedit (jika ada),
// daftar kelas dinamis, status loading, pesan error, dan fungsi untuk submit/close.
interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Student | null; // Data siswa yang akan diedit
  isLoading: boolean;
  formError: string | null; // Error spesifik dari form submit
  classes: ClassItem[]; // Daftar kelas dinamis dari backend
}

// Interface Student (diulang di sini atau bisa di file types global)
interface Student {
    id: string;
    nis: string;
    name: string;
    class: string;
    gender: 'L' | 'P';
    birth_date: string;
    address?: string;
    parent_name?: string;
    phone_number?: string;
    created_at?: string;
    updated_at?: string;
}

// Interface ClassItem (diulang di sini atau bisa di file types global)
interface ClassItem {
    id: string;
    name: string;
    homeroom_teacher_id?: string | null;
    homeroom_teacher_name?: string | null;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ 
  isOpen, onClose, onSubmit, initialData, isLoading, formError, classes
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'created_at' | 'updated_at'>>({
    nis: '', name: '', class: '', gender: 'L', birth_date: '',
    address: '', parent_name: '', phone_number: ''
  });

  // Ini Wajib Kamu Ingat! (useEffect untuk Mengisi Form Saat Edit)
  // Ketika initialData berubah (saat edit), isi formData.
  useEffect(() => {
    if (initialData) {
      setFormData({
        nis: initialData.nis,
        name: initialData.name,
        class: initialData.class,
        gender: initialData.gender,
        birth_date: initialData.birth_date,
        address: initialData.address || '',
        parent_name: initialData.parent_name || '',
        phone_number: initialData.phone_number || ''
      });
    } else {
      // Reset form jika tidak ada initialData (mode tambah)
      setFormData({
        nis: '', name: '', class: '', gender: 'L', birth_date: '',
        address: '', parent_name: '', phone_number: ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // Panggil fungsi onSubmit yang datang dari props
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Siswa' : 'Tambah Siswa Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {formError && ( // Tampilkan error dari form submit
          <div className="p-4 bg-error-50 text-error-700 rounded-md mx-5 mt-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">NIS</label>
              <input
                type="text"
                name="nis"
                required
                value={formData.nis}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kelas</label>
              <select
                name="class"
                required
                value={formData.class}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Pilih Kelas</option>
                {classes.map((classItem) => ( // Gunakan `classes` dari props
                  <option key={classItem.id} value={classItem.name}> 
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <input
                type="date"
                name="birth_date"
                required
                value={formData.birth_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nama Orang Tua</label>
              <input
                type="text"
                name="parent_name"
                value={formData.parent_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Alamat</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose} // Panggil onClose dari props
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-70"
            >
              {isLoading ? 'Memproses...' : (initialData ? 'Simpan Perubahan' : 'Tambah Siswa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
