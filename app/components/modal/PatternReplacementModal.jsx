'use client'
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Save, ArrowLeft, Play, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import useCharacterStore from "@/app/store/useCharacterStore";

export default function PatternReplacementModal() {
  const {
    isPatternReplacementModalOpen,
    setPatternReplacementModal,
    patternReplacements,
    addPatternReplacement,
    updatePatternReplacement,
    deletePatternReplacement,
    togglePatternReplacement
  } = useCharacterStore();

  const [view, setView] = useState("list"); // "list" or "edit"
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    prompt: "",
    findPattern: "",
    replacePattern: "",
    isRegex: true,
  });

  // Test Playground State
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isPatternReplacementModalOpen) {
      setView("list");
      setEditingId(null);
      setTestInput("");
      setTestOutput("");
      setIsPlaygroundOpen(false); // Reset playground state
    }
  }, [isPatternReplacementModalOpen]);

  // Run test
  useEffect(() => {
    if (!testInput) {
      setTestOutput("");
      return;
    }

    let result = testInput;
    const patternsToApply = patternReplacements.filter(p => p.active);

    // If we are in edit mode, we should use the formData instead of the saved pattern for the one being edited
    const activePatternsWithEdit = patternsToApply.map(p => {
      if (p.id === editingId) {
        return { ...p, ...formData };
      }
      return p;
    });

    // If adding a new pattern, it's not in the store yet, so maybe we should add it to the test list?
    if (view === 'edit' && !editingId) {
      activePatternsWithEdit.push({ ...formData, active: true });
    }

    for (const pattern of activePatternsWithEdit) {
      if (!pattern.findPattern) continue;

      try {
        let finalReplacePattern = pattern.replacePattern || "";
        if (pattern.prompt) {
          finalReplacePattern = finalReplacePattern.replace(/\{\{tools\}\}/g, pattern.prompt);
        }

        if (pattern.isRegex) {
          const regex = new RegExp(pattern.findPattern, 'g');
          result = result.replace(regex, finalReplacePattern);
        } else {
          const escapedFindPattern = pattern.findPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedFindPattern, 'g');
          result = result.replace(regex, finalReplacePattern);
        }
      } catch (e) {
        console.error("Invalid regex in test:", e);
        // Continue to next pattern or show error?
      }
    }
    setTestOutput(result);

  }, [testInput, patternReplacements, formData, view, editingId]);


  const handleAddNew = () => {
    setFormData({
      prompt: "",
      findPattern: "",
      replacePattern: "",
      isRegex: true,
    });
    setEditingId(null);
    setView("edit");
  };

  const handleEdit = (pattern) => {
    setFormData({
      prompt: pattern.prompt || "",
      findPattern: pattern.findPattern || "",
      replacePattern: pattern.replacePattern || "",
      isRegex: pattern.isRegex !== undefined ? pattern.isRegex : true,
    });
    setEditingId(pattern.id);
    setView("edit");
  };

  const handleSave = () => {
    if (!formData.findPattern) return; // Basic validation

    if (editingId) {
      updatePatternReplacement(editingId, formData);
    } else {
      addPatternReplacement(formData);
    }
    setView("list");
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this pattern?")) {
      deletePatternReplacement(id);
    }
  };

  const handleClose = () => {
    setPatternReplacementModal(false);
  };

  if (!isPatternReplacementModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="w-full h-full lg:h-auto max-w-4xl rounded-xl shadow-2xl flex flex-col font-sans max-h-[90vh] overflow-hidden border border-white/10 bg-[#121212]">

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 md:p-6 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
          <div className="flex items-center gap-3">
            {view === "edit" && (
              <button
                onClick={() => setView("list")}
                className="p-1.5 md:p-2 hover:bg-[#333] rounded-full transition-colors"
              >
                <ArrowLeft size={18} className="text-[#8e8e8e] md:w-5 md:h-5" />
              </button>
            )}
            <h2 className="text-lg md:text-xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
              {view === "list" ? "Pattern Replacements" : (editingId ? "Edit Pattern" : "New Pattern")}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 md:p-2 hover:bg-[#333] rounded-lg transition-colors text-[#8e8e8e] hover:text-white"
          >
            <X size={18} className="md:w-5 md:h-5" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">

          {/* Left/Main Panel: List or Form */}
          <div className={`flex-1 overflow-y-auto p-4 md:p-6 border-r border-[#2a2a2a] ${isPlaygroundOpen ? 'hidden lg:block' : 'block'}`}>

            {view === "list" ? (
              <div className="flex flex-col gap-4">
                {patternReplacements.length === 0 ? (
                  <div className="text-center py-10 text-[#555]">
                    <p>No patterns defined.</p>
                    <p className="text-sm mt-2">Add a pattern to process character outputs.</p>
                  </div>
                ) : (
                  patternReplacements.map((pattern) => (
                    <div key={pattern.id} className="bg-[#1e1e1e] border border-[#333] rounded-lg p-3 md:p-4 flex items-center justify-between group hover:border-[#444] transition-colors">
                      <div className="flex-1 min-w-0 mr-3 md:mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded ${pattern.isRegex ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                            {pattern.isRegex ? 'REGEX' : 'TEXT'}
                          </span>
                          <h3 className="text-sm font-medium text-white truncate" title={pattern.findPattern}>
                            {pattern.findPattern}
                          </h3>
                        </div>
                        <p className="text-xs text-[#8e8e8e] truncate">
                          → {pattern.replacePattern || <span className="italic opacity-50">Empty replacement</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 md:gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={pattern.active}
                            onChange={() => togglePatternReplacement(pattern.id)}
                          />
                          <div className="w-7 h-4 md:w-9 md:h-5 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 md:after:h-4 md:after:w-4 after:transition-all peer-checked:bg-[#5fdb72]"></div>
                        </label>

                        <button
                          onClick={() => handleEdit(pattern)}
                          className="p-1.5 md:p-2 hover:bg-[#333] rounded-lg text-[#8e8e8e] hover:text-white transition-colors"
                        >
                          <Edit2 size={14} className="md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pattern.id)}
                          className="p-1.5 md:p-2 hover:bg-[#333] rounded-lg text-[#8e8e8e] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} className="md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={handleAddNew}
                  className="mt-2 w-full py-2.5 md:py-3 border-2 border-dashed border-[#333] rounded-lg text-[#666] hover:border-[#555] hover:text-[#888] flex items-center justify-center gap-2 transition-colors font-medium text-sm"
                >
                  <Plus size={16} />
                  Add New Pattern
                </button>
              </div>
            ) : (
              // Edit Form
              <div className="flex flex-col gap-6">
                {/* Find Pattern */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8e8e8e]">Find Pattern</label>
                  <input
                    type="text"
                    className="w-full bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#444] text-sm focus:border-[#5fdb72] focus:ring-1 focus:ring-[#5fdb72] outline-none transition-all"
                    value={formData.findPattern}
                    onChange={(e) => setFormData({ ...formData, findPattern: e.target.value })}
                    placeholder="String or Regex to find..."
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isRegex"
                      className="w-4 h-4 bg-[#161616] border border-[#333] rounded accent-[#5fdb72]"
                      checked={formData.isRegex}
                      onChange={(e) => setFormData({ ...formData, isRegex: e.target.checked })}
                    />
                    <label htmlFor="isRegex" className="text-xs text-[#8e8e8e] cursor-pointer select-none">
                      Use Regular Expression
                    </label>
                  </div>
                </div>

                {/* Replace Pattern */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8e8e8e]">Replace With</label>
                  <textarea
                    className="w-full h-24 bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#444] text-sm focus:border-[#5fdb72] focus:ring-1 focus:ring-[#5fdb72] outline-none transition-all resize-none"
                    value={formData.replacePattern}
                    onChange={(e) => setFormData({ ...formData, replacePattern: e.target.value })}
                    placeholder="Replacement text..."
                  />
                  <div className="text-xs text-[#666]">
                    Use <code className="bg-[#333] px-1 rounded text-[#aaa]">{`{{tools}}`}</code> to insert the prompt value below.


                  </div>
                </div>

                {/* Prompt (Tools) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8e8e8e]">Prompt / Tool Value</label>
                  <input
                    type="text"
                    className="w-full bg-[#161616] border border-[#333] rounded-lg p-3 text-white placeholder:text-[#444] text-sm focus:border-[#5fdb72] focus:ring-1 focus:ring-[#5fdb72] outline-none transition-all"
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="Value for {{tools}}..."
                  />
                </div>
                <div>
                  <p className="text-xs text-[#666]">Examples:</p>
                  <a href="https://rentry.co/knwsnd75" target="_blank" rel="noopener noreferrer" className="text-[#5fdb72] hover:underline text-[0.9em]">
                    https://rentry.co/knwsnd75
                  </a>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={!formData.findPattern}
                    className="flex-1 py-2.5 bg-[#5fdb72] text-black font-semibold rounded-lg hover:bg-[#4ecb61] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save Pattern
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className="px-6 py-2.5 bg-[#333] text-white font-medium rounded-lg hover:bg-[#444] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Test Playground */}
          <div className={`w-full lg:w-[350px] bg-[#161616] flex flex-col border-t lg:border-t-0 lg:border-l border-[#2a2a2a] transition-all duration-300 ${isPlaygroundOpen ? 'flex-1' : 'h-12 lg:h-auto'}`}>
            <button
              onClick={() => setIsPlaygroundOpen(!isPlaygroundOpen)}
              className="flex items-center justify-between w-full p-3 md:p-6 lg:cursor-default hover:bg-[#1f1f1f] lg:hover:bg-transparent transition-colors"
            >
              <div className="flex items-center gap-2 text-[#f2f2f2] font-medium">
                <Play size={16} className="text-[#5fdb72]" />
                Test Playground
              </div>
              <div className="lg:hidden text-[#666]">
                {isPlaygroundOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>

            <div className={`flex-1 flex-col gap-4 p-4 md:p-6 pt-0 overflow-hidden ${isPlaygroundOpen ? 'flex' : 'hidden lg:flex'}`}>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#8e8e8e] uppercase tracking-wider">Input Text</label>
                <textarea
                  className="w-full h-24 md:h-32 bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-sm text-[#ccc] placeholder:text-[#444] focus:border-[#555] outline-none resize-none"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Type here to test your patterns..."
                />
              </div>

              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <label className="text-xs font-medium text-[#8e8e8e] uppercase tracking-wider">Output Result</label>
                <div className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-sm text-[#5fdb72] overflow-y-auto min-h-[80px]">
                  {testOutput || <span className="text-[#444] italic">Result will appear here...</span>}
                </div>
              </div>

              <div className="bg-[#1e1e1e] p-3 rounded border border-[#333] text-xs text-[#888] flex gap-2 shrink-0">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <p>
                  The playground applies all <strong>active</strong> patterns in order, plus the one you are currently editing.
                </p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}