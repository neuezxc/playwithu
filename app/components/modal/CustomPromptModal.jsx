"use client";

import { useState, useEffect, useRef } from "react";
import { X, FileText, Plus, Trash2, ChevronDown, ChevronRight, Copy, Download, Upload, Save, Layout } from "lucide-react";
import usePromptStore from "../../store/usePromptStore";
import useCharacterStore from "../../store/useCharacterStore";

export default function CustomPromptModal({ onClose }) {
  const {
    system_prompt,
    custom_prompts,
    prompt_names,
    selected_prompt_index,
    setCustomPrompts,
    setPromptNames,
    setSelectedPromptIndex,
  } = usePromptStore();

  // Local state for "draft" editing
  // We initialize these from the store, but edits stay local until "Save" is clicked.
  const [localPrompts, setLocalPrompts] = useState([]);
  const [localNames, setLocalNames] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1); // -1 = Default System Prompt
  const [isPlaceholdersCollapsed, setIsPlaceholdersCollapsed] = useState(true);
  const fileInputRef = useRef(null);

  // Initialize local state from store on mount
  useEffect(() => {
    setLocalPrompts([...custom_prompts]);
    setLocalNames([...prompt_names]);

    // Validate selected index against current prompts
    if (selected_prompt_index >= 0 && selected_prompt_index < custom_prompts.length) {
      setSelectedIndex(selected_prompt_index);
    } else {
      setSelectedIndex(-1);
    }
  }, []); // Empty dependency array = run once on mount

  const handleSave = () => {
    // Commit local changes to the global store
    setCustomPrompts(localPrompts);
    setPromptNames(localNames);
    setSelectedPromptIndex(selectedIndex);

    // Update the current character's system prompt immediately
    const effectivePrompt = selectedIndex === -1
      ? system_prompt
      : localPrompts[selectedIndex];

    useCharacterStore.getState().updateSystemPrompt(effectivePrompt);

    onClose();
  };

  const handleAddNew = () => {
    const newPrompts = [...localPrompts, ""];
    const newNames = [...localNames, `Prompt ${localNames.length + 1}`];
    setLocalPrompts(newPrompts);
    setLocalNames(newNames);
    setSelectedIndex(newPrompts.length - 1); // Switch to the new prompt
  };

  const handleDelete = (index, e) => {
    e.stopPropagation(); // Prevent clicking the item row

    const newPrompts = localPrompts.filter((_, i) => i !== index);
    const newNames = localNames.filter((_, i) => i !== index);

    setLocalPrompts(newPrompts);
    setLocalNames(newNames);

    // Adjust selection if needed
    if (selectedIndex === index) {
      setSelectedIndex(-1); // Fallback to default
    } else if (selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleDuplicate = (index, e) => {
    e.stopPropagation();
    const promptToCopy = localPrompts[index];
    const nameToCopy = localNames[index];

    const newPrompts = [...localPrompts, promptToCopy];
    const newNames = [...localNames, `${nameToCopy} (Copy)`];

    setLocalPrompts(newPrompts);
    setLocalNames(newNames);
    setSelectedIndex(newPrompts.length - 1);
  };

  const handleExport = () => {
    const data = {
      prompts: localPrompts,
      names: localNames
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom_prompts.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data.prompts) && Array.isArray(data.names)) {
          // Append imported prompts
          setLocalPrompts([...localPrompts, ...data.prompts]);
          setLocalNames([...localNames, ...data.names]);
        } else {
          alert("Invalid format: JSON must contain 'prompts' and 'names' arrays.");
        }
      } catch (err) {
        console.error("Error parsing JSON", err);
        alert("Error parsing JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const handleNameChange = (val) => {
    if (selectedIndex === -1) return;
    const newNames = [...localNames];
    newNames[selectedIndex] = val;
    setLocalNames(newNames);
  };

  const handleContentChange = (val) => {
    if (selectedIndex === -1) return; // Can't edit default system prompt text here (it's read-only or managed elsewhere)
    const newPrompts = [...localPrompts];
    newPrompts[selectedIndex] = val;
    setLocalPrompts(newPrompts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 bg-opacity-50 p-2 md:p-4 overflow-hidden">
      <div className="w-full h-[95vh] md:h-[90vh] max-w-7xl rounded-xl shadow-2xl flex flex-col font-sans border border-white/10 bg-[#0f0f0f] overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#2a2a2a] bg-[#141414] shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
              <Layout size={20} className="text-[#5fdb72]" />
              Prompt Manager
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 text-[#8e8e8e] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Main Content - Sidebar Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* Sidebar */}
          <aside className="w-full md:w-64 flex flex-col border-b md:border-b-0 md:border-r border-[#2a2a2a] bg-[#111111] max-h-[30vh] md:max-h-none shrink-0">
            <div className="p-2 md:p-3 flex flex-col gap-2 overflow-y-auto flex-1">

              {/* Default Item */}
              <button
                onClick={() => setSelectedIndex(-1)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${selectedIndex === -1
                  ? "bg-[#5fdb72]/10 text-[#5fdb72] border border-[#5fdb72]/20"
                  : "text-[#a1a1a1] hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
              >
                <div className={`p-1.5 rounded-md ${selectedIndex === -1 ? 'bg-[#5fdb72]/20' : 'bg-[#2a2a2a]'}`}>
                  <FileText size={14} />
                </div>
                <span>Default Prompt</span>
              </button>

              <div className="h-px bg-[#2a2a2a] my-1 shrink-0" />

              <div className="px-1 text-xs font-semibold text-[#555] uppercase tracking-wider mb-1 shrink-0">
                Custom Prompts
              </div>

              {/* Custom Items List */}
              {localNames.map((name, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all shrink-0 ${selectedIndex === idx
                    ? "bg-[#5fdb72]/10 text-[#5fdb72] border border-[#5fdb72]/20"
                    : "text-[#a1a1a1] hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-1.5 rounded-md flex-shrink-0 ${selectedIndex === idx ? 'bg-[#5fdb72]/20' : 'bg-[#2a2a2a]'}`}>
                      <FileText size={14} />
                    </div>
                    <span className="truncate">{name || "Untitled"}</span>
                  </div>

                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDuplicate(idx, e)}
                      className="p-1.5 text-[#a1a1a1] hover:text-white hover:bg-white/10 rounded-md"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(idx, e)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {localNames.length === 0 && (
                <div className="text-center py-4 text-[#444] text-xs italic">
                  No custom prompts yet.
                </div>
              )}
            </div>

            {/* Sidebar Footer Actions */}
            <div className="p-2 md:p-3 border-t border-[#2a2a2a] bg-[#141414] flex flex-col gap-2 shrink-0">
              <button
                onClick={handleAddNew}
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#5fdb72]/10 hover:bg-[#5fdb72]/20 text-[#5fdb72] border border-[#5fdb72]/30 rounded-lg text-xs font-medium transition-colors"
              >
                <Plus size={14} />
                New Prompt
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleImportClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#a1a1a1] rounded-lg text-xs font-medium transition-colors"
                  title="Import JSON"
                >
                  <Upload size={12} />
                  Import
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#a1a1a1] rounded-lg text-xs font-medium transition-colors"
                  title="Export JSON"
                >
                  <Download size={12} />
                  Export
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
            </div>
          </aside>

          {/* Editor Area */}
          <main className="flex-1 flex flex-col bg-[#0f0f0f] min-w-0 overflow-hidden">
            {selectedIndex === -1 ? (
              // Default Prompt View (Read Only)
              <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 overflow-hidden">
                <div className="flex flex-col gap-1 shrink-0">
                  <h3 className="text-xl md:text-2xl font-bold text-[#f2f2f2]">Default System Prompt</h3>
                  <p className="text-sm text-[#666]">This is the built-in prompt template.</p>
                </div>
                <div className="flex-1 relative min-h-0 mt-2">
                  <textarea
                    className="w-full h-full p-6 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl text-[#a1a1a1] font-mono text-base md:text-lg resize-none focus:outline-none shadow-inner"
                    value={system_prompt}
                    readOnly
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-[#2a2a2a] text-[#666] text-xs rounded border border-[#333]">
                    Read Only
                  </div>
                </div>
              </div>
            ) : (
              // Custom Prompt Editor
              <div className="flex-1 flex flex-col p-4 md:p-6 gap-2 overflow-hidden">
                {/* Prompt Name as Title */}
                <div className="shrink-0">
                  <input
                    type="text"
                    className="w-full bg-transparent text-[#f2f2f2] text-xl md:text-2xl font-bold placeholder:text-[#333] outline-none border-none p-0 focus:ring-0 transition-all"
                    value={localNames[selectedIndex] || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Untitled Prompt"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2 min-h-0 mt-2">
                  <div className="flex justify-end items-center shrink-0">
                    <button
                      onClick={() => setIsPlaceholdersCollapsed(!isPlaceholdersCollapsed)}
                      className="text-xs text-[#5fdb72] hover:text-[#5fdb72]/80 flex items-center gap-1 transition-colors bg-[#5fdb72]/5 px-2 py-1 rounded-full"
                    >
                      {isPlaceholdersCollapsed ? "Show Variables" : "Hide Variables"}
                      {isPlaceholdersCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {!isPlaceholdersCollapsed && (
                    <div className="flex flex-wrap gap-2 p-3 bg-[#181818] border border-[#2a2a2a] rounded-lg mb-2 shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
                      {["{{char}}", "{{user}}", "{{char_description}}", "{{user_description}}", "{{scenario}}", "{{memory}}", "{{tools}}"].map(ph => (
                        <span key={ph} className="px-2 py-1 bg-[#5fdb72]/10 text-[#5fdb72] text-xs font-mono rounded border border-[#5fdb72]/20 select-all cursor-copy hover:bg-[#5fdb72]/20 transition-colors" title="Click to select">
                          {ph}
                        </span>
                      ))}
                    </div>
                  )}

                  <textarea
                    className="flex-1 w-full p-6 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl text-[#e4ffe8] font-mono text-base md:text-lg resize-none outline-none focus:border-[#5fdb72]/50 focus:ring-1 focus:ring-[#5fdb72]/50 transition-all leading-relaxed shadow-lg placeholder:text-[#333]"
                    value={localPrompts[selectedIndex] || ""}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Write your system prompt here..."
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-center px-4 md:px-6 py-4 border-t border-[#2a2a2a] bg-[#141414] shrink-0">
          <div className="text-xs text-[#666]">
            {localPrompts.length} custom prompt{localPrompts.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#a1a1a1] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-[#5fdb72] hover:bg-[#4ecb61] text-black font-semibold rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(95,219,114,0.2)] hover:shadow-[0_0_20px_rgba(95,219,114,0.4)]"
            >
              <Save size={16} />
              <span className="hidden md:inline">Save Changes</span>
              <span className="md:hidden">Save</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}