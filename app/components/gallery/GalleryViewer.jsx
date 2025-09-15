'use client'
import React, { useState } from 'react';
import { X, Grid, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import useCharacterStore from '../../store/useCharacterStore';

export default function GalleryViewer() {
  const { character } = useCharacterStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Open image in viewer
  const openImageViewer = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  // Close image viewer
  const closeImageViewer = () => {
    setSelectedImage(null);
    setCurrentIndex(0);
  };

  // Navigate to next image
  const nextImage = () => {
    if (character.galleryImages && character.galleryImages.length > 0) {
      const nextIndex = (currentIndex + 1) % character.galleryImages.length;
      setCurrentIndex(nextIndex);
      setSelectedImage(character.galleryImages[nextIndex]);
    }
  };

  // Navigate to previous image
  const prevImage = () => {
    if (character.galleryImages && character.galleryImages.length > 0) {
      const prevIndex = (currentIndex - 1 + character.galleryImages.length) % character.galleryImages.length;
      setCurrentIndex(prevIndex);
      setSelectedImage(character.galleryImages[prevIndex]);
    }
  };

  // If no images, don't show anything
  if (!character.galleryImages || character.galleryImages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl px-5 lg:px-14 mb-4">
      {/* Gallery Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-[#E4E4E4] flex items-center gap-2">
          <Grid size={16} />
          Image Gallery ({character.galleryImages.length})
        </h3>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {(character.galleryImages || []).map((image, index) => (
          <div 
            key={index} 
            className="relative group aspect-square cursor-pointer"
            onClick={() => openImageViewer(image, index)}
          >
            <img
              src={image}
              alt={`Gallery item ${index + 1}`}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ZThlOGUiPkludmFsaWQgSW1hZ2U8L3RleHQ+PC9zdmc+';
              }}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
              <ImageIcon size={20} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 p-2 bg-[#333]/80 rounded-full hover:bg-[#444]/80 transition-colors z-10"
              aria-label="Close viewer"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Navigation Buttons */}
            {character.galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-[#333]/80 rounded-full hover:bg-[#444]/80 transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-[#333]/80 rounded-full hover:bg-[#444]/80 transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} className="text-white" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 left-4 p-2 bg-[#333]/80 rounded-full text-white text-sm z-10">
              {currentIndex + 1} / {character.galleryImages.length}
            </div>

            {/* Image Display */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Full size view"
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGU4ZThlIj5JbnZhbGlkIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}