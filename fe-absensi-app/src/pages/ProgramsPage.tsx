import React from 'react';

const ProgramsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Our Programs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-blue-600"></div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Academic Excellence</h2>
            <p className="text-gray-600">Our rigorous academic program prepares students for success in higher education and beyond.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-green-600"></div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Arts & Culture</h2>
            <p className="text-gray-600">We encourage creativity and expression through comprehensive arts education.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-red-600"></div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Athletics</h2>
            <p className="text-gray-600">Our sports programs build teamwork, discipline, and physical fitness.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramsPage;