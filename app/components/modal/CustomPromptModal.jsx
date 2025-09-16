"use client";

import { useState } from "react";
import { X, FileText } from "lucide-react";
import usePromptStore from "../../store/usePromptStore";

export default function CustomPromptModal({ onClose }) {
  const { system_prompt, custom_prompt, setCustomPrompt, resetToDefault } = usePromptStore();
  const [promptValue, setPromptValue] = useState(custom_prompt || system_prompt);

  const handleSave = () => {
    setCustomPrompt(promptValue);
    onClose();
  };

  const handleReset = () => {
    resetToDefault();
    setPromptValue(system_prompt);
  };

  return (
    // Modal Overlay: Centers the modal and provides a backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Modal Content */}
      <div className="w-full max-w-2xl bg-[#212121] rounded-xl shadow-lg flex flex-col font-sans">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-[#3b3b3b]">
          <div>
            <h2 className="text-2xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
              <FileText size={24} className="text-[#5fdb72]" />
              Custom Prompt
            </h2>
            <p className="text-sm text-[#8e8e8e] mt-1">
              Customize the system prompt with dynamic placeholders
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} className="text-[#9F9F]" />
          </button>
        </header>
        
        {/* Modal Body */}
        <main className="p-6 flex flex-col gap-6">
          {/* Prompt Textarea */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="customPrompt"
              className="text-lg font-medium text-[#f2f2f2]"
            >
              Prompt Template
            </label>
            <textarea
              id="customPrompt"
              className="w-full h-64 px-6 py-4 bg-[#161616] rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow resize-none"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder="Enter your custom prompt with placeholders like {{char}}, {{user}}, etc."
            />
          </div>
          
          {/* Placeholders Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-medium text-[#f2f2f2]">Available Placeholders</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-3 rounded-lg">
                <span className="text-[#e4ffe8] font-mono text-sm">{"{{char}}"}</span>
              </div>
              <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-3 rounded-lg">
                <span className="text-[#e4ffe8] font-mono text-sm">{"{{user}}"}</span>
              </div>
              <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-3 rounded-lg">
                <span className="text-[#e4ffe8] font-mono text-sm">{"{{char_description}}"}</span>
              </div>
              <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-3 rounded-lg">
                <span className="text-[#e4ffe8] font-mono text-sm">{"{{user_description}}"}</span>
              </div>
              <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-3 rounded-lg">
                <span className="text-[#e4ffe8] font-mono text-sm">{"{{scenario}}"}</span>
              </div>
              <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-3 rounded-lg">
                <span className="text-[#e4ffe8] font-mono text-sm">{"{{memory}}"}</span>
              </div>
            </div>
          </div>
        </main>
        
        {/* Modal Footer */}
        <footer className="flex justify-end items-center gap-3 p-6 border-t border-[#333]">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-white/80 bg-[#454545]/30 border border-[#454545] hover:bg-white/10 rounded-lg transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/80 bg-[#454545]/30 border border-[#454545] hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#5fdb72]/15 border border-[#5fdb72] rounded-lg text-[#e4ffe8] text-sm font-medium hover:bg-[#5fdb72]/25 transition-colors"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}