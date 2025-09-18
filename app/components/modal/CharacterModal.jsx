'use client'
import React, { useState } from "react";
import { X, User, Image, FileText, MessageSquare } from "lucide-react";
import useCharacterStore from "@/app/store/useCharacterStore";

export default function CharacterModal({ character: editingCharacter, prefillActive = true }) {
  const { character: activeCharacter, characters, isCharacterModalOpen, patternReplacementSettings } = useCharacterStore();
  const setCharacterModal = useCharacterStore((state) => state.setCharacterModal);
  const setCharacter = useCharacterStore((state) => state.setCharacter);
  const resetMessage = useCharacterStore((state) => state.resetMessage);
  const setPatternReplacementSettings = useCharacterStore((state) => state.setPatternReplacementSettings);
  const addCharacter = useCharacterStore((state) => state.addCharacter);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);

  // Local state for editing character details
  const [editableCharacter, setEditableCharacter] = useState({
    name: editingCharacter?.name || (prefillActive ? activeCharacter?.name || "" : ""),
    avatarURL: editingCharacter?.avatarURL || (prefillActive ? activeCharacter?.avatarURL || "" : ""),
    bio: editingCharacter?.bio || (prefillActive ? activeCharacter?.bio || "" : ""),
    description: editingCharacter?.description || (prefillActive ? activeCharacter?.description || "" : ""),
    scenario: editingCharacter?.scenario || (prefillActive ? activeCharacter?.scenario || "" : ""),
    firstMessage: editingCharacter?.firstMessage || (prefillActive ? activeCharacter?.firstMessage || "" : ""),
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditableCharacter({
      ...editableCharacter,
      [field]: value,
    });
  };

  // Save changes
  const handleSave = () => {
    if (editingCharacter) {
      // Update existing character
      updateCharacter({
        ...editingCharacter,
        ...editableCharacter,
      });
    } else if (prefillActive) {
      // Update active character (when editing from SuperInput)
      setCharacter({
        ...activeCharacter,
        ...editableCharacter,
      });
      
      // Also update the character in the characters array
      updateCharacter({
        ...activeCharacter,
        ...editableCharacter,
      });
    } else {
      // Create new character (when creating from character manager)
      addCharacter({
        ...editableCharacter,
        messages: [],
      });
    }
    setCharacterModal(false);
  };

  // Close modal without saving
  const handleClose = () => {
    // Reset editable character to current character values or empty for new character
    if (editingCharacter) {
      setEditableCharacter({
        name: editingCharacter.name || "",
        avatarURL: editingCharacter.avatarURL || "",
        bio: editingCharacter.bio || "",
        description: editingCharacter.description || "",
        scenario: editingCharacter.scenario || "",
        firstMessage: editingCharacter.firstMessage || "",
      });
    } else if (prefillActive && activeCharacter) {
      setEditableCharacter({
        name: activeCharacter.name || "",
        avatarURL: activeCharacter.avatarURL || "",
        bio: activeCharacter.bio || "",
        description: activeCharacter.description || "",
        scenario: activeCharacter.scenario || "",
        firstMessage: activeCharacter.firstMessage || "",
      });
    } else {
      setEditableCharacter({
        name: "",
        avatarURL: "",
        bio: "",
        description: "",
        scenario: "",
        firstMessage: "",
      });
    }
    setCharacterModal(false);
  };

  if (!isCharacterModalOpen) return null;

  return (
    // Modal Overlay: Centers the modal and provides a backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-opacity-50 p-4 ">
      
      {/* Modal Content */}
      <div className="w-full max-w-2xl  rounded-xl shadow-lg flex flex-col font-sans max-h-[95vh] overflow-hidden border border-white/30 bg-white/2" >
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-[#3b3b3b]">
          <h2 className="text-xl font-bold text-[#f2f2f2] tracking-[-0.4px] flex flex-row gap-1 items-center">
            {editingCharacter ? "Edit Character" : "Create Character"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
              aria-label="Close modal"
            >
              <X size={16}  />
            </button>
          </div>
        </header>

        {/* Modal Body - Scrollable Content */}
        <main className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Character Name */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e8e] tracking-[-0.2px] flex items-center gap-1">
              <User size={16} />
              Name
            </label>
            <input
              type="text"
              className="w-full bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
              value={editableCharacter.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          {/* Avatar URL */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e8e] tracking-[-0.2px] flex items-center gap-1">
              <Image size={16} />
              Avatar URL
            </label>
            <input
              type="text"
              className="w-full bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
              value={editableCharacter.avatarURL}
              onChange={(e) => handleInputChange("avatarURL", e.target.value)}
            />
            {editableCharacter.avatarURL && (
              <div className="flex justify-center mt-2 ">
                <div className="rounded-lg flex items-center justify-center aspect-video">
                  <img
                    src={editableCharacter.avatarURL}
                    alt="Avatar preview"
                    className="h-full rounded-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e8e] tracking-[-0.2px] flex items-center gap-1">
              <FileText size={16} />
              Bio
            </label>
            <textarea
              className="w-full h-24 bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow resize-none"
              value={editableCharacter.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e8e] tracking-[-0.2px] flex items-center gap-1">
              <FileText size={16} />
              Description
            </label>
            <textarea
              className="w-full h-32 bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow resize-none h-[300px]"
              value={editableCharacter.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          {/* Scenario */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e8e] tracking-[-0.2px] flex items-center gap-1">
              <FileText size={16} />
              Scenario
            </label>
            <textarea
              className="w-full  bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow resize-none h-[200px]"
              value={editableCharacter.scenario}
              onChange={(e) => handleInputChange("scenario", e.target.value)}
            />
          </div>

          {/* First Message */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e8e] tracking-[-0.2px] flex items-center gap-1">
              <MessageSquare size={16} />
              First Message
            </label>
            <textarea
              className="w-full h-32 bg-[#1616]/60 border border-none rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow resize-none h-[300px]"
              value={editableCharacter.firstMessage}
              onChange={(e) => handleInputChange("firstMessage", e.target.value)}
            />
          </div>
          
        </main>

        {/* Modal Footer */}
        <footer className="flex flex-row justify-end items-center gap-4 p-6 border-t border-[#3c3c3c]">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-white/80 bg-[#454545]/30 border border-[#454545] hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#5fdb72]/15 border border-[#5fdb72] rounded-lg text-[#e4ffe8] text-sm font-medium hover:bg-[#5fdb72]/25 transition-colors"
          >
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
}