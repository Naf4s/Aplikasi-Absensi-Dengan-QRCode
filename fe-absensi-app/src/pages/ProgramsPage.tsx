import React, { useEffect, useState } from 'react';
import api from '../lib/api';

interface ProgramItems {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const ExpandableText: React.FC<{ content: string; onReadMore: () => void }> = ({ content, onReadMore }) => {
  const words = content.split(' ');
  const preview = words.slice(0, 8).join(' ');

  return (
    <p className="text-gray-700 mb-4 max-h-20 overflow-hidden text-ellipsis">
      {preview + (words.length > 8 ? '...' : '')}
      {words.length > 8 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore();
          }}
          className="text-blue-600 ml-2 underline"
          type="button"
        >
          Read More
        </button>
      )}
    </p>
  );
};

const ProgramsPage: React.FC = () => {
  const [programsList, setProgramsList] = useState<ProgramItems[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramItems | null>(null);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/programs');
      setProgramsList(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch programs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const closeModal = () => {
    setSelectedProgram(null);
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-20">
      <h1 className="text-3xl font-bold text-center mb-8">Program Sekolah</h1>

      {loading ? (
        <p className="text-center text-gray-600 text-lg">Loading Content...</p>
      ) : error ? (
        programsList.length === 0 ? null : <p className="text-center text-red-600 font-semibold">{error}</p>
      ) : programsList.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">Tidak ada program tersedia.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programsList.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => setSelectedProgram(program)}
              >
                {program.imageUrl && (
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{program.title}</h2>
                  <ExpandableText content={program.content} onReadMore={() => setSelectedProgram(program)} />
                </div>
              </div>
            ))}
          </div>

          {selectedProgram && (
            <div
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeModal();
                }
              }}
            >
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                  aria-label="Close"
                >
                </button>
                {selectedProgram.imageUrl && (
                  <img
                    src={selectedProgram.imageUrl}
                    alt={selectedProgram.title}
                    className="w-full max-h-96 object-cover rounded mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold mb-4">{selectedProgram.title}</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProgram.content}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProgramsPage;
