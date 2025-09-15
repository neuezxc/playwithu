import React, { useState } from 'react';
import { X, Plus, Trash2, Grid, Image as ImageIcon, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import useCharacterStore from '../../store/useCharacterStore';

export default function ImageGalleryModal({ onClose }) {
  const { character, addGalleryImage, removeGalleryImage } = useCharacterStore();
  const [isAdding, setIsAdding] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle adding image URL
  const handleAddImage = () => {
    if (imageUrl.trim() && isValidUrl(imageUrl)) {
      addGalleryImage(imageUrl.trim());
      setImageUrl('');
      setIsAdding(false);
    }
  };

  // Validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Open image in viewer
  const openImageViewer = (image, index) => {
    console.log('Opening image viewer for:', image, 'at index:', index);
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

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#333]">
          <h2 className="text-xl font-bold text-[#E4E4E4] flex items-center gap-2">
            <Grid size={20} />
            {character.name}'s Gallery
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#333] rounded-lg transition-colors"
            aria-label="Close gallery"
          >
            <X size={20} className="text-[#A2A2A2]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[#A2A2A2] text-sm">
              {(character.galleryImages || []).length} images
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#3A9E49]/20 border border-[#3A9E49] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#3A9E49]/30 transition-colors"
            >
              <Plus size={16} />
              Add Image URL
            </button>
          </div>

          {/* Add Image Form */}
          {isAdding && (
            <div className="mb-4 p-3 bg-[#242524] rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 bg-[#161616] border border-[#333] rounded-lg p-2 text-white placeholder:text-[#f2f2f2]/40 text-sm outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
                />
                <button
                  onClick={handleAddImage}
                  disabled={!imageUrl.trim() || !isValidUrl(imageUrl)}
                  className="px-3 py-2 bg-[#3A9E49]/20 border border-[#3A9E49] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#3A9E49]/30 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setImageUrl('');
                  }}
                  className="px-3 py-2 bg-[#333] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#444] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {character.galleryImages && character.galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(character.galleryImages || []).map((image, index) => (
                <div 
                  key={index} 
                  className="relative group aspect-square cursor-pointer"
                  onClick={() => openImageViewer(image, index)}
                >
                  <img
                    src={image}
                    alt={`Gallery item ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ZThlOGUiPkludmFsaWQgSW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGalleryImage(index);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    aria-label="Delete image"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#333] rounded-lg">
              <Grid size={48} className="text-[#333] mb-4" />
              <h3 className="text-lg font-medium text-[#E4E4E4] mb-2">No images yet</h3>
              <p className="text-[#888] text-center mb-4 max-w-md">
                Add image URLs to create a gallery for {character.name}. These images can be used in conversations.
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#3A9E49]/20 border border-[#3A9E49] rounded-lg text-[#E4E4E4] hover:bg-[#3A9E49]/30 transition-colors"
              >
                <Plus size={16} />
                Add First Image
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#333] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#333] rounded-lg text-[#E4E4E4] hover:bg-[#444] transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
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
            {character.galleryImages && character.galleryImages.length > 1 && (
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
              {currentIndex + 1} / {(character.galleryImages || []).length}
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