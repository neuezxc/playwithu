# Prompt Manager Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Prompt Manager from scratch — new data model, single replacement engine, refreshed UI with preview mode and token counting.

**Architecture:** Replace parallel-array prompt store with an object-per-prompt model using ID-based selection. Consolidate two duplicate replacement engines into one shared utility. Rewrite the CustomPromptModal with an editor toolbar, preview toggle, and token counter while keeping the sidebar + editor layout and existing design tokens.

**Tech Stack:** Next.js 15, React 19, Zustand 5 (persisted), Tailwind CSS v4, Lucide React

**Spec:** `docs/superpowers/specs/2026-04-13-prompt-manager-rebuild-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Rewrite | `app/store/usePromptStore.js` | New prompt data model, CRUD actions, migration logic |
| Update | `app/utils/replacerTemplate.js` | Rename exports, add `buildPlaceholderValues()` helper |
| Update | `app/store/useCharacterStore.js` | Remove internal `replacerTemplate`, use shared utility |
| Rewrite | `app/components/modal/CustomPromptModal.jsx` | New UI with preview, token count, toolbar |
| Update | `app/components/SuperInput.jsx` | Use new store API + `buildPlaceholderValues()` |
| Update | `app/page.js` | Update prompt store subscription |
| Update | `app/components/modal/MemoryModal.jsx` | Update prompt store subscription |

---

### Task 1: Update the Replacement Engine (`replacerTemplate.js`)

**Files:**
- Modify: `app/utils/replacerTemplate.js`

- [ ] **Step 1: Rewrite `replacerTemplate.js` with new exports**

Replace the entire file with:

```js
import useCharacterStore from '../store/useCharacterStore'
import useUserStore from '../store/useUserStore'
import useMemoryStore from '../store/useMemoryStore'

export const PROMPT_VARIABLES = [
  '{{char}}',
  '{{user}}',
  '{{char_description}}',
  '{{user_description}}',
  '{{scenario}}',
  '{{memory}}',
  '{{tools}}'
]

export function replacePlaceholders(template, values) {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value || '')
  }
  return result
}

export function buildPlaceholderValues() {
  const { character, patternReplacements } = useCharacterStore.getState()
  const { user } = useUserStore.getState()
  const { summarizeText } = useMemoryStore.getState()

  return {
    char: character?.name || '',
    user: user?.name || '',
    char_description: character?.description || '',
    user_description: user?.description || '',
    scenario: character?.scenario || '',
    memory: summarizeText || '',
    tools: patternReplacements
      .filter(p => p.active && p.prompt)
      .map(p => p.prompt)
      .join('\n')
  }
}
```

- [ ] **Step 2: Verify no import errors**

Run: `npm run build`
Expected: Build may fail because consumers still import old names — that's expected and fixed in later tasks.

- [ ] **Step 3: Commit**

```
git add app/utils/replacerTemplate.js
git commit -m "refactor: consolidate replacement engine with buildPlaceholderValues helper"
```

---

### Task 2: Rewrite the Prompt Store (`usePromptStore.js`)

**Files:**
- Rewrite: `app/store/usePromptStore.js`

- [ ] **Step 1: Write the new store**

Replace the entire file with:

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEFAULT_SYSTEM_PROMPT = `You are roleplaying as {{char}}, The user is roleplaying as {{user}} Talk to {{user}} in simple english, everyday language, even adding casual quirks without any robotic, formal, or poetic fluff. Generate autonomous, open-ended roleplay. before sending; reject any response that breaks rules and regenerate until correct.

