# Memory Manager Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Memory Manager with live placeholder injection, working auto-summarize, and a sidebar-nav glassmorphic UI matching ApiSettingsModal.

**Architecture:** Three targeted changes across 3 files. The store gains a `summarizeInterval` field and calls `refreshSystemPrompt()` after generation. The modal gets a full UI rewrite with sidebar navigation. The page component uses the configurable interval.

**Tech Stack:** React, Zustand, Tailwind CSS v4, Lucide React icons

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `app/store/useMemoryStore.js` | Modify | Add `summarizeInterval`, call `refreshSystemPrompt()` after successful generation |
| `app/components/modal/MemoryModal.jsx` | Rewrite | Full UI rebuild with sidebar-nav layout, fix handleSave to use refreshSystemPrompt |
| `app/page.js` | Modify | Use `summarizeInterval` from store instead of hardcoded 10 |

---

### Task 1: Update useMemoryStore — Add summarizeInterval and fix generateSummary

**Files:**
- Modify: `app/store/useMemoryStore.js`

- [ ] **Step 1: Add `summarizeInterval` state and setter**

In `app/store/useMemoryStore.js`, add the new field to initial state (after `autoSummarize: false,`) and its setter (after `setAutoSummarize`):

```js
// Add to initial state, after line 10 (autoSummarize: false,)
summarizeInterval: 10,

// Add to actions, after line 78 (setAutoSummarize setter)
setSummarizeInterval: (interval) => set({ summarizeInterval: interval }),
```

- [ ] **Step 2: Call refreshSystemPrompt after successful generation**

In the `generateSummary` action, after `set({ summarizeText: text })` on line 189, add:

```js
set({ summarizeText: text })

// Refresh the system prompt so {{memory}} resolves to the new text
const { refreshSystemPrompt } = useCharacterStore.getState()
refreshSystemPrompt()
```

- [ ] **Step 3: Update reset to also refresh system prompt**

In the `reset` action (line 83), after clearing the state, also refresh:

```js
reset: () => {
  set({ summarizeText: '', active: false, snapshots: [] })
  useCharacterStore.getState().refreshSystemPrompt()
},
```

- [ ] **Step 4: Verify the file runs without errors**

Run: `npm run dev`
Expected: Dev server starts without import errors or runtime crashes.

- [ ] **Step 5: Commit**

```powershell
git add app/store/useMemoryStore.js; git commit -m "feat(memory): add summarizeInterval, refresh system prompt after generation"
```

---

### Task 2: Update page.js — Use configurable summarizeInterval

**Files:**
- Modify: `app/page.js`

- [ ] **Step 1: Import summarizeInterval from memory store**

Change line 29 from:
```js
const { autoSummarize, generateSummary } = useMemoryStore();
```
to:
```js
const { autoSummarize, generateSummary, summarizeInterval } = useMemoryStore();
```

- [ ] **Step 2: Use summarizeInterval in the useEffect**

Change the auto-summarize useEffect (lines 40-45) from:
```js
useEffect(() => {
  if (autoSummarize && messageCount > 0 && messageCount % 10 === 0) {
    console.log("Auto-summarizing...");
    generateSummary();
  }
}, [messageCount, autoSummarize, generateSummary]);
```
to:
```js
useEffect(() => {
  if (autoSummarize && messageCount > 0 && messageCount % summarizeInterval === 0) {
    console.log("Auto-summarizing...");
    generateSummary();
  }
}, [messageCount, autoSummarize, generateSummary, summarizeInterval]);
```

- [ ] **Step 3: Commit**

```powershell
git add app/page.js; git commit -m "feat(memory): use configurable summarizeInterval for auto-summarize"
```

---

### Task 3: Rebuild MemoryModal UI

**Files:**
- Rewrite: `app/components/modal/MemoryModal.jsx`

- [ ] **Step 1: Rewrite MemoryModal.jsx with sidebar-nav layout**

