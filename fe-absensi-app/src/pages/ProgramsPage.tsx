import React, { useState } from 'react';

interface Program {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const programs: Program[] = [
  {
    id: 1,
    title: 'Pramuka',
    description: 'Kegiatan Pramuka membentuk karakter, kedisiplinan, dan semangat gotong royong siswa melalui kegiatan luar kelas yang mendidik.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 2,
    title: 'Olahraga',
    description: 'Program olahraga untuk meningkatkan kebugaran dan kerja sama tim antar siswa.',
    imageUrl: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 3,
    title: 'Seni Musik',
    description: 'Mengembangkan bakat seni musik siswa melalui berbagai kegiatan dan pertunjukan.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 4,
    title: 'Kegiatan Sosial',
    description: 'Mendorong siswa untuk aktif dalam kegiatan sosial dan pengabdian masyarakat.',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 5,
    title: 'Klub Bahasa',
    description: 'Meningkatkan kemampuan bahasa asing siswa melalui klub bahasa yang interaktif.',
    imageUrl: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 6,
    title: 'Teater',
    description: 'Mengasah kemampuan akting dan ekspresi seni melalui pertunjukan teater sekolah.',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 7,
    title: 'Robotika',
    description: 'Mengenalkan siswa pada teknologi dan pemrograman melalui kompetisi robotika.',
    imageUrl: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 8,
    title: 'Klub Fotografi',
    description: 'Mengembangkan kreativitas siswa dalam bidang fotografi dan pengeditan gambar.',
    imageUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 9,
    title: 'Klub Debat',
    description: 'Melatih kemampuan berbicara dan berpikir kritis melalui debat antar siswa.',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 10,
    title: 'Klub Koding',
    description: 'Mendorong minat dan kemampuan siswa dalam pemrograman dan pengembangan aplikasi.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60',
  },
];

const ProgramsPage: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const openModal = (program: Program) => {
    setSelectedProgram(program);
  };

  const closeModal = () => {
    setSelectedProgram(null);
  };

  return (
    <div className="container mx-auto pt-20 px-4">
      <h1 className="text-3xl font-bold mb-6">Program Sekolah</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <div
            key={program.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => openModal(program)}
          >
            <img
              src={program.imageUrl}
              alt={program.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{program.title}</h2>
              <p className="text-gray-600">{program.description}</p>
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
            <img
              src={selectedProgram.imageUrl}
              alt={selectedProgram.title}
              className="w-full max-h-96 object-cover rounded mb-4"
            />
            <h2 className="text-2xl font-bold mb-4">{selectedProgram.title}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedProgram.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsPage;
