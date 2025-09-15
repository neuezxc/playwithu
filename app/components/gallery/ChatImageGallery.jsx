import React, { useState } from 'react';
import { Plus, Trash2, Grid, Image as ImageIcon, X } from 'lucide-react';
import useCharacterStore from '../store/useCharacterStore';

export default function ChatImageGallery() {
  const { character, addGalleryImage, removeGalleryImage } = useCharacterStore();
  const [isExpanded, setIsExpanded] = useState(false);
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

  // If no images, show add button
  if (!character.galleryImages || character.galleryImages.length === 0) {
    return (
      <div className="w-full max-w-2xl px-5 lg:px-14 mb-4">
        {isAdding ? (
          <div className="p-3 bg-[#242524] rounded-lg">
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
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#242524] border border-[#333] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#333] transition-colors w-full justify-center"
          >
            <Plus size={16} />
            Add First Image
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl px-5 lg:px-14 mb-4">
      {/* Gallery Header */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-[#A2A2A2] hover:text-[#E4E4E4] transition-colors"
        >
          <Grid size={16} />
          <span>Gallery ({(character.galleryImages || []).length})</span>
          <span className="text-xs">({isExpanded ? 'Collapse' : 'Expand'})</span>
        </button>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-xs text-[#A2A2A2] hover:text-[#E4E4E4] transition-colors"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Add Image Form */}
      {isAdding && (
        <div className="mb-2 p-2 bg-[#242524] rounded-lg">
          <div className="flex gap-1">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1 bg-[#161616] border border-[#333] rounded-lg p-1.5 text-white placeholder:text-[#f2f2f2]/40 text-sm outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
              onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
            />
            <button
              onClick={handleAddImage}
              disabled={!imageUrl.trim() || !isValidUrl(imageUrl)}
              className="px-2 py-1.5 bg-[#3A9E49]/20 border border-[#3A9E49] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#3A9E49]/30 transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setImageUrl('');
              }}
              className="px-2 py-1.5 bg-[#333] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#444] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Gallery Content */}
      {isExpanded ? (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(character.galleryImages || []).map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={image}
                  alt={`Gallery item ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ZThlOGUiPkludmFsaWQgSW1hZ2U8L3RleHQ+PC9zdmc+';
                  }}
                />
                <button
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete image"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(character.galleryImages || []).slice(0, 6).map((image, index) => (
            <div key={index} className="relative group w-16 h-16 flex-shrink-0">
              <img
                src={image}
                alt={`Gallery item ${index + 1}`}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ZThlOGUiPkludmFsaWQgSW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
              />
              {index === 5 && character.galleryImages.length > 6 && (
                <div className="absolute inset-0 bg-black/70 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    +{character.galleryImages.length - 6}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}