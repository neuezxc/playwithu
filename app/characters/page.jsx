'use client';
import React, { useState, useRef, useEffect } from 'react';
import { SquarePen, Download, Trash2, Plus, Upload, Search, ArrowLeft, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCharacterStore from '@/app/store/useCharacterStore';
import CharacterModal from '@/app/components/modal/CharacterModal';

export default function CharacterManager() {
  const router = useRouter();
  const { characters, character: activeCharacter, setActiveCharacter, deleteCharacter, isCharacterModalOpen, setCharacterModal, addCharacter, setPatternReplacementSettings } = useCharacterStore();
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuCharacterId, setActiveMenuCharacterId] = useState(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuCharacterId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateCharacter = () => {
    setEditingCharacter(null);
    setCharacterModal(true);
  };

  const handleEditCharacter = (character) => {
    setEditingCharacter(character);
    setCharacterModal(true);
    setActiveMenuCharacterId(null);
  };

  const handleDeleteCharacter = (characterId) => {
    if (confirm('Are you sure you want to delete this character?')) {
      deleteCharacter(characterId);
    }
    setActiveMenuCharacterId(null);
  };

  const handleSetActiveCharacter = (characterId) => {
    setActiveCharacter(characterId);
  };

  const handleImportCharacter = () => {
    fileInputRef.current.click();
  };

  const handleExportAllCharacters = () => {
    const dataStr = JSON.stringify(characters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'all_characters.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCharacter = (character) => {
    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${character.name || 'character'}_data.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setActiveMenuCharacterId(null);
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Check if it's a single character or an array of characters
        if (Array.isArray(importedData)) {
          // Import multiple characters
          importedData.forEach(character => {
            addCharacter({
              ...character,
              messages: character.messages || [],
              id: character.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
            });

            if (character.patternReplacementSettings) {
              setPatternReplacementSettings(character.patternReplacementSettings);
            }
          });
        } else {
          // Import single character
          addCharacter({
            ...importedData,
            messages: importedData.messages || [],
            id: importedData.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
          });

          if (importedData.patternReplacementSettings) {
            setPatternReplacementSettings(importedData.patternReplacementSettings);
          }
        }
      } catch (error) {
        console.error("Error parsing imported file:", error);
        alert("Error importing file. Please make sure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const toggleMenu = (e, characterId) => {
    e.stopPropagation();
    setActiveMenuCharacterId(activeMenuCharacterId === characterId ? null : characterId);
  };

  const filteredCharacters = characters.filter(char =>
    char.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-gray-200 font-sans selection:bg-green-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-1">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-400 transition-colors mb-2 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Chat
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              My Characters
            </h1>
            <p className="text-gray-400 text-sm">
              Manage your AI personas and companions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleCreateCharacter}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus size={18} />
                Create New
              </button>
              <button
                onClick={handleImportCharacter}
                className="bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                title="Import JSON"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={handleExportAllCharacters}
                className="bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                title="Export All"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Character Grid */}
        {filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {filteredCharacters.map((character, index) => (
              <div
                key={character.id}
                onClick={() => handleSetActiveCharacter(character.id)}
                className={`group relative bg-[#121212] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 ${character.id === activeCharacter?.id
                  ? 'border-green-500/50 ring-1 ring-green-500/20'
                  : 'border-white/5 hover:border-white/10'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active Indicator */}
                {character.id === activeCharacter?.id && (
                  <div className="absolute top-3 right-3 z-20 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg shadow-green-500/20">
                    ACTIVE
                  </div>
                )}

                {/* Mobile Menu Button */}
                <div className="absolute top-3 left-3 z-30 lg:hidden">
                  <button
                    onClick={(e) => toggleMenu(e, character.id)}
                    className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuCharacterId === character.id && (
                    <div
                      ref={menuRef}
                      className="absolute top-full left-0 mt-2 w-32 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEditCharacter(character)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                      >
                        <SquarePen size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleExportCharacter(character)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                      >
                        <Download size={14} /> Export
                      </button>
                      <button
                        onClick={() => handleDeleteCharacter(character.id)}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Image Container */}
                <div className="aspect-[4/5] w-full bg-[#1a1a1a] relative overflow-hidden">
                  {character.avatarURL ? (
                    <img
                      src={character.avatarURL}
                      alt={character.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-[#1a1a1a]">
                      <span className="text-4xl font-bold opacity-20">{character.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent opacity-80 lg:opacity-60 lg:group-hover:opacity-60 transition-opacity" />

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-5 translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 transition-transform duration-300">
                    <h2 className="text-xl font-bold text-white mb-1 truncate drop-shadow-md">{character.name}</h2>
                    <p className="text-gray-300 text-xs line-clamp-2 mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {character.bio || character.description || 'No description available.'}
                    </p>

                    {/* Desktop Actions (Hover) */}
                    <div className="hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCharacter(character);
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors"
                        title="Edit"
                      >
                        <SquarePen size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportCharacter(character);
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors"
                        title="Export"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCharacter(character.id);
                        }}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md rounded-lg text-red-400 transition-colors ml-auto"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl bg-[#121212]/50">
            <div className="p-4 bg-[#1a1a1a] rounded-full mb-4">
              <Search size={32} className="opacity-50" />
            </div>
            <p className="text-lg font-medium text-gray-400">No characters found</p>
            <p className="text-sm">Try adjusting your search or create a new one.</p>
            <button
              onClick={handleCreateCharacter}
              className="mt-6 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
            >
              Create your first character &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json"
        className="hidden"
      />

      {/* Character Modal */}
      {isCharacterModalOpen && <CharacterModal character={editingCharacter} prefillActive={false} />}
    </div>
  );
}