'use client'
import React, { useState, useEffect } from "react";
import { X, User, Image, FileText, MessageSquare, Save, Sparkles, BrainCircuit, VenetianMask } from "lucide-react";
import useCharacterStore from "@/app/store/useCharacterStore";

export default function CharacterModal({ character: editingCharacter, prefillActive = true }) {
  const { character: activeCharacter, characters, isCharacterModalOpen, patternReplacementSettings } = useCharacterStore();
  const setCharacterModal = useCharacterStore((state) => state.setCharacterModal);
  const setCharacter = useCharacterStore((state) => state.setCharacter);
  const resetMessage = useCharacterStore((state) => state.resetMessage);
  const setPatternReplacementSettings = useCharacterStore((state) => state.setPatternReplacementSettings);
  const addCharacter = useCharacterStore((state) => state.addCharacter);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);

  const [activeTab, setActiveTab] = useState("identity"); // "identity" | "behavior"

  // Local state for editing character details
  const [editableCharacter, setEditableCharacter] = useState({
    name: "",
    avatarURL: "",
    bio: "",
    description: "",
    scenario: "",
    firstMessage: "",
  });

  // Initialize state when modal opens or props change
  useEffect(() => {
    if (isCharacterModalOpen) {
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
      setActiveTab("identity"); // Reset tab on open
    }
  }, [isCharacterModalOpen, editingCharacter, prefillActive, activeCharacter]);

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
    setCharacterModal(false);
  };

  if (!isCharacterModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full h-full md:h-auto md:max-h-[90vh] max-w-5xl rounded-2xl shadow-2xl flex flex-col font-sans border border-white/10 bg-[#121212] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#181818]">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              {editingCharacter ? <Sparkles size={18} className="text-green-400" /> : <User size={18} className="text-green-400" />}
            </div>
            {editingCharacter ? "Edit Character" : "Create New Character"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-0 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("identity")}
              className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 ${activeTab === "identity" ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                }`}
            >
              <VenetianMask size={16} />
              Identity
              {activeTab === "identity" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("behavior")}
              className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 ${activeTab === "behavior" ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                }`}
            >
              <BrainCircuit size={16} />
              Behavior
              {activeTab === "behavior" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          {activeTab === "identity" && (
            <div className="flex flex-col md:flex-row gap-6 animate-in slide-in-from-left-4 duration-300">

              {/* Left Column: Avatar & Basic Info */}
              <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
                {/* Avatar Preview */}
                <div className="aspect-square w-full bg-[#1a1a1a] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                  {editableCharacter.avatarURL ? (
                    <img
                      src={editableCharacter.avatarURL}
                      alt="Avatar preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <Image size={48} strokeWidth={1} />
                      <span className="text-xs">No Avatar</span>
                    </div>
                  )}
                  {/* Overlay Hint */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <p className="text-xs text-white font-medium">Preview</p>
                  </div>
                </div>

                {/* Avatar URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avatar URL</label>
                  <input
                    type="text"
                    value={editableCharacter.avatarURL}
                    onChange={(e) => handleInputChange("avatarURL", e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Right Column: Name & Bio */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    value={editableCharacter.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g. Seraphina"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-lg font-medium text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Short Bio</label>
                  <textarea
                    value={editableCharacter.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="A brief summary of the character..."
                    className="w-full flex-1 min-h-[120px] bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-gray-500 text-right">
                    Visible in character cards and lists.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "behavior" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} />
                  Description / Personality
                </label>
                <textarea
                  value={editableCharacter.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Detailed personality, traits, and physical description..."
                  className="w-full h-40 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all resize-none leading-relaxed font-mono"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Scenario */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <BrainCircuit size={14} />
                    Scenario
                  </label>
                  <textarea
                    value={editableCharacter.scenario}
                    onChange={(e) => handleInputChange("scenario", e.target.value)}
                    placeholder="The current situation or context of the conversation..."
                    className="w-full h-48 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all resize-none leading-relaxed font-mono"
                  />
                </div>

                {/* First Message */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={14} />
                    First Message
                  </label>
                  <textarea
                    value={editableCharacter.firstMessage}
                    onChange={(e) => handleInputChange("firstMessage", e.target.value)}
                    placeholder="The opening line from the character..."
                    className="w-full h-48 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>

            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-[#181818]">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
          >
            <Save size={16} />
            Save Character
          </button>
        </footer>

      </div>
    </div>
  );
}