"use client"

import { useState, useEffect, useRef } from "react"
import {
  X, FileText, Plus, Trash2, Copy, Download, Upload,
  Save, Layout, Eye, Pencil, ChevronDown, RotateCcw, Check
} from "lucide-react"
import usePromptStore, { DEFAULT_SYSTEM_PROMPT } from "../../store/usePromptStore"
import useCharacterStore from "../../store/useCharacterStore"
import { PROMPT_VARIABLES, replacePlaceholders, buildPlaceholderValues } from "../../utils/replacerTemplate"

export default function CustomPromptModal({ onClose }) {
  const storePrompts = usePromptStore(state => state.prompts)
  const storeActiveId = usePromptStore(state => state.activePromptId)

  // Local draft state — changes don't commit until Save
  const [localPrompts, setLocalPrompts] = useState([])
  const [localActiveId, setLocalActiveId] = useState('default')
  const [selectedId, setSelectedId] = useState('default')
  const [mode, setMode] = useState('edit') // 'edit' | 'preview'
  const [showVariables, setShowVariables] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize local state from store on mount
  useEffect(() => {
    setLocalPrompts(storePrompts.map(p => ({ ...p })))
    setLocalActiveId(storeActiveId)
    setSelectedId(storeActiveId)
  }, [])

  const selectedPrompt = localPrompts.find(p => p.id === selectedId)
  const isDefault = selectedPrompt?.isDefault || false
  const hasDefaultChanged = isDefault && selectedPrompt?.content !== DEFAULT_SYSTEM_PROMPT

  // Token estimate
  const tokenCount = selectedPrompt ? Math.ceil(selectedPrompt.content.length / 4) : 0

  // --- Handlers ---

  const handleNameChange = (val) => {
    setLocalPrompts(prev => prev.map(p =>
      p.id === selectedId ? { ...p, name: val } : p
    ))
  }

  const handleContentChange = (val) => {
    setLocalPrompts(prev => prev.map(p =>
      p.id === selectedId ? { ...p, content: val } : p
    ))
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
  }

  const handleResetDefault = () => {
    setLocalPrompts(prev => prev.map(p =>
      p.isDefault ? { ...p, content: DEFAULT_SYSTEM_PROMPT, updatedAt: Date.now() } : p
    ))
  }

  const handleSetActive = (id) => {
    setLocalActiveId(id)
  }

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
          alert('No valid prompts found. Each prompt needs a "name" and "content" field.')
          return
        }

        setLocalPrompts(prev => [...prev, ...imported])
      } catch (err) {
        console.error('Error parsing import:', err)
        alert('Error reading file. Make sure it is valid JSON.')
      }
    }
    reader.readAsText(file)
    e.target.value = null
  }

  const handleSave = () => {
    // Commit local prompts to the store
    const { prompts: _, activePromptId: __, ...rest } = usePromptStore.getState()
    usePromptStore.setState({
      prompts: localPrompts,
      activePromptId: localActiveId
    })

    // Refresh the character's system prompt with the new active prompt
    useCharacterStore.getState().refreshSystemPrompt()
    onClose()
  }

  // Build preview content
  const previewContent = selectedPrompt
    ? replacePlaceholders(selectedPrompt.content, buildPlaceholderValues())
    : ''

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-2 md:p-4 overflow-hidden">
      <div className="w-full h-[95vh] md:h-[90vh] max-w-7xl rounded-xl shadow-2xl flex flex-col font-sans border border-white/10 bg-[#0f0f0f] overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-[#2a2a2a] bg-[#141414] shrink-0">
          <h2 className="text-base md:text-xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
            <Layout size={18} className="text-[#5fdb72]" />
            Prompt Manager
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-[#8e8e8e] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* Sidebar */}
          <aside className="w-full md:w-64 flex flex-col border-b md:border-b-0 md:border-r border-[#2a2a2a] bg-[#111111] max-h-[30vh] md:max-h-none shrink-0">
            <div className="p-2 md:p-3 flex flex-col gap-1.5 overflow-y-auto flex-1">
              {localPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => { setSelectedId(prompt.id); setMode('edit') }}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all shrink-0 ${
                    selectedId === prompt.id
                      ? 'bg-[#5fdb72]/10 text-[#5fdb72] border border-[#5fdb72]/20'
                      : 'text-[#a1a1a1] hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                    {/* Active indicator */}
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      localActiveId === prompt.id ? 'bg-[#5fdb72]' : 'bg-[#333]'
                    }`} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-medium">
                        {prompt.name || 'Untitled'}
                      </span>
                      {prompt.isDefault && (
                        <span className="text-[10px] text-[#666] uppercase tracking-wider">Default</span>
                      )}
                    </div>
                  </div>

                  {/* Hover actions */}
                  {!prompt.isDefault && (
                    <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => handleDuplicate(prompt.id, e)}
                        className="p-1.5 text-[#a1a1a1] hover:text-white hover:bg-white/10 rounded-md"
                        title="Duplicate"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(prompt.id, e)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-2 md:p-3 border-t border-[#2a2a2a] bg-[#141414] flex flex-row md:flex-col gap-2 shrink-0">
              <button
                onClick={handleAddNew}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2 bg-[#5fdb72]/10 hover:bg-[#5fdb72]/20 text-[#5fdb72] border border-[#5fdb72]/30 rounded-lg text-xs font-medium transition-colors"
              >
                <Plus size={14} />
                <span>New</span>
              </button>
              <div className="flex gap-2 flex-1 md:flex-none">
                <button
                  onClick={handleImportClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#a1a1a1] rounded-lg text-xs font-medium transition-colors"
                  title="Import JSON"
                >
                  <Upload size={12} />
                  <span className="hidden md:inline">Import</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#a1a1a1] rounded-lg text-xs font-medium transition-colors"
                  title="Export JSON"
                >
                  <Download size={12} />
                  <span className="hidden md:inline">Export</span>
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
            {selectedPrompt ? (
              <div className="flex-1 flex flex-col p-3 md:p-6 gap-2 overflow-hidden">
                {/* Name Input */}
                <div className="shrink-0">
                  <input
                    type="text"
                    className="w-full bg-transparent text-[#f2f2f2] text-lg md:text-2xl font-bold placeholder:text-[#333] outline-none border-none p-0 focus:ring-0 transition-all"
                    value={selectedPrompt.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Untitled Prompt"
                  />
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 mt-1">
                  {/* Insert Variable Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowVariables(!showVariables)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg text-xs text-[#a1a1a1] hover:text-white hover:border-[#444] transition-colors"
                    >
                      <Plus size={12} />
                      Insert Variable
                      <ChevronDown size={12} className={`transition-transform ${showVariables ? 'rotate-180' : ''}`} />
                    </button>
                    {showVariables && (
                      <div className="absolute top-full left-0 mt-1 p-2 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg z-10 flex flex-wrap gap-1.5 min-w-[260px] animate-in fade-in slide-in-from-top-2 duration-150">
                        {PROMPT_VARIABLES.map(v => (
                          <button
                            key={v}
                            onClick={() => { handleInsertVariable(v); setShowVariables(false) }}
                            className="px-2 py-1 bg-[#5fdb72]/10 text-[#5fdb72] text-[11px] font-mono rounded border border-[#5fdb72]/20 hover:bg-[#5fdb72]/20 transition-colors"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit / Preview Toggle */}
                  <div className="flex bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setMode('edit')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors ${
                        mode === 'edit' ? 'bg-[#5fdb72]/15 text-[#5fdb72]' : 'text-[#a1a1a1] hover:text-white'
                      }`}
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => setMode('preview')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors ${
                        mode === 'preview' ? 'bg-[#5fdb72]/15 text-[#5fdb72]' : 'text-[#a1a1a1] hover:text-white'
                      }`}
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                  </div>

                  {/* Token Count */}
                  <span className="text-[11px] text-[#555] font-mono px-2">
                    ~{tokenCount} tokens
                  </span>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Set Active Button */}
                  {localActiveId !== selectedId && (
                    <button
                      onClick={() => handleSetActive(selectedId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5fdb72]/10 hover:bg-[#5fdb72]/20 text-[#5fdb72] border border-[#5fdb72]/30 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Check size={12} />
                      Set Active
                    </button>
                  )}
                  {localActiveId === selectedId && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-[#5fdb72] text-xs font-medium">
                      <Check size={12} />
                      Active
                    </span>
                  )}

                  {/* Reset Default */}
                  {isDefault && hasDefaultChanged && (
                    <button
                      onClick={handleResetDefault}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#a1a1a1] hover:text-white border border-[#2a2a2a] hover:border-[#444] rounded-lg text-xs transition-colors"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0 mt-1">
                  {mode === 'edit' ? (
                    <textarea
                      ref={textareaRef}
                      className="w-full h-full p-4 md:p-6 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl text-[#e4ffe8] font-mono text-sm resize-none outline-none focus:border-[#5fdb72]/50 focus:ring-1 focus:ring-[#5fdb72]/50 transition-all leading-relaxed shadow-lg placeholder:text-[#333]"
                      value={selectedPrompt.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Write your system prompt here..."
                      spellCheck={false}
                    />
                  ) : (
                    <div className="w-full h-full p-4 md:p-6 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl text-[#c8c8c8] font-mono text-sm overflow-y-auto leading-relaxed whitespace-pre-wrap">
                      {previewContent || <span className="text-[#333] italic">Empty prompt</span>}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#444]">
                <p className="text-sm">Select a prompt to edit</p>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-center px-3 md:px-6 py-3 md:py-4 border-t border-[#2a2a2a] bg-[#141414] shrink-0">
          <div className="text-[10px] md:text-xs text-[#666]">
            {localPrompts.length} prompt{localPrompts.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-[#a1a1a1] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 bg-[#5fdb72] hover:bg-[#4ecb61] text-black font-semibold rounded-lg text-xs md:text-sm transition-all shadow-[0_0_15px_rgba(95,219,114,0.2)] hover:shadow-[0_0_20px_rgba(95,219,114,0.4)]"
            >
              <Save size={14} />
              <span className="hidden md:inline">Save Changes</span>
              <span className="md:hidden">Save</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}