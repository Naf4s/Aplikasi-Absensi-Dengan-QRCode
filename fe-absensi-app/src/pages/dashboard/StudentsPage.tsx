import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, QrCode, Download, X, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // Import uuid untuk ID unik

// Definisikan interface Student secara manual karena tidak lagi dari Supabase
interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  gender: 'L' | 'P'; // Laki-laki atau Perempuan
  birth_date: string; // Format YYYY-MM-DD
  address?: string;
  parent_name?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

const StudentsPage = () => {
  const { user, hasPermission } = useAuth(); // Ambil hasPermission juga
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State untuk modal konfirmasi
  const [studentToDeleteId, setStudentToDeleteId] = useState<string | null>(null); // ID siswa yang akan dihapus


  const [formData, setFormData] = useState<Omit<Student, 'id' | 'created_at' | 'updated_at'>>({
    nis: '',
    name: '',
    class: '',
    gender: 'L',
    birth_date: '',
    address: '',
    parent_name: '',
    phone_number: ''
  });

  const classList = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];

  // Mock data untuk demo
  const mockStudents: Student[] = [
    { id: 'mock-1', nis: '001', name: 'Budi Santoso', class: '1A', gender: 'L', birth_date: '2015-01-15', address: 'Jl. Melati No. 1', parent_name: 'Pak Santoso', phone_number: '081234567890' },
    { id: 'mock-2', nis: '002', name: 'Siti Aminah', class: '2B', gender: 'P', birth_date: '2014-03-20', address: 'Jl. Dahlia No. 5', parent_name: 'Ibu Aminah', phone_number: '081298765432' },
    { id: 'mock-3', nis: '003', name: 'Agus Salim', class: '3A', gender: 'L', birth_date: '2013-07-01', address: 'Jl. Cemara No. 10', parent_name: 'Pak Salim', phone_number: '081311223344' },
    { id: 'mock-4', nis: '004', name: 'Dewi Lestari', class: '4B', gender: 'P', birth_date: '2012-09-25', address: 'Jl. Anggrek No. 15', parent_name: 'Ibu Lestari', phone_number: '081555667788' },
  ];

  useEffect(() => {
    // Simulasi loading data dari BE
    const timer = setTimeout(() => {
      setStudents(mockStudents);
      setIsLoading(false);
    }, 1000); // Simulasi delay 1 detik
    return () => clearTimeout(timer);
  }, []);

  const loadStudents = async () => {
    // INI YANG DIGANTI: Tidak ada lagi panggilan supabase
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulasi API call
    setStudents(mockStudents); // Gunakan mock data untuk demo
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulasi API call

      if (selectedStudent) {
        // Update existing student (mock)
        setStudents(prevStudents =>
          prevStudents.map(s =>
            s.id === selectedStudent.id ? { ...s, ...formData } : s
          )
        );
      } else {
        // Add new student (mock)
        const newStudent: Student = {
          id: uuidv4(), // Generate unique ID
          created_at: new Date().toISOString(),
          ...formData
        };
        setStudents(prevStudents => [...prevStudents, newStudent]);
      }
      
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving student');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nis: '',
      name: '',
      class: '',
      gender: 'L',
      birth_date: '',
      address: '',
      parent_name: '',
      phone_number: ''
    });
    setSelectedStudent(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      nis: student.nis,
      name: student.name,
      class: student.class,
      gender: student.gender,
      birth_date: student.birth_date,
      address: student.address || '',
      parent_name: student.parent_name || '',
      phone_number: student.phone_number || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (studentToDeleteId) {
      try {
        setError(null);
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulasi API call
        
        // Hapus student dari state (mock)
        setStudents(prevStudents => prevStudents.filter(s => s.id !== studentToDeleteId));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error deleting student');
      } finally {
        setIsLoading(false);
        setShowConfirmModal(false);
        setStudentToDeleteId(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setStudentToDeleteId(null);
  };


  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nis.includes(searchTerm)
  );

  const generateQRData = (student: Student) => {
    // Pastikan student tidak null atau undefined sebelum mengakses propertinya
    if (!student) return '';
    return JSON.stringify({
      id: student.id,
      nis: student.nis,
      name: student.name,
      class: student.class
    });
  };

  const downloadQR = (studentId: string) => {
    const canvas = document.getElementById(`qr-${studentId}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${studentId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Periksa permission sebelum merender konten
  if (!hasPermission('manage_students')) { // Sesuaikan permission jika perlu
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-600">
        <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk melihat halaman ini.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Siswa</h1>
        {hasPermission('manage_students') && ( // Hanya tampilkan tombol jika user punya izin
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Tambah Siswa
          </button>
        )}
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-lg shadow px-4 py-2">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari siswa berdasarkan nama atau NIS..."
          className="ml-2 flex-1 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIS
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Kelamin
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Lahir
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Orang Tua
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data siswa.
                  </td>
                </tr>
              )}
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.nis}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.birth_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.parent_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {hasPermission('manage_students') && (
                        <>
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student.id)} // Ganti ke handleDeleteClick
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {hasPermission('generate_qr') && ( // Hanya tampilkan tombol jika user punya izin
                        <button
                          onClick={() => setShowQR(student.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <QrCode className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Student Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

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
                    {classList.map((className) => (
                      <option key={className} value={className}>
                        {className}
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
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {selectedStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">QR Code Siswa</h2>
              <button
                onClick={() => setShowQR(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center">
              {showQR && (
                <>
                  <QRCodeSVG
                    id={`qr-${showQR}`}
                    value={generateQRData(students.find(s => s.id === showQR)!)}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                  <button
                    onClick={() => downloadQR(showQR)}
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
      )}

      {/* Confirmation Modal for Delete */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700">Apakah Anda yakin ingin menghapus data siswa ini?</p>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;