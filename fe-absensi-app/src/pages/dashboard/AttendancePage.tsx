import React, { useState } from 'react';
import { Calendar, Clock, Download, Filter, Search, Users, RefreshCw, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
// Mock data
const classList = [
  { id: '1', name: '1A', teacherName: 'Sri Wahyuni, S.Pd.' },
  { id: '2', name: '1B', teacherName: 'Ahmad Prasetyo, S.Pd.' },
  { id: '3', name: '2A', teacherName: 'Rina Hastuti, S.Pd.' },
  { id: '4', name: '2B', teacherName: 'Doni Prasetya, S.Pd.' },
  { id: '5', name: '3A', teacherName: 'Fajar Wibowo, S.Pd.' },
  { id: '6', name: '3B', teacherName: 'Sari Indah, S.Pd.' },
];

interface Student {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'sick' | 'permit' | 'none';
  timeIn?: string;
  notes?: string;
}

// Generate mock students data
const generateMockStudents = (classId: string): Student[] => {
  const numberOfStudents = 10 + Math.floor(Math.random() * 15); // 10-25 students
  const students: Student[] = [];
  
  for (let i = 1; i <= numberOfStudents; i++) {
    // Names based on common Indonesian names
    const firstNames = ['Agus', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hasan', 'Indah', 'Joko'];
    const lastNames = ['Santoso', 'Wijaya', 'Kusuma', 'Sari', 'Putra', 'Pratama', 'Saputra', 'Hidayat', 'Nugraha', 'Permadi'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    const studentId = `S${classId}${i.toString().padStart(2, '0')}`;
    
    // Generate random status with higher probability for 'present'
    const statusRoll = Math.random();
    let status: Student['status'] = 'none';
    if (statusRoll < 0.8) {
      status = 'present';
    } else if (statusRoll < 0.85) {
      status = 'absent';
    } else if (statusRoll < 0.95) {
      status = 'sick';
    } else {
      status = 'permit';
    }
    
    const timeIn = status === 'present' ? 
      `07:${Math.floor(10 + Math.random() * 20)}` : 
      undefined;
    
    students.push({
      id: studentId,
      name: `${firstName} ${lastName}`,
      status,
      timeIn,
      notes: status === 'sick' ? 'Demam' : 
             status === 'permit' ? 'Urusan keluarga' : 
             undefined
    });
  }
  
  return students;
};

const AttendancePage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'list' | 'qr'>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Load students when class is selected
  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setStudents(generateMockStudents(classId));
  };

  // Generate student QR code data
  const generateStudentQRData = (student: Student) => {
    const selectedClassData = classList.find(c => c.id === selectedClass);
    return JSON.stringify({
      id: student.id,
      name: student.name,
      class: selectedClassData?.name || '',
    });
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update student status
  const updateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId 
          ? { 
              ...student, 
              status, 
              timeIn: status === 'present' ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : undefined
            } 
          : student
      )
    );
  };

  // Get status badge class
  const getStatusBadgeClass = (status: Student['status']) => {
    switch (status) {
      case 'present':
        return 'bg-success-100 text-success-700';
      case 'absent':
        return 'bg-error-100 text-error-700';
      case 'sick':
        return 'bg-warning-100 text-warning-700';
      case 'permit':
        return 'bg-accent-100 text-accent-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Absensi Siswa</h1>
        
        <div className="flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {selectedClass && (
            <button
              onClick={() => setActiveTab(activeTab === 'list' ? 'qr' : 'list')}
              className="btn-primary"
            >
              {activeTab === 'list' ? 'Mode QR Code' : 'Mode Daftar'}
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Class List */}
        <div className="md:col-span-1">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Daftar Kelas</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {classList.map((classItem) => (
                <button
                  key={classItem.id}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                    selectedClass === classItem.id ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => handleClassSelect(classItem.id)}
                >
                  <div className="font-medium text-gray-900">Kelas {classItem.name}</div>
                  <div className="text-sm text-gray-500">{classItem.teacherName}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Student List or QR Code */}
        <div className="md:col-span-3">
          {!selectedClass ? (
            <div className="card p-6 flex flex-col items-center justify-center text-center h-full">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Kelas</h3>
              <p className="text-gray-500">
                Silakan pilih kelas dari daftar untuk melihat dan mengelola absensi siswa.
              </p>
            </div>
          ) : activeTab === 'list' ? (
            <div className="card overflow-hidden">
              <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Siswa Kelas {classList.find(c => c.id === selectedClass)?.name}
                </h2>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Filter className="h-5 w-5" />
                  </button>
                  
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <Download className="h-5 w-5" />
                  </button>
                  
                  <button 
                    className="p-1 text-gray-500 hover:text-gray-700"
                    onClick={() => setStudents(generateMockStudents(selectedClass))}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Siswa
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jam Masuk
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keterangan
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(student.status)}`}>
                            {student.status === 'present' ? 'Hadir' : 
                             student.status === 'absent' ? 'Tanpa Keterangan' : 
                             student.status === 'sick' ? 'Sakit' : 
                             student.status === 'permit' ? 'Izin' : 'Belum Absen'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.timeIn || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => updateStudentStatus(student.id, 'present')}
                              className={`px-2 py-1 text-xs rounded ${student.status === 'present' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700 hover:bg-success-50 hover:text-success-700'}`}
                            >
                              H
                            </button>
                            <button 
                              onClick={() => updateStudentStatus(student.id, 'absent')}
                              className={`px-2 py-1 text-xs rounded ${student.status === 'absent' ? 'bg-error-100 text-error-700' : 'bg-gray-100 text-gray-700 hover:bg-error-50 hover:text-error-700'}`}
                            >
                              A
                            </button>
                            <button 
                              onClick={() => updateStudentStatus(student.id, 'sick')}
                              className={`px-2 py-1 text-xs rounded ${student.status === 'sick' ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-gray-700 hover:bg-warning-50 hover:text-warning-700'}`}
                            >
                              S
                            </button>
                            <button 
                              onClick={() => updateStudentStatus(student.id, 'permit')}
                              className={`px-2 py-1 text-xs rounded ${student.status === 'permit' ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-700 hover:bg-accent-50 hover:text-accent-700'}`}
                            >
                              I
                            </button>
                            <button 
                              onClick={() => setSelectedStudent(student)}
                              className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-700 hover:bg-primary-200"
                            >
                              QR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Menampilkan {filteredStudents.length} dari {students.length} siswa
                </div>
                
                <div className="flex space-x-2 text-sm">
                  <span className="text-success-700 bg-success-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-success-500 mr-1"></div>
                    Hadir: {students.filter(s => s.status === 'present').length}
                  </span>
                  <span className="text-error-700 bg-error-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-error-500 mr-1"></div>
                    Tanpa Keterangan: {students.filter(s => s.status === 'absent').length}
                  </span>
                  <span className="text-warning-700 bg-warning-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-warning-500 mr-1"></div>
                    Sakit: {students.filter(s => s.status === 'sick').length}
                  </span>
                  <span className="text-accent-700 bg-accent-50 px-2 py-1 rounded-md flex items-center">
                    <div className="h-2 w-2 rounded-full bg-accent-500 mr-1"></div>
                    Izin: {students.filter(s => s.status === 'permit').length}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="p-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Mode QR Code - Kelas {classList.find(c => c.id === selectedClass)?.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih siswa untuk menampilkan QR Code absensi
                </p>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition ${
                      selectedStudent?.id === student.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">ID: {student.id}</div>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(student.status)}`}>
                        {student.status === 'present' ? 'Hadir' : 
                         student.status === 'absent' ? 'Tanpa Keterangan' : 
                         student.status === 'sick' ? 'Sakit' : 
                         student.status === 'permit' ? 'Izin' : 'Belum Absen'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* QR Code Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">QR Code Absensi</h3>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
                  <QRCodeSVG 
                    value={generateStudentQRData(selectedStudent)}
                    size={200}
                    level="H"
                    includeMargin={true}
                    renderAs="svg"
                  />
                </div>
                
                <div className="text-center mb-6">
                  <div className="font-semibold text-lg">{selectedStudent.name}</div>
                  <div className="text-gray-500">ID: {selectedStudent.id}</div>
                  <div className="text-gray-500">Kelas: {classList.find(c => c.id === selectedClass)?.name}</div>
                </div>
                
                <div className="w-full bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date().toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-2">Status:</span>
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedStudent.status)}`}>
                      {selectedStudent.status === 'present' ? 'Hadir' : 
                       selectedStudent.status === 'absent' ? 'Tanpa Keterangan' : 
                       selectedStudent.status === 'sick' ? 'Sakit' : 
                       selectedStudent.status === 'permit' ? 'Izin' : 'Belum Absen'}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="btn-outline"
                    onClick={() => setSelectedStudent(null)}
                  >
                    Tutup
                  </button>
                  <button className="btn-primary">
                    Unduh QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;