Treat formatting as code rules: Dialogue="text", Actions=*text*, Thoughts=\`text\`

<Characters>
  <{{char}}>
    {{char_description}}
<Tools>
{{tools}}
</Tools>
  </{{char}}>
  <{{user}}>
    {{user_description}}
  </{{user}}>
  <Scenario>
    {{scenario}}
  </Scenario>
  <Memory>
    {{memory}}
  </Memory>
</Characters>

[Roleplay Methodology]:
  - Be Proactive: Drive the scene forward with open-ended actions, dialogue, and reactions. Do not wait for {{user}} to lead every time.
  - Stay in Character: Your responses must be 100% from {{char}}'s perspective using their knowledge and personality.
  - Never Speak For {{user}}: Do not describe {{user}}'s actions, feelings, thoughts, or dialogue. Only describe your own.
  - Show, Don't Tell: Instead of saying "I am happy," show it through action and dialogue: "A huge grin breaks out on my face. 'Dude, that's awesome!'"
  - Focus on Interaction: Prioritize dialogue and interaction with {{user}} over lengthy environmental descriptions.

Stay in character as {{char}}`

const usePromptStore = create(
  persist(
    (set, get) => ({
      prompts: [
        {
          id: 'default',
          name: 'Default Prompt',
          content: DEFAULT_SYSTEM_PROMPT,
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      activePromptId: 'default',

      // --- Actions ---

      addPrompt: (name, content) => {
        const newPrompt = {
          id: Date.now().toString(),
          name: name || `Prompt ${get().prompts.length}`,
          content: content || '',
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        set(state => ({
          prompts: [...state.prompts, newPrompt]
        }))
        return newPrompt.id
      },

      updatePrompt: (id, changes) => {
        set(state => ({
          prompts: state.prompts.map(p =>
            p.id === id ? { ...p, ...changes, updatedAt: Date.now() } : p
          )
        }))
      },

      deletePrompt: (id) => {
        const prompt = get().prompts.find(p => p.id === id)
        if (!prompt || prompt.isDefault) return // Cannot delete default

        set(state => ({
          prompts: state.prompts.filter(p => p.id !== id),
          // If deleting the active prompt, fall back to default
          activePromptId: state.activePromptId === id ? 'default' : state.activePromptId
        }))
      },

      duplicatePrompt: (id) => {
        const source = get().prompts.find(p => p.id === id)
        if (!source) return

        const newPrompt = {
          id: Date.now().toString(),
          name: `${source.name} (Copy)`,
          content: source.content,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        set(state => ({
          prompts: [...state.prompts, newPrompt]
        }))
        return newPrompt.id
      },

      setActivePrompt: (id) => {
        const exists = get().prompts.find(p => p.id === id)
        if (exists) {
          set({ activePromptId: id })
        }
      },

      resetDefaultPrompt: () => {
        set(state => ({
          prompts: state.prompts.map(p =>
            p.isDefault ? { ...p, content: DEFAULT_SYSTEM_PROMPT, updatedAt: Date.now() } : p
          )
        }))
      },

      getActivePrompt: () => {
        const { prompts, activePromptId } = get()
        return prompts.find(p => p.id === activePromptId)
          || prompts.find(p => p.isDefault)
          || prompts[0]
      },

      getActivePromptContent: () => {
        const prompt = get().getActivePrompt()
        return prompt?.content || ''
      },

      // Backward compat alias — remove after all consumers migrate
      getEffectivePrompt: () => {
        return get().getActivePromptContent()
      }
    }),
    {
      name: 'prompt-storage',
      version: 2,
      migrate: (persistedState, version) => {
        // Migration from v1 (parallel arrays) to v2 (object array)
        if (version === 0 || version === 1 || version === undefined) {
          const oldPrompts = persistedState.custom_prompts || []
          const oldNames = persistedState.prompt_names || []
          const oldSelectedIndex = persistedState.selected_prompt_index ?? -1

          // Build the new prompts array
          const newPrompts = [
            {
              id: 'default',
              name: 'Default Prompt',
              content: persistedState.system_prompt || DEFAULT_SYSTEM_PROMPT,
              isDefault: true,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ]

          // Convert old custom prompts
          const migratedCustom = oldPrompts.map((content, i) => ({
            id: `migrated_${i}_${Date.now()}`,
            name: oldNames[i] || `Prompt ${i + 1}`,
            content: content || '',
            isDefault: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }))

          newPrompts.push(...migratedCustom)

          // Map old selection index to new ID
          let activePromptId = 'default'
          if (oldSelectedIndex >= 0 && oldSelectedIndex < migratedCustom.length) {
            activePromptId = migratedCustom[oldSelectedIndex].id
          }

          return {
            prompts: newPrompts,
            activePromptId
          }
        }
        return persistedState
      }
    }
  )
)

export default usePromptStore
```

- [ ] **Step 2: Verify store loads without errors**

Run: `npm run dev`
Open browser, check console for hydration/store errors.
Expected: No store-related errors (other pages may break until consumers are updated).

- [ ] **Step 3: Commit**

```
git add app/store/usePromptStore.js
git commit -m "feat: rewrite usePromptStore with object-per-prompt model and migration"
```

---

### Task 3: Update `useCharacterStore.js` — Remove Duplicate Engine

**Files:**
- Modify: `app/store/useCharacterStore.js`

- [ ] **Step 1: Replace the internal `replacerTemplate` with the shared utility**

At the top of the file, replace:

```js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import usePromptStore from "./usePromptStore";
import useUserStore from "./useUserStore";
import useApiSettingStore from "./useApiSettingStore";
import useDebugStore from "./useDebugStore";

const replacerTemplate = (template, character, user) => {
  // Get pattern replacement settings from store
  const { patternReplacements = [] } = useCharacterStore.getState();

  const replacements = {
    memory: "",
    char: character?.name || "",
    char_description: character?.description || "",
    user: user?.name || "",
    user_description: user?.description || "",
    scenario: character?.scenario || "",
    tools: patternReplacements
      .filter((p) => p.active && p.prompt)
      .map((p) => p.prompt)
      .join("\n"),
  };

  // First pass: replace all direct placeholders
  let result = template.replace(
    /\{\{\s*(\w+)\s*\}\}/g,
    (match, key) => replacements[key.toLowerCase()] || ""
  );

  // Second pass: replace any nested placeholders that appeared from the first pass
  result = result.replace(
    /\{\{\s*(\w+)\s*\}\}/g,
    (match, key) => replacements[key.toLowerCase()] || ""
  );

  return result.trim();
};
```

With:

```js
import { create } from "zustand"
import { persist } from "zustand/middleware"
import usePromptStore from "./usePromptStore"
import useUserStore from "./useUserStore"
import useApiSettingStore from "./useApiSettingStore"
import useDebugStore from "./useDebugStore"
import { replacePlaceholders, buildPlaceholderValues } from "../utils/replacerTemplate"
```

- [ ] **Step 2: Update `initializeMessage` (line ~122-154)**

Replace all uses of `replacerTemplate(template, character, user)` with the shared utility. Change `initializeMessage`:

```js
      initializeMessage: () => {
        if (get().isInitialized) return
        const promptContent = usePromptStore.getState().getActivePromptContent()
        const values = buildPlaceholderValues()
        const processedPrompt = replacePlaceholders(promptContent, values)
        const currentFirstMessage = replacePlaceholders(
          get().character.firstMessage,
          values
        )

        const newMessages = [
          { role: "system", content: processedPrompt },
          { role: "assistant", content: currentFirstMessage }
        ]
        set(state => ({
          character: { ...state.character, messages: newMessages },
          isInitialized: true
        }))
      },
```

- [ ] **Step 3: Update `resetMessage` (line ~156-186)**

```js
      resetMessage: () => {
        const promptContent = usePromptStore.getState().getActivePromptContent()
        const values = buildPlaceholderValues()
        const processedPrompt = replacePlaceholders(promptContent, values)
        const currentFirstMessage = replacePlaceholders(
          get().character.firstMessage,
          values
        )

        const newMessages = [
          { role: "system", content: processedPrompt },
          { role: "assistant", content: currentFirstMessage }
        ]
        set(state => ({
          character: { ...state.character, messages: newMessages }
        }))
      },
```

- [ ] **Step 4: Update `updateSystemPrompt` (line ~188-206)**

```js
      updateSystemPrompt: (newPromptContent) => {
        const values = buildPlaceholderValues()
        const processedPrompt = replacePlaceholders(newPromptContent, values)

        set(state => ({
          character: {
            ...state.character,
            messages: state.character.messages.map(message => {
              if (message.role === "system") {
                return { ...message, content: processedPrompt }
              }
              return message
            })
          }
        }))
      },
```

- [ ] **Step 5: Update `refreshSystemPrompt` (line ~207-210)**

```js
      refreshSystemPrompt: () => {
        const promptContent = usePromptStore.getState().getActivePromptContent()
        get().updateSystemPrompt(promptContent)
      },
```

- [ ] **Step 6: Update `setActiveCharacter` (line ~579-619)**

```js
      setActiveCharacter: (characterId) =>
        set(state => {
          const selectedCharacter = state.characters.find(
            char => char.id === characterId
          )
          if (selectedCharacter) {
            const promptContent = usePromptStore.getState().getActivePromptContent()

            // Build values with the selected character's data
            const { user } = useUserStore.getState()
            const { summarizeText } = useMemoryStore.getState()
            const values = {
              char: selectedCharacter?.name || '',
              user: user?.name || '',
              char_description: selectedCharacter?.description || '',
              user_description: user?.description || '',
              scenario: selectedCharacter?.scenario || '',
              memory: summarizeText || '',
              tools: state.patternReplacements
                .filter(p => p.active && p.prompt)
                .map(p => p.prompt)
                .join('\n')
            }

            const processedPrompt = replacePlaceholders(promptContent, values)
            const processedFirstMessage = replacePlaceholders(
              selectedCharacter.firstMessage,
              values
            )

            const newMessages = [
              { role: "system", content: processedPrompt },
              { role: "assistant", content: processedFirstMessage }
            ]

            return {
              character: { ...selectedCharacter, messages: newMessages },
              isInitialized: true
            }
          }
          return state
        }),
```

Note: `setActiveCharacter` can't use `buildPlaceholderValues()` because it needs the *selected* character's data (not the current one in the store). We build the values inline here.

- [ ] **Step 7: Add missing import for `useMemoryStore`**

At the top of the file, add (if not already present):

```js
import useMemoryStore from "./useMemoryStore"
```

- [ ] **Step 8: Verify the build**

Run: `npm run build`
Expected: Build should pass (or only fail on the modal which hasn't been updated yet).

- [ ] **Step 9: Commit**

```
git add app/store/useCharacterStore.js
git commit -m "refactor: replace duplicate replacerTemplate with shared utility"
```

---

### Task 4: Update `SuperInput.jsx` — Use New APIs

**Files:**
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Update imports (line 10)**

Replace:
```js
import { replacePlaceholders } from "../utils/replacerTemplate";
```

With:
```js
import { replacePlaceholders, buildPlaceholderValues } from "../utils/replacerTemplate"
```

- [ ] **Step 2: Simplify the handleMessage prompt section (lines 72-98)**

Replace the block from `// Get the effective prompt` through `updateSystemPrompt(processedPrompt)`:

```js
      // Get the active prompt content and build placeholder values
      const promptContent = usePromptStore.getState().getActivePromptContent()
      const values = buildPlaceholderValues()
      const processedPrompt = replacePlaceholders(promptContent, values)

      // Update the system prompt in the character store
      const { updateSystemPrompt } = useCharacterStore.getState()
      updateSystemPrompt(processedPrompt)
```

This replaces ~25 lines of manual value-gathering with 4 lines.

- [ ] **Step 3: Verify the chat still works**

Run: `npm run dev`
Open browser, send a test message.
Expected: Chat sends messages, AI responds, system prompt is correctly populated.

- [ ] **Step 4: Commit**

```
git add app/components/SuperInput.jsx
git commit -m "refactor: use buildPlaceholderValues in SuperInput"
```

---

### Task 5: Update `page.js` and `MemoryModal.jsx` — Fix Store Subscriptions

**Files:**
- Modify: `app/page.js`
- Modify: `app/components/modal/MemoryModal.jsx`

- [ ] **Step 1: Update `page.js` (line 28)**

Replace:
```js
  const { system_prompt } = usePromptStore();
```

With:
```js
  const activePromptContent = usePromptStore(state => state.getActivePromptContent())
```

Note: `system_prompt` was destructured but never used in the JSX — it was only subscribed to trigger re-renders. The new store doesn't have a `system_prompt` field, so we need to subscribe to the active prompt content instead (which serves the same re-render purpose).

- [ ] **Step 2: Update `MemoryModal.jsx` — import and subscription (lines 23, 28-30)**

Replace line 23:
```js
  const { system_prompt } = usePromptStore();
```

With:
```js
  const activePromptContent = usePromptStore(state => state.getActivePromptContent())
```

Replace lines 28-30:
```js
  useEffect(() => {
    setHasMemoryPlaceholder(system_prompt.includes("{{memory}}"));
  }, [system_prompt]);
```

With:
```js
  useEffect(() => {
    setHasMemoryPlaceholder(activePromptContent.includes('{{memory}}'))
  }, [activePromptContent])
```

- [ ] **Step 3: Update `MemoryModal.jsx` — handleSave (line 34)**

Replace:
```js
    updateSystemPrompt(system_prompt.replace("{{memory}}", summarizeText));
```

With:
```js
    updateSystemPrompt(activePromptContent.replace('{{memory}}', summarizeText))
```

- [ ] **Step 4: Verify both pages work**

Run: `npm run dev`
- Open app → verify chat page loads without errors
- Open Memory modal → verify the `{{memory}}` placeholder warning works correctly
Expected: No console errors, memory warning appears/disappears correctly.

- [ ] **Step 5: Commit**

```
git add app/page.js app/components/modal/MemoryModal.jsx
git commit -m "fix: update prompt store subscriptions to new API"
```

---

### Task 6: Rewrite `CustomPromptModal.jsx` — New UI

**Files:**
- Rewrite: `app/components/modal/CustomPromptModal.jsx`

- [ ] **Step 1: Write the new modal component**

Replace the entire file with the new implementation:

```jsx
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 md:p-4 overflow-hidden">
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
```

- [ ] **Step 2: Verify the modal opens and works**

Run: `npm run dev`
- Open the app, click the Custom Prompt button in the input menu
- Verify: sidebar shows prompts, editor loads, name editable, content editable
- Verify: preview mode shows resolved placeholders
- Verify: token count updates as you type
- Verify: "Set Active" button works
- Verify: create new, duplicate, delete work
- Verify: save persists changes
Expected: All interactions work without console errors.

- [ ] **Step 3: Commit**

```
git add app/components/modal/CustomPromptModal.jsx
git commit -m "feat: rewrite CustomPromptModal with preview, token counting, and new data model"
```

---

### Task 7: Final Integration Test & Cleanup

**Files:**
- Review: all modified files

- [ ] **Step 1: Full smoke test**

Run: `npm run dev`

Test each scenario:
1. **Fresh start (no localStorage):** Clear `prompt-storage` from localStorage → reload → verify default prompt loads
2. **Migration:** Set old-format data in localStorage manually → reload → verify prompts migrate
3. **Create a custom prompt** → add content with `{{char}}` → set as active → send a chat message → verify the character name appears in the system prompt
4. **Preview mode** → toggle to preview → verify placeholders are resolved
5. **Delete the active prompt** → verify fallback to default
6. **Import/export** → export prompts → delete them → import the file → verify they return
7. **Reset default** → edit the default prompt → click Reset → verify content restores
8. **Memory modal** → verify `{{memory}}` placeholder warning still works

- [ ] **Step 2: Run the build**

Run: `npm run build`
Expected: Build passes with no errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No new lint errors introduced.

- [ ] **Step 4: Final commit**

```
git add -A
git commit -m "chore: prompt manager rebuild complete — cleanup and verification"
```
