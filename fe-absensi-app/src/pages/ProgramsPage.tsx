import React from 'react';

const ProgramsPage: React.FC = () => {
  return (
    <div className="container mx-auto pt-20 px-4">
      <h1 className="text-3xl font-bold mb-6">Program Sekolah</h1>
      <div className="min-h-[60vh] flex justify-center items-start px-4">
  <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[450px]">
    <div className="h-48 bg-yellow-600"></div>
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Pramuka</h2>
      <p className="text-gray-600">
        Kegiatan Pramuka membentuk karakter, kedisiplinan, dan semangat gotong royong siswa melalui kegiatan luar kelas yang mendidik.
      </p>
    </div>
  </div>
</div>
    </div>
  );
};

export default ProgramsPage;