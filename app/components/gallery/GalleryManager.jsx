'use client'
import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import useCharacterStore from '../../store/useCharacterStore';

export default function GalleryManager() {
  const { character, addGalleryImage, removeGalleryImage } = useCharacterStore();
  const [isAdding, setIsAdding] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

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

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-[#E4E4E4] flex items-center gap-2">
          <ImageIcon size={20} />
          Manage Gallery
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#3A9E49]/20 border border-[#3A9E49] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#3A9E49]/30 transition-colors"
        >
          <Plus size={16} />
          Add Image
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
              Cancel
            </button>
          </div>
        </div>
      )}

      {character.galleryImages && character.galleryImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(character.galleryImages || []).map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Gallery item ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGU4ZThlIj5JbnZhbGlkIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
              <button
                onClick={() => removeGalleryImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete image"
              >
                <Trash2 size={14} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#333] rounded-lg">
          <ImageIcon size={32} className="text-[#333] mb-2" />
          <p className="text-[#888] text-center">
            No images yet. Add your first image URL!
          </p>
        </div>
      )}
    </div>
  );
}