Replace the entire contents of `app/components/modal/MemoryModal.jsx` with:

```jsx
'use client'
import React, { useState, useEffect } from 'react'
import {
  X, Save, History, Settings, Brain, RotateCcw,
  Trash2, AlertTriangle, FileText, Sparkles, Timer
} from 'lucide-react'

import useMemoryStore from '@/app/store/useMemoryStore'
import useCharacterStore from '@/app/store/useCharacterStore'
import usePromptStore from '@/app/store/usePromptStore'

export default function MemoryModal() {
  const {
    modal, setModal,
    summarizeText, setSummarizeText,
    loading,
    generateSummary,
    active, setActive,
    reset,
    autoSummarize, setAutoSummarize,
    summarizeInterval, setSummarizeInterval,
    memoryPrompt, setMemoryPrompt,
    snapshots, restoreSnapshot, deleteSnapshot
  } = useMemoryStore()

  const refreshSystemPrompt = useCharacterStore(state => state.refreshSystemPrompt)
  const activePromptContent = usePromptStore(state => state.getActivePromptContent())

  const [activeTab, setActiveTab] = useState('memory')
  const [hasMemoryPlaceholder, setHasMemoryPlaceholder] = useState(true)

  useEffect(() => {
    setHasMemoryPlaceholder(activePromptContent.includes('{{memory}}'))
  }, [activePromptContent])

  const handleSave = () => {
    setActive(true)
    refreshSystemPrompt()
    setModal(false)
  }

  const handleReset = () => {
    reset()
    setModal(false)
  }

  const navItems = [
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'history', label: 'History', icon: History },
  ]

  if (!modal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl h-[85vh] md:h-[600px] bg-[#0d0d0d]/90 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-48 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 flex flex-row md:flex-col p-2 md:p-4 shrink-0 items-center md:items-stretch overflow-x-auto scrollbar-hide">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-2 px-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3A9E49] to-[#2d7a39] flex items-center justify-center shadow-lg shadow-[#3A9E49]/20">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-[#f2f2f2] tracking-tight">Memory</span>
          </div>

          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 mb-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#3A9E49] animate-pulse' : 'bg-yellow-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-[#3A9E49]' : 'text-yellow-500'}`}>
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <nav className="flex flex-row md:flex-col gap-1.5 flex-1 min-w-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2 md:py-2.5 rounded-xl text-sm font-medium transition-all group whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-[#3A9E49]/10 text-[#3A9E49] border border-[#3A9E49]/20 shadow-inner'
                    : 'text-[#8e8e8e] hover:text-[#f2f2f2] hover:bg-white/5'
                }`}
              >
                <item.icon size={16} className={activeTab === item.id ? 'text-[#3A9E49]' : 'group-hover:text-[#f2f2f2]'} />
                <span className="md:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="hidden md:flex flex-col gap-1.5 mt-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all"
            >
              <Trash2 size={14} />
              <span>Reset All</span>
            </button>
            <button
              onClick={() => setModal(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8e8e8e] hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden">
          {/* Header */}
          <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 shrink-0">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 capitalize">
              {activeTab === 'memory' && 'Memory Content'}
              {activeTab === 'config' && 'Configuration'}
              {activeTab === 'history' && 'Snapshots'}
            </h2>
            <div className="flex gap-2 items-center">
              {/* Mobile status */}
              <div className="md:hidden flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#3A9E49] animate-pulse' : 'bg-yellow-500'}`} />
                <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-[#3A9E49]' : 'text-yellow-500'}`}>
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {summarizeText && (
                <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#656565] font-bold">
                  {summarizeText.length} chars
                </div>
              )}
            </div>
          </header>

          {/* Warning Banner */}
          {!hasMemoryPlaceholder && (
            <div className="flex items-start gap-3 px-4 md:px-6 py-3 bg-yellow-500/5 border-b border-yellow-500/10 animate-in slide-in-from-top-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-yellow-500" />
              <span className="text-[11px] text-yellow-500/80 leading-relaxed">
                <strong>Missing placeholder:</strong> Add <code className="bg-yellow-500/10 px-1 rounded text-yellow-400">{'{{memory}}'}</code> to your System Prompt for memory injection.
              </span>
            </div>
          )}

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
            <div className="max-w-md mx-auto animate-in slide-in-from-bottom-2 duration-300">

              {/* Memory Tab */}
              {activeTab === 'memory' && (
                <div className="flex flex-col gap-4 h-full">
                  <div className="space-y-2 group">
                    <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#656565] group-focus-within:text-[#3A9E49] transition-colors flex items-center gap-2">
                      <Brain size={12} />
                      Memory Block
                    </label>
                    <textarea
                      className="w-full min-h-[320px] md:min-h-[360px] bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f2f2f2] placeholder:text-[#454545] focus:border-[#3A9E49]/50 focus:bg-[#3A9E49]/5 outline-none transition-all font-mono resize-none leading-relaxed"
                      value={summarizeText}
                      onChange={(e) => setSummarizeText(e.target.value)}
                      placeholder="Memory is empty. Generate one or type manually..."
                      spellCheck={false}
                      disabled={loading}
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateSummary}
                    disabled={loading}
                    className={`w-full py-3 md:py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                      loading
                        ? 'bg-white/5 text-[#656565] cursor-not-allowed border border-white/5'
                        : 'bg-[#3A9E49] text-white hover:bg-[#43b654] shadow-lg shadow-[#3A9E49]/20 border border-white/10'
                    }`}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {loading ? 'Generating...' : 'Generate Summary'}
                  </button>
                </div>
              )}

              {/* Config Tab */}
              {activeTab === 'config' && (
                <div className="space-y-6 md:space-y-8">
                  {/* Auto-Summarize Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-[#f2f2f2]">Auto-Summarize</span>
                      <span className="text-[10px] text-[#656565]">Automatically update memory during chat</span>
                    </div>
                    <button
                      onClick={() => setAutoSummarize(!autoSummarize)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        autoSummarize ? 'bg-[#3A9E49]' : 'bg-[#333]'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        autoSummarize ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Summarize Interval */}
                  <div className="space-y-3 group">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e] transition-colors group-hover:text-[#3A9E49]">
                          Message Interval
                        </label>
                        <Timer size={12} className="text-[#333] hover:text-[#3A9E49] cursor-help transition-colors" />
                      </div>
                      <span className="text-[11px] md:text-xs font-bold font-mono text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                        {summarizeInterval}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={summarizeInterval}
                      onChange={(e) => setSummarizeInterval(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer outline-none accent-[#3A9E49] hover:accent-[#43b654] transition-all"
                    />
                    <div className="flex justify-between text-[8px] md:text-[9px] text-[#454545] font-bold uppercase tracking-widest px-0.5">
                      <span>Frequent</span>
                      <span>Balanced</span>
                      <span>Rare</span>
                    </div>
                  </div>

                  {/* Memory Prompt Editor */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#656565] group-focus-within:text-[#3A9E49] transition-colors flex items-center gap-2">
                      <FileText size={12} />
                      Generation Prompt
                    </label>
                    <p className="text-[9px] md:text-[10px] text-[#656565] px-1 italic">
                      Instructions for the AI on how to summarize and structure the memory.
                    </p>
                    <textarea
                      className="w-full min-h-[280px] bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#a1a1a1] placeholder:text-[#454545] focus:border-[#3A9E49]/50 focus:bg-[#3A9E49]/5 outline-none transition-all font-mono resize-none leading-relaxed"
                      value={memoryPrompt}
                      onChange={(e) => setMemoryPrompt(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="flex flex-col gap-3">
                  {snapshots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#656565] gap-3">
                      <History size={48} strokeWidth={1} className="opacity-30" />
                      <p className="text-sm">No snapshots yet.</p>
                      <p className="text-[10px] text-[#454545]">Snapshots are saved automatically after generation.</p>
                    </div>
                  ) : (
                    snapshots.map((snap) => (
                      <div key={snap.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col gap-3 group hover:border-[#3A9E49]/20 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#f2f2f2]">
                              {new Date(snap.timestamp).toLocaleString()}
                            </span>
                            <span className="text-[9px] text-[#656565] font-mono mt-0.5">
                              {snap.content.length} chars
                            </span>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => restoreSnapshot(snap.id)}
                              className="p-2 text-[#3A9E49] hover:bg-[#3A9E49]/10 rounded-lg transition-colors"
                              title="Restore this version"
                            >
                              <RotateCcw size={14} />
                            </button>
                            <button
                              onClick={() => deleteSnapshot(snap.id)}
                              className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-[11px] text-[#8e8e8e] line-clamp-2 font-mono bg-black/20 p-3 rounded-lg border border-white/5">
                          {snap.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </main>

          {/* Sticky Save Button */}
          <div className="px-4 md:px-6 py-3 border-t border-white/5 bg-[#0d0d0d]/80 backdrop-blur-sm shrink-0">
            <div className="max-w-md mx-auto flex gap-3">
              {/* Mobile-only reset and close */}
              <button
                onClick={handleReset}
                className="md:hidden p-2.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors border border-white/5"
                title="Reset All"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setModal(false)}
                className="md:hidden p-2.5 text-[#8e8e8e] hover:text-white hover:bg-white/5 rounded-xl transition-colors border border-white/5"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSave}
                disabled={!summarizeText}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  !summarizeText
                    ? 'bg-white/5 text-[#454545] cursor-not-allowed border border-white/5'
                    : 'bg-[#3A9E49] text-white hover:bg-[#43b654] shadow-lg shadow-[#3A9E49]/20 border border-white/10'
                }`}
              >
                <Save size={16} />
                Save & Activate
              </button>
            </div>
          </div>

          {/* Footer Blur Edge */}
          <div className="h-0 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify dev server runs and modal renders**

Run: `npm run dev`
Expected: Dev server starts. Open the Memory Modal from the chat page. The new sidebar-nav layout should render with Memory, Config, and History tabs.

- [ ] **Step 3: Commit**

```powershell
git add app/components/modal/MemoryModal.jsx; git commit -m "feat(memory): rebuild MemoryModal with sidebar-nav glassmorphic UI"
```

---

### Task 4: Integration Verification

- [ ] **Step 1: Full flow test — Manual memory**

1. Open the app (`npm run dev`)
2. Open Memory Manager modal
3. Type some text into the Memory Content textarea
4. Click "Save & Activate"
5. Open Debug Modal — verify the system prompt contains the memory text where `{{memory}}` was
6. Edit the memory text in the modal and click "Save & Activate" again
7. Verify the system prompt updated with the new text (not the old one baked in)

Expected: Memory updates dynamically each time you save.

- [ ] **Step 2: Full flow test — Generated memory**

1. Ensure API key and model are configured
2. Have a few messages in the chat
3. Open Memory Manager, click "Generate Summary"
4. Wait for generation to complete
5. Verify the textarea populates and a snapshot appears in History tab
6. Click "Save & Activate"
7. Check Debug Modal — system prompt should contain the generated memory

Expected: Generation works, auto-saves snapshot, and injects into prompt.

- [ ] **Step 3: Full flow test — Auto-summarize**

1. Open Memory Manager → Config tab
2. Enable Auto-Summarize toggle
3. Set interval to 5 (for easy testing)
4. Close modal
5. Send 5 messages in chat
6. Open Memory Manager — summarizeText should be populated
7. Check Debug Modal — system prompt should contain the memory

Expected: Auto-summarize fires at the configured interval and refreshes the system prompt.

- [ ] **Step 4: Final commit**

```powershell
git add -A; git commit -m "feat(memory): complete Memory Manager rebuild"
```
