'use client'
import React, { useState, useEffect } from "react";
import { X, Save, History, Settings, Brain, RotateCcw, Trash2, AlertTriangle, FileText } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-opacity-50 p-4">
      <div className="w-full max-w-2xl h-[85vh] rounded-xl shadow-lg flex flex-col font-sans border border-white/20 bg-[#1a1a1a] overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#3b3b3b] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5fdb72]/10 rounded-lg">
              <Brain size={20} className="text-[#5fdb72]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f2f2f2] tracking-tight">Memory Manager</h2>
              <p className="text-xs text-[#8e8e8e]">Manage long-term memory and context</p>
            </div>
          </div>
          <button
            onClick={() => setModal(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#8e8e8e] hover:text-white"
          >
            <X size={20} />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-[#3b3b3b] bg-[#141414] px-6 gap-6">
          <button
            onClick={() => setActiveTab("memory")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "memory"
                ? "border-[#5fdb72] text-[#5fdb72]"
                : "border-transparent text-[#8e8e8e] hover:text-white"
              }`}
          >
            <FileText size={14} />
            Current Memory
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "settings"
                ? "border-[#5fdb72] text-[#5fdb72]"
                : "border-transparent text-[#8e8e8e] hover:text-white"
              }`}
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "history"
                ? "border-[#5fdb72] text-[#5fdb72]"
                : "border-transparent text-[#8e8e8e] hover:text-white"
              }`}
          >
            <History size={14} />
            Snapshots
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#0f0f0f]">

          {!hasMemoryPlaceholder && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-3 flex items-center gap-3 text-yellow-200 text-xs px-6">
              <AlertTriangle size={14} />
              <span>Warning: The <code>{{ memory }}</code> placeholder is missing from your System Prompt. Memory will not be injected.</span>
            </div>
          )}

          {activeTab === "memory" && (
            <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#666] uppercase tracking-wider">Memory Content</label>
                <div className="flex gap-2">
                  <button
                    onClick={generateSummary}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#5fdb72]/10 hover:bg-[#5fdb72]/20 text-[#5fdb72] border border-[#5fdb72]/30 rounded text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Brain size={12} />}
                    {loading ? "Generating..." : "Generate Summary"}
                  </button>
                </div>
              </div>

              <textarea
                className="flex-1 w-full p-4 bg-[#161616] border border-[#2a2a2a] rounded-lg text-[#e4ffe8] font-mono text-sm resize-none outline-none focus:border-[#5fdb72]/50 focus:ring-1 focus:ring-[#5fdb72]/50 transition-all leading-relaxed"
                value={summarizeText}
                onChange={(e) => setSummarizeText(e.target.value)}
                placeholder="Memory is empty. Generate one or type manually..."
                spellCheck={false}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">

              {/* Auto Summarize Toggle */}
              <div className="flex items-center justify-between p-4 bg-[#161616] border border-[#2a2a2a] rounded-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-[#f2f2f2]">Auto-Summarize</span>
                  <span className="text-xs text-[#8e8e8e]">Automatically update memory every 10 messages</span>
                </div>
                <button
                  onClick={() => setAutoSummarize(!autoSummarize)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${autoSummarize ? "bg-[#5fdb72]" : "bg-[#333]"
                    }`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${autoSummarize ? "translate-x-5" : "translate-x-0"
                    }`} />
                </button>
              </div>

              {/* Memory Prompt Editor */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-semibold text-[#666] uppercase tracking-wider">Memory Generation Prompt</label>
                <p className="text-xs text-[#8e8e8e] mb-2">Instructions for the AI on how to summarize and structure the memory.</p>
                <textarea
                  className="w-full h-64 p-4 bg-[#161616] border border-[#2a2a2a] rounded-lg text-[#a1a1a1] font-mono text-xs resize-none outline-none focus:border-[#5fdb72]/50 focus:ring-1 focus:ring-[#5fdb72]/50 transition-all"
                  value={memoryPrompt}
                  onChange={(e) => setMemoryPrompt(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                {snapshots.length === 0 ? (
                  <div className="text-center py-12 text-[#444] text-sm italic">
                    No snapshots available yet.
                  </div>
                ) : (
                  snapshots.map((snap) => (
                    <div key={snap.id} className="p-4 bg-[#161616] border border-[#2a2a2a] rounded-lg flex flex-col gap-3 group hover:border-[#5fdb72]/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[#f2f2f2]">
                            {new Date(snap.timestamp).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#666] font-mono mt-0.5">
                            {snap.content.length} chars
                          </span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => restoreSnapshot(snap.id)}
                            className="p-1.5 text-[#5fdb72] hover:bg-[#5fdb72]/10 rounded"
                            title="Restore this version"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => deleteSnapshot(snap.id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-[#8e8e8e] line-clamp-2 font-mono bg-[#0f0f0f] p-2 rounded border border-[#2a2a2a]">
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
        <footer className="flex justify-between items-center px-6 py-4 border-t border-[#2a2a2a] bg-[#141414]">
          <div className="flex items-center gap-2">
            {active ? (
              <span className="flex items-center gap-1.5 text-[10px] text-[#5fdb72] bg-[#5fdb72]/10 px-2 py-1 rounded-full border border-[#5fdb72]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5fdb72]" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Inactive
              </span>
            )}
            <button
              onClick={reset}
              className="text-xs text-[#666] hover:text-red-400 ml-2 transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setModal(false)}
              className="px-4 py-2 text-sm font-medium text-[#a1a1a1] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-[#5fdb72] hover:bg-[#4ecb61] text-black font-semibold rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(95,219,114,0.2)] hover:shadow-[0_0_20px_rgba(95,219,114,0.4)]"
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
