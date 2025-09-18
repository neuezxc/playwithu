'use client';
import React, { useState, useRef } from 'react';
import { SquarePen, Download, Trash2, Plus, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCharacterStore from '@/app/store/useCharacterStore';
import CharacterModal from '@/app/components/modal/CharacterModal';

export default function CharacterManager() {
  const router = useRouter();
  const { characters, character: activeCharacter, setActiveCharacter, deleteCharacter, isCharacterModalOpen, setCharacterModal, addCharacter, setPatternReplacementSettings } = useCharacterStore();
  const [editingCharacter, setEditingCharacter] = useState(null);
  const fileInputRef = useRef(null);

  const handleCreateCharacter = () => {
    setEditingCharacter(null);
    setCharacterModal(true);
  };

  const handleEditCharacter = (character) => {
    setEditingCharacter(character);
    setCharacterModal(true);
  };

  const handleDeleteCharacter = (characterId) => {
    if (confirm('Are you sure you want to delete this character?')) {
      deleteCharacter(characterId);
    }
  };

  const handleSetActiveCharacter = (characterId) => {
    setActiveCharacter(characterId);
  };

  const handleImportCharacter = () => {
    fileInputRef.current.click();
  };

  const handleExportAllCharacters = () => {
    const dataStr = JSON.stringify(characters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'all_characters.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCharacter = (character) => {
    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${character.name || 'character'}_data.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
            
            // If the imported character has pattern replacement settings, update the global settings
            // Note: This will overwrite the settings with the last character's settings if multiple characters have them
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
          
          // If the imported character has pattern replacement settings, update the global settings
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

  return (
    <div className="bg-[#151615] h-screen w-full flex justify-center p-2 md:p-8">
      {/* Main Content Container */}
      <div className="bg-[#151615] rounded-lg flex flex-col w-full max-w-6xl p-2 sm:p-8">
        
        {/* Header */}
        <header className="w-full pb-6 mb-6 border-b border-[#3b3b3b]">
          <div className="flex items-center justify-between">
            <h1 className="text-[#f2f2f2] text-2xl md:text-3xl font-bold tracking-tight">
              Character Manager
            </h1>
            <button
              onClick={() => router.push('/')}
              className="bg-[#45454533] border border-[#454545] rounded-md px-4 py-2 text-white text-sm font-medium hover:bg-[#45454555] transition-colors"
            >
              Back to Chat
            </button>
          </div>
        </header>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <button
            onClick={handleCreateCharacter}
            className="bg-[#5fdb7226] border border-[#5fdb72] rounded-md px-5 py-2 text-[#edffef] text-sm font-medium hover:bg-[#5fdb7236] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Create Character
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportCharacter}
              className="bg-[#45454533] border border-[#454545] rounded-md px-5 py-2 text-white text-sm font-medium hover:bg-[#45454555] transition-colors"
            >
              Import
            </button>
            <button
              onClick={handleExportAllCharacters}
              className="bg-[#45454533] border border-[#454545] rounded-md px-5 py-2 text-white text-sm font-medium hover:bg-[#45454555] transition-colors"
            >
              Export All
            </button>
          </div>
        </div>

        {/* Character List Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
          {characters.map((character) => (
            <div 
              key={character.id} 
              className={`rounded-lg overflow-hidden flex flex-col group basis-1/2 ${
                character.id === activeCharacter.id 
                  ? 'bg-[#5fdb721a] border border-[#5fdb72]' 
                  : 'bg-[#4545451a] border-2 border-[#454545]'
              }`}
            >
              <div className="w-full h-56 bg-[#404040]">
                {character.avatarURL && (
                  <img 
                    src={character.avatarURL} 
                    alt={character.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-white text-xl font-medium">{character.name}</h2>
                <p className="text-[#949494] text-sm mt-1 mb-4 flex-grow">
                  {character.bio || 'No bio available'}
                </p>
                <div className="flex items-center">
                  <button 
                    onClick={() => handleEditCharacter(character)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <SquarePen 
                      size={16} 
                      className={character.id === activeCharacter.id ? "text-[#97D7A0]" : "text-[#DADADA]"} 
                    />
                  </button>
                  <button
                    onClick={() => handleExportCharacter(character)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Download
                      size={16}
                      className={character.id === activeCharacter.id ? "text-[#97D7A0]" : "text-[#DADADA]"}
                    />
                  </button>
                  <button 
                    onClick={() => handleDeleteCharacter(character.id)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors ml-auto"
                  >
                    <Trash2 
                      size={16} 
                      className="text-white/30 transition-colors" 
                    />
                  </button>
                  {character.id !== activeCharacter.id && (
                    <button 
                      onClick={() => handleSetActiveCharacter(character.id)}
                      className="ml-2 px-3 py-1 bg-[#5fdb7226] border border-[#5fdb72] rounded text-[#edffef] text-xs hover:bg-[#5fdb7236] transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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