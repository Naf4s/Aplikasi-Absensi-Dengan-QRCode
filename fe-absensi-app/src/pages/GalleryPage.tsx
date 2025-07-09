import React from 'react';
import { Camera } from 'lucide-react';

const GalleryPage: React.FC = () => {
  // Sample gallery images - using Pexels stock photos
  const galleryImages = [
    {
      id: 1,
      src: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "School building",
      caption: "Our main campus building"
    },
    {
      id: 2,
      src: "https://images.pexels.com/photos/256431/pexels-photo-256431.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Library",
      caption: "Modern library facilities"
    },
    {
      id: 3,
      src: "https://images.pexels.com/photos/8423266/pexels-photo-8423266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Students studying",
      caption: "Students collaborating on projects"
    },
    {
      id: 4,
      src: "https://images.pexels.com/photos/8850731/pexels-photo-8850731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "School event",
      caption: "Annual science fair"
    },
    {
      id: 5,
      src: "https://images.pexels.com/photos/8471982/pexels-photo-8471982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Sports activities",
      caption: "Championship basketball game"
    },
    {
      id: 6,
      src: "https://images.pexels.com/photos/7092613/pexels-photo-7092613.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Art class",
      caption: "Creative arts program"
    }
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">School Gallery</h1>
          <div className="flex justify-center items-center">
            <Camera className="h-6 w-6 text-blue-600 mr-2" />
            <p className="text-lg text-gray-600">Capturing moments and memories from our school community</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64">
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-white">
                <p className="text-gray-700 font-medium">{image.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Looking for more photos? Check our social media channels for regular updates.</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300">
            View Archives
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;