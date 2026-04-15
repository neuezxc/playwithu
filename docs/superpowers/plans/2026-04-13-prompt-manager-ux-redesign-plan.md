# Prompt Manager Mobile UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Prompt Manager modal into a fully responsive, modern glassmorphic interface with a mobile stack-navigation pattern.

**Architecture:** We are preserving all the logic handlers and state introduced in the recent rebuild, only replacing the JSX layout, styling, and introducing a `mobileView` UI state variable. 

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React

---

### Task 1: Update CustomPromptModal with Mobile Stack UX

**Files:**
- Modify: `app/components/modal/CustomPromptModal.jsx`

- [ ] **Step 1: Rewrite CustomPromptModal JSX & State**

Replace the entire file with the following updated React component. It maintains all existing data flow but entirely rewrites the view layer.

```jsx
"use client"

import { useState, useEffect, useRef } from "react"
import {
  X, FileText, Plus, Trash2, Copy, Download, Upload,
  Save, Layout, Eye, Pencil, ChevronDown, RotateCcw, Check, ChevronLeft, Sparkles
} from "lucide-react"
import usePromptStore, { DEFAULT_SYSTEM_PROMPT } from "../../store/usePromptStore"
import useCharacterStore from "../../store/useCharacterStore"
import { PROMPT_VARIABLES, replacePlaceholders, buildPlaceholderValues } from "../../utils/replacerTemplate"

export default function CustomPromptModal({ onClose }) {
  const storePrompts = usePromptStore(state => state.prompts)
  const storeActiveId = usePromptStore(state => state.activePromptId)

  const [localPrompts, setLocalPrompts] = useState([])
  const [localActiveId, setLocalActiveId] = useState('default')
  const [selectedId, setSelectedId] = useState('default')
  const [mode, setMode] = useState('edit')
  
  // NEW: Mobile view state ('list' or 'editor')
  const [mobileView, setMobileView] = useState('list')
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setLocalPrompts(storePrompts.map(p => ({ ...p })))
    setLocalActiveId(storeActiveId)
    setSelectedId(storeActiveId)
  }, [])

  const selectedPrompt = localPrompts.find(p => p.id === selectedId)
  const isDefault = selectedPrompt?.isDefault || false
  const hasDefaultChanged = isDefault && selectedPrompt?.content !== DEFAULT_SYSTEM_PROMPT
  const tokenCount = selectedPrompt ? Math.ceil(selectedPrompt.content.length / 4) : 0

  // --- Handlers ---
  const handleNameChange = (val) => {
    setLocalPrompts(prev => prev.map(p => p.id === selectedId ? { ...p, name: val } : p))
  }

  const handleContentChange = (val) => {
    setLocalPrompts(prev => prev.map(p => p.id === selectedId ? { ...p, content: val } : p))
  }

  const handleAddNew = () => {
    const newPrompt = {
      id: Date.now().toString(),
      name: `Prompt ${localPrompts.length}`,
      content: '',
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setLocalPrompts(prev => [...prev, newPrompt])
    setSelectedId(newPrompt.id)
    setMode('edit')
    setMobileView('editor') // Auto switch to editor on mobile
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    const prompt = localPrompts.find(p => p.id === id)
    if (!prompt || prompt.isDefault) return

    setLocalPrompts(prev => prev.filter(p => p.id !== id))
    if (selectedId === id) setSelectedId('default')
    if (localActiveId === id) setLocalActiveId('default')
  }

  const handleDuplicate = (id, e) => {
    e.stopPropagation()
    const source = localPrompts.find(p => p.id === id)
    if (!source) return

    const newPrompt = {
      id: Date.now().toString(),
      name: `${source.name} (Copy)`,
      content: source.content,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setLocalPrompts(prev => [...prev, newPrompt])
    setSelectedId(newPrompt.id)
    setMobileView('editor') // Auto-focus new copy on mobile
  }

  const handleResetDefault = () => {
    setLocalPrompts(prev => prev.map(p => p.isDefault ? { ...p, content: DEFAULT_SYSTEM_PROMPT, updatedAt: Date.now() } : p))
  }

  const handleSetActive = (id) => setLocalActiveId(id)

  const handleInsertVariable = (variable) => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = selectedPrompt?.content || ''

    const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end)
    handleContentChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  const handleExport = () => {
    const exportData = localPrompts
      .filter(p => !p.isDefault)
      .map(({ id, name, content, createdAt, updatedAt }) => ({ id, name, content, createdAt, updatedAt }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompts_export.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImportFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        const items = Array.isArray(data) ? data : [data]
        const imported = items
          .filter(item => item.name && typeof item.content === 'string')
          .map(item => ({
            id: `imported_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name: item.name,
            content: item.content,
            isDefault: false,
            createdAt: item.createdAt || Date.now(),
            updatedAt: Date.now()
          }))
        if (imported.length === 0) {
          alert('No valid prompts found.')
          return
        }
        setLocalPrompts(prev => [...prev, ...imported])
      } catch (err) {
        alert('Error reading file. Make sure it is valid JSON.')
      }
    }
    reader.readAsText(file)
    e.target.value = null
  }

  const handleSave = () => {
    usePromptStore.setState({ prompts: localPrompts, activePromptId: localActiveId })
    useCharacterStore.getState().refreshSystemPrompt()
    onClose()
  }

  // A tiny custom highlighter parser for the preview — looks for {{vars}} and styles them green
  const renderPreviewWithHighlights = (text) => {
    if (!text) return <span className="text-[#333] italic">Empty prompt</span>
    const parts = text.split(/(\{\{[\w_]+\}\})/)
    return parts.map((part, i) => 
      part.match(/\{\{[\w_]+\}\}/) ? (
        <span key={i} className="text-[#5fdb72] bg-[#5fdb72]/10 px-1 py-0.5 rounded-sm inline-block mx-0.5 whitespace-pre-wrap">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  const previewContent = selectedPrompt ? replacePlaceholders(selectedPrompt.content, buildPlaceholderValues()) : ''

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="w-full h-[100dvh] md:h-[90vh] max-w-6xl md:rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col font-sans border border-white/5 bg-[#0a0a0a] overflow-hidden relative">

        {/* Global Header (Hidden on mobile when editing for full screen immersion) */}
        <header className={`flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/5 bg-[#121212]/80 backdrop-blur shrink-0 ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2.5">
             <div className="p-1.5 bg-[#5fdb72]/10 rounded-lg">
                <Sparkles size={16} className="text-[#5fdb72]" />
             </div>
             Prompt Manager
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        {/* Main Layout Area */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* ======================================= */}
          {/* SIDEBAR / LIST PANE                       */}
          {/* ======================================= */}
          <aside className={`flex flex-col flex-1 md:w-72 md:flex-none border-b md:border-b-0 md:border-r border-white/5 bg-[#101010] z-10 transition-transform duration-300 ${mobileView === 'editor' ? '-translate-x-full md:translate-x-0 absolute inset-0 md:relative' : 'translate-x-0 absolute inset-0 md:relative'}`}>
            
            {/* List Body */}
            <div className="p-3 md:p-4 flex flex-col gap-2 overflow-y-auto flex-1 scrollbar-hidden">
              {localPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => { setSelectedId(prompt.id); setMode('edit'); setMobileView('editor'); }}
                  className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedId === prompt.id
                      ? 'bg-[#181818] ring-1 ring-[#5fdb72]/50 shadow-[0_4px_20px_rgba(95,219,114,0.05)]'
                      : 'bg-[#141414] hover:bg-[#1a1a1a] ring-1 ring-white/5 hover:ring-white/10'
                  }`}
                >
                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${localActiveId === prompt.id ? 'bg-[#5fdb72] shadow-[0_0_8px_#5fdb72]' : 'bg-[#333]'}`} />
                       <span className={`truncate text-sm font-medium ${selectedId === prompt.id ? 'text-[#f2f2f2]' : 'text-[#a1a1a1] group-hover:text-white'}`}>
                         {prompt.name || 'Untitled Prompt'}
                       </span>
                    </div>
                    {prompt.isDefault && (
                      <span className="text-[10px] text-gray-500 font-mono tracking-wider pl-3.5">SYSTEM DEFAULT</span>
                    )}
                  </div>

                  {/* Actions (always visible on hover desktop, visible via dots on mobile later if needed, right now static) */}
                  {!prompt.isDefault && (
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                      <button onClick={(e) => handleDuplicate(prompt.id, e)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Copy size={14} /></button>
                      <button onClick={(e) => handleDelete(prompt.id, e)} className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile FAB for New Prompt */}
            <div className="md:hidden absolute bottom-6 right-6">
               <button onClick={handleAddNew} className="w-14 h-14 bg-[#5fdb72] text-black rounded-full shadow-[0_8px_30px_rgba(95,219,114,0.3)] flex items-center justify-center active:scale-95 transition-transform">
                  <Plus size={24} strokeWidth={2.5}/>
               </button>
            </div>

            {/* Desktop List Footer Actions */}
            <div className="hidden md:flex flex-col p-4 border-t border-white/5 bg-[#121212]/50 gap-2 shrink-0">
               <button onClick={handleAddNew} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5fdb72]/10 hover:bg-[#5fdb72]/20 text-[#5fdb72] border border-[#5fdb72]/30 rounded-xl text-sm font-medium transition-colors">
                  <Plus size={16} /> New Prompt
               </button>
               <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" className="hidden" />
                  <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-medium transition-colors"><Upload size={14} /> Import</button>
                  <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-medium transition-colors"><Download size={14} /> Export</button>
               </div>
            </div>
          </aside>

          {/* ======================================= */}
          {/* EDITOR PANE                               */}
          {/* ======================================= */}
          <main className={`flex flex-col flex-1 bg-[#0f0f0f] z-20 transition-transform duration-300 ${mobileView === 'list' ? 'translate-x-full md:translate-x-0 absolute inset-0 md:relative' : 'translate-x-0 absolute inset-0 md:relative'}`}>
            
            {/* Mobile Editor Nav (Back Button) */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#121212]">
                <button onClick={() => setMobileView('list')} className="flex items-center gap-1 text-[#5fdb72] font-medium p-1">
                   <ChevronLeft size={20} /> Back
                </button>
                {localActiveId !== selectedId ? (
                   <button onClick={() => handleSetActive(selectedId)} className="text-xs font-semibold bg-[#5fdb72] text-black px-3 py-1.5 rounded-full">
                     Activate
                   </button>
                ) : (
                   <span className="text-xs text-[#5fdb72] font-medium flex items-center gap-1"><Check size={14}/> Active</span>
                )}
            </div>

            {selectedPrompt ? (
               <div className="flex flex-col h-full">
                 
                 {/* Title & Toolbar Area */}
                 <div className="p-4 md:p-6 pb-2 border-b border-white/5 shrink-0 flex flex-col gap-4">
                    
                    {/* Title Input */}
                    <input
                      type="text"
                      className="w-full bg-transparent text-[#f2f2f2] text-2xl font-bold placeholder:text-gray-600 outline-none border-none p-0 focus:ring-0 transition-all font-sans"
                      value={selectedPrompt.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Untitled Prompt"
                    />

                    {/* Editor Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                       
                       {/* iOS Segmented Control: Edit/Preview */}
                       <div className="flex bg-[#1a1a1a] p-1 rounded-xl ring-1 ring-white/5">
                          <button onClick={() => setMode('edit')} className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${mode === 'edit' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                            <Pencil size={14} /> Edit
                          </button>
                          <button onClick={() => setMode('preview')} className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${mode === 'preview' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                            <Eye size={14} /> Preview
                          </button>
                       </div>

                       <div className="flex items-center gap-3">
                          {isDefault && hasDefaultChanged && (
                            <button onClick={handleResetDefault} className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg text-xs font-medium transition-colors">
                              <RotateCcw size={14} /> Reset
                            </button>
                          )}
                          <span className="text-xs text-gray-500 font-mono hidden md:block">{tokenCount} tokens</span>
                       </div>

                    </div>
                 </div>

                 {/* Variable Pills Ribbon (Horizontal scroll) */}
                 {mode === 'edit' && (
                    <div className="px-4 md:px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-hidden border-b border-white/5 shrink-0">
                       <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap mr-2">Insert:</span>
                       {PROMPT_VARIABLES.map(v => (
                         <button
                           key={v}
                           onClick={() => handleInsertVariable(v)}
                           className="px-2.5 py-1 bg-[#252525] text-gray-300 text-[11px] font-mono rounded-md border border-white/5 hover:border-[#5fdb72]/30 hover:text-[#5fdb72] hover:bg-[#5fdb72]/5 transition-colors whitespace-nowrap shrink-0"
                         >
                           {v}
                         </button>
                       ))}
                    </div>
                 )}

                 {/* Textarea / Preview Container */}
                 <div className="flex-1 relative overflow-hidden bg-[#0d0d0d] p-4 md:p-6">
                    {mode === 'edit' ? (
                      <textarea
                        ref={textareaRef}
                        className="w-full h-full bg-transparent text-[#e4ffe8] font-mono text-sm md:text-[15px] resize-none outline-none border-none p-0 focus:ring-0 leading-relaxed placeholder:text-gray-700"
                        value={selectedPrompt.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Write your system prompt instructions here..."
                        spellCheck={false}
                      />
                    ) : (
                      <div className="w-full h-full overflow-y-auto text-gray-300 font-mono text-sm md:text-[15px] leading-relaxed select-text">
                        {renderPreviewWithHighlights(previewContent)}
                      </div>
                    )}
                 </div>

               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4">
                  <Layout size={48} className="opacity-20" />
                  <p className="text-sm font-medium">Select a prompt to edit</p>
               </div>
            )}
          </main>
        </div>

        {/* Global Footer */}
        <footer className={`flex justify-between items-center px-4 md:px-6 py-4 border-t border-white/5 bg-[#121212]/90 backdrop-blur shrink-0 ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
           <div className="flex flex-col gap-0.5">
             <span className="text-xs text-white font-medium">{localPrompts.length} Prompts</span>
             <span className="text-[10px] text-gray-500">Unsaved changes are kept in draft.</span>
           </div>
           
           <div className="flex items-center gap-3">
             <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
               Discard
             </button>
             <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#5fdb72] hover:bg-[#4ecb61] text-black font-semibold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(95,219,114,0.15)] active:scale-95">
               <Save size={16} /> Save
             </button>
           </div>
        </footer>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/modal/CustomPromptModal.jsx
git commit -m "feat: redesign prompt manager with stack navigation and glassmorphism"
```

---

## Execution Handoff
Plan complete and saved to `docs/superpowers/plans/2026-04-13-prompt-manager-ux-redesign-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
