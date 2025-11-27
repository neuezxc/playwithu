'use client'
import React, { useState, useEffect } from "react";
import { X, Save, History, Settings, Brain, RotateCcw, Trash2, AlertTriangle, FileText, Sparkles } from "lucide-react";

import useMemoryStore from "@/app/store/useMemoryStore";
import useCharacterStore from "@/app/store/useCharacterStore";
import usePromptStore from "@/app/store/usePromptStore";

export default function MemoryModal() {
  const {
    modal, setModal,
    summarizeText, setSummarizeText,
    loading, setLoading,
    generateSummary,
    active, setActive,
    reset,
    autoSummarize, setAutoSummarize,
    memoryPrompt, setMemoryPrompt,
    snapshots, restoreSnapshot, deleteSnapshot
  } = useMemoryStore();

  const { updateSystemPrompt } = useCharacterStore((state) => state);
  const { system_prompt } = usePromptStore();

  const [activeTab, setActiveTab] = useState("memory"); // memory, settings, history
  const [hasMemoryPlaceholder, setHasMemoryPlaceholder] = useState(true);

  useEffect(() => {
    setHasMemoryPlaceholder(system_prompt.includes("{{memory}}"));
  }, [system_prompt]);

  const handleSave = () => {
    if (!summarizeText) return;
    updateSystemPrompt(system_prompt.replace("{{memory}}", summarizeText));
    setActive(true);
    setModal(false);
  };

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full h-full md:h-[85vh] max-w-5xl rounded-2xl shadow-2xl flex flex-col font-sans border border-white/10 bg-[#121212] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#181818]">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <Brain size={18} className="text-green-400" />
            </div>
            Memory Manager
          </h2>
          <button
            onClick={() => setModal(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-0 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("memory")}
              className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === "memory" ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                }`}
            >
              <FileText size={16} />
              Current Memory
              {activeTab === "memory" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === "settings" ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                }`}
            >
              <Settings size={16} />
              Settings
              {activeTab === "settings" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === "history" ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                }`}
            >
              <History size={16} />
              Snapshots
              {activeTab === "history" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#121212]">

          {!hasMemoryPlaceholder && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-4 flex items-start gap-3 text-yellow-200 text-sm">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> The <code>{"{{memory}}"}</code> placeholder is missing from your System Prompt. Memory will not be injected into the conversation.
              </span>
            </div>
          )}

          {activeTab === "memory" && (
            <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden animate-in slide-in-from-left-4 duration-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Brain size={14} />
                  Memory Content
                </label>
                <button
                  onClick={generateSummary}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Sparkles size={14} />}
                  {loading ? "Generating..." : "Generate Summary"}
                </button>
              </div>

              <textarea
                className="flex-1 w-full min-h-[400px] p-4 bg-[#1a1a1a] border border-white/10 rounded-xl text-white font-mono text-sm resize-none outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all leading-relaxed placeholder:text-gray-600"
                value={summarizeText}
                onChange={(e) => setSummarizeText(e.target.value)}
                placeholder="Memory is empty. Generate one or type manually..."
                spellCheck={false}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto animate-in slide-in-from-right-4 duration-300">

              {/* Auto Summarize Toggle */}
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-white/10 rounded-xl">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-white">Auto-Summarize</span>
                  <span className="text-xs text-gray-500">Automatically update memory every 10 messages</span>
                </div>
                <button
                  onClick={() => setAutoSummarize(!autoSummarize)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${autoSummarize ? "bg-green-500" : "bg-[#333]"
                    }`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${autoSummarize ? "translate-x-5" : "translate-x-0"
                    }`} />
                </button>
              </div>

              {/* Memory Prompt Editor */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} />
                  Memory Generation Prompt
                </label>
                <p className="text-xs text-gray-500 mb-2">Instructions for the AI on how to summarize and structure the memory.</p>
                <textarea
                  className="w-full flex-1 min-h-[400px] p-4 bg-[#1a1a1a] border border-white/10 rounded-xl text-gray-300 font-mono text-sm resize-none outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
                  value={memoryPrompt}
                  onChange={(e) => setMemoryPrompt(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex-1 flex flex-col p-6 overflow-hidden animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {snapshots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                    <History size={48} strokeWidth={1} className="opacity-50" />
                    <p className="text-sm">No snapshots available yet.</p>
                  </div>
                ) : (
                  snapshots.map((snap) => (
                    <div key={snap.id} className="p-4 bg-[#1a1a1a] border border-white/10 rounded-xl flex flex-col gap-3 group hover:border-green-500/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">
                            {new Date(snap.timestamp).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {snap.content.length} chars
                          </span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => restoreSnapshot(snap.id)}
                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Restore this version"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => deleteSnapshot(snap.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-2 font-mono bg-[#121212] p-3 rounded-lg border border-white/5">
                        {snap.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-white/5 bg-[#181818]">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            {active ? (
              <span className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Memory Active
              </span>
            ) : (
              <span className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Memory Inactive
              </span>
            )}
            <button
              onClick={reset}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={12} /> Reset All
            </button>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setModal(false)}
              className="flex-1 md:flex-none px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-green-500/20"
            >
              <Save size={16} />
              Save & Activate
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
