'use client'
import React, { useState } from "react";
import { X, FileText } from "lucide-react";
import useCharacterStore from "@/app/store/useCharacterStore";

export default function PatternReplacementModal() {
  const { isPatternReplacementModalOpen } = useCharacterStore();
  const setPatternReplacementModal = useCharacterStore((state) => state.setPatternReplacementModal);
  const patternReplacementSettings = useCharacterStore((state) => state.patternReplacementSettings);
  const setPatternReplacementSettings = useCharacterStore((state) => state.setPatternReplacementSettings);

  // Local state for editing pattern replacement settings
  const [editableSettings, setEditableSettings] = useState({
    prompt: patternReplacementSettings.prompt || "",
    findPattern: patternReplacementSettings.findPattern || "",
    replacePattern: patternReplacementSettings.replacePattern || "",
    isRegex: patternReplacementSettings.isRegex !== undefined ? patternReplacementSettings.isRegex : true,
  });

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditableSettings({
      ...editableSettings,
      [field]: value,
    });
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (field, checked) => {
    setEditableSettings({
      ...editableSettings,
      [field]: checked,
    });
  };

  // Save changes
  const handleSave = () => {
    setPatternReplacementSettings({
      ...patternReplacementSettings,
      ...editableSettings,
    });
    setPatternReplacementModal(false);
  };

 // Close modal without saving
 const handleClose = () => {
   // Reset editable settings to current settings values
   setEditableSettings({
     prompt: patternReplacementSettings.prompt || "",
     findPattern: patternReplacementSettings.findPattern || "",
     replacePattern: patternReplacementSettings.replacePattern || "",
     isRegex: patternReplacementSettings.isRegex !== undefined ? patternReplacementSettings.isRegex : true,
   });
   setPatternReplacementModal(false);
 };

  if (!isPatternReplacementModalOpen) return null;

  return (
    // Modal Overlay: Centers the modal and provides a backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-opacity-50 p-4">
      {/* Modal Content */}
      <div className="w-full max-w-2xl bg-[#2121] rounded-xl shadow-lg flex flex-col font-sans max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-[#3b3b3b]">
          <h2 className="text-xl font-bold text-[#f2f2f2] tracking-[-0.4px] flex flex-row gap-1 items-center">
            <FileText />
            Pattern Replacement Settings
          </h2>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} className="text-[#9F9F]" />
          </button>
        </header>

        {/* Modal Body - Scrollable Content */}
        <main className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Prompt */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e8e] tracking-[-0.2px]">
              Prompt
            </label>
            <textarea
              className="w-full h-32 bg-[#1616] border border-[#33] rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow resize-none"
              value={editableSettings.prompt}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
              placeholder="Enter your prompt here..."
            />
            <p className="text-xs text-[#8e8e8e]">
              Example: {'<Tools><Pattern Commands>'}Always include an emotion/behavior pattern command at the end of {'{{char}}'}'s dialog or narration. Use this format: [{'<command>'}]. - Select from the list below, avoiding repetition when possible. - Double-check the command exists in the list before outputting. List: neutral, positive, negative, dissatisfied, anger, crying, satisfied, cheer Example: [neutral]{'</Pattern Commands></Tools>'}
            </p>
          </div>

          {/* Find Pattern */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e] tracking-[-0.2px]">
              Find Pattern (Regex)
            </label>
            <input
              type="text"
              className="w-full bg-[#161616] border border-[#33] rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
              value={editableSettings.findPattern}
              onChange={(e) => handleInputChange("findPattern", e.target.value)}
              placeholder="Enter regex pattern to find..."
            />
            <p className="text-xs text-[#8e8e8e]">
              Example: \[s+(\w+)\]
            </p>
          </div>
          
          {/* Regex Toggle */}
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="isRegex"
              className="w-4 h-4 bg-[#161616] border border-[#333] rounded accent-[#5fdb72]"
              checked={editableSettings.isRegex}
              onChange={(e) => handleCheckboxChange("isRegex", e.target.checked)}
            />
            <label htmlFor="isRegex" className="text-sm font-medium text-[#8e8e8e]">
              Use as regular expression
            </label>
          </div>

          {/* Replace Pattern */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-medium text-[#8e8e8e] tracking-[-0.2px]">
              Replace Pattern
            </label>
            <textarea
              className="w-full h-24 bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow resize-none"
              value={editableSettings.replacePattern}
              onChange={(e) => handleInputChange("replacePattern", e.target.value)}
              placeholder="Enter replacement pattern..."
            />
            <p className="text-xs text-[#8e8e8e]">
              Example: {'<img src="https://anywebsite.com/$1.png" style="width: 50%;" />'}
            </p>
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