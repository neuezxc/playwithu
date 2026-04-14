'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  SquarePen, Download, Trash2, Plus, Upload, Search, ArrowLeft,
  MoreVertical, BookOpen, Eye, EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLorebookStore from '@/app/store/useLorebookStore';

export default function LorebookManager() {
  const router = useRouter();
  const {
    globalLorebooks,
    addLorebook,
    updateLorebook,
    deleteLorebook,
    toggleLorebook,
    addEntry,
    updateEntry,
    deleteEntry,
    exportLorebook,
    importLorebook,
    exportAll,
    importAll,
  } = useLorebookStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLorebookId, setExpandedLorebookId] = useState(null);
  const [activeMenuLorebookId, setActiveMenuLorebookId] = useState(null);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuLorebookId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateLorebook = () => {
    addLorebook('New Lorebook');
  };

  const handleDeleteLorebook = (lorebookId) => {
    if (confirm('Are you sure you want to delete this lorebook?')) {
      deleteLorebook(lorebookId);
      if (expandedLorebookId === lorebookId) {
        setExpandedLorebookId(null);
      }
    }
    setActiveMenuLorebookId(null);
  };

  const handleExportLorebook = (lorebookId) => {
    const dataStr = exportLorebook(lorebookId);
    if (!dataStr) return;
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const lorebook = globalLorebooks.find((lb) => lb.id === lorebookId);
    const exportFileDefaultName = `${lorebook?.name || 'lorebook'}_data.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setActiveMenuLorebookId(null);
  };

  const handleExportAll = () => {
    const dataStr = exportAll();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'all_lorebooks.json';
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

        // Check if it's a single lorebook or an array
        if (Array.isArray(importedData)) {
          importAll(JSON.stringify(importedData));
        } else {
          importLorebook(JSON.stringify(importedData));
        }
      } catch (error) {
        console.error('Error parsing imported file:', error);
        alert('Error importing file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const toggleMenu = (e, lorebookId) => {
    e.stopPropagation();
    setActiveMenuLorebookId(activeMenuLorebookId === lorebookId ? null : lorebookId);
  };

  const toggleExpand = (lorebookId) => {
    setExpandedLorebookId(expandedLorebookId === lorebookId ? null : lorebookId);
  };

  const filteredLorebooks = globalLorebooks.filter((lb) =>
    lb.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lb.entries?.some((entry) =>
      entry.keywords?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-gray-200 font-sans selection:bg-green-500/30">
      <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12">

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
              Global Lorebooks
            </h1>
            <p className="text-gray-400 text-sm">
              Manage world info that applies to all characters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search lorebooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleCreateLorebook}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus size={18} />
                Create New
              </button>
              <button
                onClick={handleFileImport}
                className="bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                title="Import JSON"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={handleExportAll}
                className="bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                title="Export All"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Lorebook List */}
        {filteredLorebooks.length > 0 ? (
          <div className="space-y-4">
            {filteredLorebooks.map((lorebook, index) => (
              <div
                key={lorebook.id}
                className={`bg-[#121212] rounded-2xl border transition-all duration-300 overflow-hidden ${
                  expandedLorebookId === lorebook.id
                    ? 'border-green-500/30'
                    : 'border-white/5 hover:border-white/10'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Lorebook Header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() => toggleExpand(lorebook.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      lorebook.enabled
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-white/5 text-gray-600'
                    }`}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{lorebook.name}</h3>
                      <p className="text-xs text-gray-500">{lorebook.entries.length} entries</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Enabled indicator */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLorebook(lorebook.id);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        lorebook.enabled
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-white/5 text-gray-600 hover:bg-white/10'
                      }`}
                    >
                      {lorebook.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                      {lorebook.enabled ? 'On' : 'Off'}
                    </button>

                    {/* Menu button */}
                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(e, lorebook.id)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuLorebookId === lorebook.id && (
                        <div
                          ref={menuRef}
                          className="absolute top-full right-0 mt-2 w-36 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              const newName = prompt('Rename lorebook:', lorebook.name);
                              if (newName && newName.trim()) {
                                updateLorebook(lorebook.id, { name: newName.trim() });
                              }
                              setActiveMenuLorebookId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                          >
                            <SquarePen size={14} /> Rename
                          </button>
                          <button
                            onClick={() => handleExportLorebook(lorebook.id)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                          >
                            <Download size={14} /> Export
                          </button>
                          <button
                            onClick={() => handleDeleteLorebook(lorebook.id)}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded entries */}
                {expandedLorebookId === lorebook.id && (
                  <div className="border-t border-white/5 px-5 pb-5 space-y-3">
                    {lorebook.entries.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-600 gap-2">
                        <BookOpen size={24} strokeWidth={1} className="opacity-30" />
                        <p className="text-xs">No entries yet. Add your first entry below.</p>
                      </div>
                    )}

                    {lorebook.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-2 group hover:border-green-500/20 transition-all"
                      >
                        {/* Keywords */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-[#656565]">Keywords</label>
                          <input
                            type="text"
                            value={entry.keywords}
                            onChange={(e) => updateEntry(lorebook.id, entry.id, { keywords: e.target.value })}
                            placeholder="sword, blade, weapon (comma-separated)"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#f2f2f2] placeholder:text-[#454545] focus:border-green-500/50 focus:bg-green-500/5 outline-none transition-all"
                          />
                        </div>

                        {/* Content */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-[#656565]">Content</label>
                          <textarea
                            value={entry.content}
                            onChange={(e) => updateEntry(lorebook.id, entry.id, { content: e.target.value })}
                            placeholder="World info content..."
                            rows={3}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#f2f2f2] placeholder:text-[#454545] focus:border-green-500/50 focus:bg-green-500/5 outline-none transition-all font-mono resize-none"
                          />
                        </div>

                        {/* Delete button */}
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteEntry(lorebook.id, entry.id)}
                            className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add entry button */}
                    <button
                      onClick={() => addEntry(lorebook.id)}
                      className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 border-dashed transition-all"
                    >
                      <Plus size={14} />
                      Add Entry
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl bg-[#121212]/50">
            <div className="p-4 bg-[#1a1a1a] rounded-full mb-4">
              <BookOpen size={32} className="opacity-50" />
            </div>
            <p className="text-lg font-medium text-gray-400">No lorebooks found</p>
            <p className="text-sm">Try adjusting your search or create a new one.</p>
            <button
              onClick={handleCreateLorebook}
              className="mt-6 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
            >
              Create your first lorebook &rarr;
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
    </div>
  );
}
