# Placeholder Status Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-time panel showing which prompt placeholders (`{{char}}`, `{{user}}`, `{{lorebook}}`, etc.) are included in each API call, with status indicators and token counts.

**Architecture:** A new `PlaceholderStatusPanel` component reads captured placeholder analysis data from an enhanced `useDebugStore`. Before each API call in `SuperInput.jsx`, placeholder data is analyzed and stored. The panel sits above the chat input, toggled via a new menu item in `InputMenu.jsx`.

**Tech Stack:** React (Next.js 15 App Router), Zustand, Tailwind CSS v4, lucide-react icons

---

### Task 1: Enhance `useDebugStore` with placeholder data fields

**Files:**
- Modify: `app/store/useDebugStore.js`

- [ ] **Step 1: Add `placeholderData` field and actions to `useDebugStore`**

Add two new fields to the store state (`placeholderData: null`, `isPlaceholderPanelOpen: false`) and two actions (`setPlaceholderData`, `clearPlaceholderData`, `togglePlaceholderPanel`). These are NOT persisted (do not add to `persist` middleware).

```js
// Add to the (set, get) => ({ ... }) object, alongside existing fields:

      placeholderData: null,
      isPlaceholderPanelOpen: false,

      setPlaceholderData: (data) => set({ placeholderData: data }),

      clearPlaceholderData: () => set({ placeholderData: null }),

      togglePlaceholderPanel: () => set((state) => ({
        isPlaceholderPanelOpen: !state.isPlaceholderPanelOpen
      })),
```

The `placeholderData` field will hold an object with this shape:
```js
{
  timestamp: Date.now(),
  rawTemplate: '',
  resolvedTemplate: '',
  placeholders: {
    char: { inTemplate: true, hasContent: true, value: 'Hayeon', tokenCount: 1 },
    lorebook: { inTemplate: false, hasContent: true, value: '[Lorebook]...', tokenCount: 89 },
    // ... etc for each PROMPT_VARIABLE
  }
}
```

Place these new fields/actions after `toggleEnabled` and before the closing of the `(set, get) => ({ ... })` object.

- [ ] **Step 2: Verify the store still works**

Run: `npm run dev`
Expected: Dev server starts without errors. The store loads normally.

- [ ] **Step 3: Commit**

```bash
git add app/store/useDebugStore.js
git commit -m "feat: add placeholderData fields and actions to useDebugStore"
```

---

### Task 2: Create `PlaceholderStatusPanel.jsx` component

**Files:**
- Create: `app/components/PlaceholderStatusPanel.jsx`

- [ ] **Step 1: Create the panel component**

```jsx
"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import useDebugStore from "../store/useDebugStore";

function getStatusIcon(inTemplate, hasContent) {
  if (inTemplate && hasContent) return { icon: "✅", color: "text-green-400" };
  if (inTemplate && !hasContent) return { icon: "⚠️", color: "text-yellow-400" };
  if (!inTemplate && !hasContent) return { icon: "❌", color: "text-red-400" };
  // !inTemplate && hasContent — content exists but template doesn't use it
  return { icon: "⚠️", color: "text-orange-400" };
}

function getStatusLabel(inTemplate, hasContent) {
  if (inTemplate && hasContent) return "Sent to API";
  if (inTemplate && !hasContent) return "In template, but empty";
  if (!inTemplate && !hasContent) return "Not in template";
  return "Has content, but not in template";
}

function formatValue(value, tokenCount) {
  if (!value || !value.trim()) return "(empty)";
  const preview = value.length > 60 ? value.slice(0, 60) + "..." : value;
  return `"${preview}" (${tokenCount} tokens)`;
}

export default function PlaceholderStatusPanel() {
  const { placeholderData, isPlaceholderPanelOpen, togglePlaceholderPanel, clearPlaceholderData } = useDebugStore();
  const [expanded, setExpanded] = useState(true);

  if (!isPlaceholderPanelOpen) return null;

  // Count placeholders for the collapsed badge
  const placeholderCount = placeholderData
    ? Object.keys(placeholderData.placeholders || {}).length
    : 0;

  return (
    <div className="w-full max-w-xl bg-[#1a1a1a] border border-[#333] rounded-xl p-0 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#d9d9d9]">Placeholder Status</span>
          {placeholderCount > 0 && (
            <span className="text-xs bg-[#333] text-[#8e8e8e] px-1.5 py-0.5 rounded">
              {placeholderCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-[#333] rounded transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={14} className="text-[#8e8e8e]" /> : <ChevronUp size={14} className="text-[#8e8e8e]" />}
          </button>
          <button
            onClick={togglePlaceholderPanel}
            className="p-1 hover:bg-[#333] rounded transition-colors"
            title="Close panel"
          >
            <X size={14} className="text-[#8e8e8e]" />
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-3 py-2">
          {!placeholderData ? (
            <p className="text-xs text-[#656565] py-2">Send a message to see placeholder status</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(placeholderData.placeholders).map(([name, data]) => {
                const { icon, color } = getStatusIcon(data.inTemplate, data.hasContent);
                const label = getStatusLabel(data.inTemplate, data.hasContent);
                return (
                  <div
                    key={name}
                    className="flex items-start gap-2 py-1.5 text-xs"
                    title={label}
                  >
                    <span className="flex-shrink-0">{icon}</span>
                    <code className="flex-shrink-0 text-[#5f9fdb] font-mono min-w-[160px]">
                      {`{{${name}}}`}
                    </code>
                    <span className={`flex-shrink-0 ${color}`}>
                      {label}
                    </span>
                    <span className="text-[#8e8e8e] truncate">
                      {formatValue(data.value, data.tokenCount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/PlaceholderStatusPanel.jsx
git commit -m "feat: create PlaceholderStatusPanel component with status logic
- Shows ✅ green for placeholder in template with content
- Shows ⚠️ yellow for placeholder in template but empty
- Shows ❌ red for placeholder not in template, no content
- Shows ⚠️ orange for content exists but template doesn't use it
- Collapsible panel with toggle"
```

---

### Task 3: Add panel toggle to `InputMenu.jsx`

**Files:**
- Modify: `app/components/InputMenu.jsx`

- [ ] **Step 1: Add the "Placeholder Status" menu item**

Add a new menu item with an `Eye` icon. Import `Eye` from lucide-react and add a callback prop `onTogglePlaceholderPanel` passed from `SuperInput`.

Add to imports:
```js
import {
  Settings2,
  CodeXml,
  Brain,
  User,
  FileText,
  Image,
  Braces,
  Asterisk,
  Regex,
  Cable,
  Bug,
  BookOpen,
  Eye,
} from "lucide-react";
```

Add to component props destructuring:
```js
export default function InputMenu({
  setIsCustomPromptOpen,
  setIsDebugModalOpen,
  setIsPersonaModalOpen,
  onTogglePlaceholderPanel,
}) {
```

Add a new menu item **after** the "Persona" item in the `menuItems` array:
```js
    {
      icon: <Eye size={18} />,
      label: "Placeholder Status",
      onClick: () => {
        onTogglePlaceholderPanel?.();
        setIsOpen(false);
      },
    },
```

- [ ] **Step 2: Commit**

```bash
git add app/components/InputMenu.jsx
git commit -m "feat: add Placeholder Status toggle to InputMenu"
```

---

### Task 4: Wire panel into `SuperInput.jsx`

**Files:**
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Import the panel and store methods**

Add the import for `PlaceholderStatusPanel`:
```js
import PlaceholderStatusPanel from "./PlaceholderStatusPanel";
```

Add the store selector after existing store selectors:
```js
  const togglePlaceholderPanel = useDebugStore((state) => state.togglePlaceholderPanel);
```

- [ ] **Step 2: Render the panel above the input**

In the JSX, add the `PlaceholderStatusPanel` component **before** the main input container `<div className="w-full max-w-xl bg-[#212121]/80...">`. The `<footer>` should look like:

```jsx
    <footer className="flex flex-col items-center w-full lg:p-4">
      <PlaceholderStatusPanel />
      <div className="w-full max-w-xl bg-[#212121]/80 border border-[#282828] lg:rounded-2xl rounded-t-2xl p-4 flex flex-col gap-3">
        {/* existing textarea and controls */}
```

- [ ] **Step 3: Pass the toggle callback to InputMenu**

Update the `<InputMenu>` component call to include the new prop:
```jsx
            <InputMenu
              setIsCustomPromptOpen={setIsCustomPromptOpen}
              setIsDebugModalOpen={setIsDebugModalOpen}
              setIsPersonaModalOpen={setIsPersonaModalOpen}
              onTogglePlaceholderPanel={togglePlaceholderPanel}
            />
```

- [ ] **Step 4: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: wire PlaceholderStatusPanel into SuperInput"
```

---

### Task 5: Capture placeholder data before API call in `SuperInput.jsx`

**Files:**
- Modify: `app/components/SuperInput.jsx`
- Reference: `app/utils/replacerTemplate.js` (for `PROMPT_VARIABLES`, `replacePlaceholders`, `buildPlaceholderValues`)

- [ ] **Step 1: Add the `countTokens` helper**

Add this helper function **before** the `SuperInput` component definition (around line 18, after the imports):

```js
function countTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.3);
}
```

- [ ] **Step 2: Import `PROMPT_VARIABLES`**

Update the existing import from `replacerTemplate`:
```js
import { replacePlaceholders, buildPlaceholderValues, PROMPT_VARIABLES } from "../utils/replacerTemplate"
```

- [ ] **Step 3: Build and store placeholder data before the API call**

In `handleMessage`, **after** the line:
```js
      const processedPrompt = replacePlaceholders(promptContent, values);
```

and **before** the line:
```js
      // Update the system prompt in the character store
```

Add the placeholder analysis code:
```js
      // Analyze placeholders and store in debug store
      const placeholdersAnalysis = {};
      for (const variable of PROMPT_VARIABLES) {
        const name = variable.replace(/{{|}}/g, '');
        const inTemplate = promptContent.includes(variable);
        const contentValue = values[name] || '';
        const hasContent = contentValue.trim().length > 0;
        placeholdersAnalysis[name] = {
          inTemplate,
          hasContent,
          value: contentValue,
          tokenCount: countTokens(contentValue),
        };
      }

      const resolvedTemplate = replacePlaceholders(promptContent, values);
      useDebugStore.getState().setPlaceholderData({
        timestamp: Date.now(),
        rawTemplate: promptContent,
        resolvedTemplate,
        placeholders: placeholdersAnalysis,
      });
```

This captures the state of every placeholder right before the API call fires, so the panel updates with fresh data.

- [ ] **Step 4: Verify the dev server shows the panel after sending a message**

Run: `npm run dev`
Expected: After sending a message, the Placeholder Status panel appears (if open) showing each placeholder's status.

- [ ] **Step 5: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: capture placeholder analysis before each API call
- Analyzes each PROMPT_VARIABLE against raw template and resolved values
- Stores analysis in useDebugStore for panel rendering
- Updates panel data on every message send"
```

---

### Task 6: Export `PlaceholderStatusPanel` from barrel file

**Files:**
- Modify: `app/components/index.js`

- [ ] **Step 1: Add the export**

```js
export { default as PlaceholderStatusPanel } from './PlaceholderStatusPanel';
```

Add this line to the existing barrel export file:
```js
export { ChatList } from './chat';
export { CharacterModal, ApiSettingsModal, MemoryModal, DebugModal } from './modal';
export { default as SuperInput } from './SuperInput';
export { default as PlaceholderStatusPanel } from './PlaceholderStatusPanel';
```

- [ ] **Step 2: Commit**

```bash
git add app/components/index.js
git commit -m "chore: export PlaceholderStatusPanel from barrel file"
```

---

### Task 7: Clear placeholder data when character is switched

**Files:**
- Modify: `app/store/useCharacterStore.js` (the `setCharacter` action or character switching logic)

- [ ] **Step 1: Find where character switching happens and add `clearPlaceholderData` call**

In `useCharacterStore.js`, find the `setCharacter` action (or wherever the active character is changed). Add a call to clear placeholder data when the character changes:

```js
import useDebugStore from './useDebugStore';
```

Then in the `setCharacter` action body, add:
```js
useDebugStore.getState().clearPlaceholderData();
```

This ensures stale data from a previous character doesn't linger in the panel.

If `setCharacter` is complex, look for the specific line where `state.character` is reassigned and add the clear call right after.

- [ ] **Step 2: Commit**

```bash
git add app/store/useCharacterStore.js
git commit -m "feat: clear placeholder data when character is switched"
```

---

## Self-Review

### 1. Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| New `PlaceholderStatusPanel.jsx` component | Task 2 |
| Collapsed state: `[🔍 Placeholders (7)]` button | Task 2 (shows count badge in header) |
| Expanded state: status rows with icon, name, value | Task 2 |
| 3-part status logic (4 status combinations) | Task 2 (`getStatusIcon`, `getStatusLabel`) |
| `useDebugStore` enhancement with `placeholderData` | Task 1 |
| `setPlaceholderData` / `clearPlaceholderData` actions | Task 1 |
| Data capture flow in `SuperInput.jsx` | Task 5 |
| Toggle button in `InputMenu.jsx` | Task 3 |
| Panel rendered above chat input | Task 4 |
| Barrel file export | Task 6 |
| Token counting (word-based approximation) | Task 5 (reuses `countTokens` pattern from DebugModal) |
| "Send a message to see placeholder status" when no data | Task 2 |
| Clear on character switch | Task 7 |

All spec requirements covered.

### 2. Placeholder Scan

No TBD, TODO, or incomplete references found. All code steps contain actual implementations.

### 3. Type/Name Consistency

- `PROMPT_VARIABLES` — imported from `replacerTemplate.js`, matches the array exported there
- `buildPlaceholderValues` — imported from `replacerTemplate.js`, matches the function exported there
- `replacePlaceholders` — imported from `replacerTemplate.js`, matches
- `useDebugStore` — store name matches existing file
- `setPlaceholderData`, `clearPlaceholderData`, `togglePlaceholderPanel` — action names defined in Task 1, used in Tasks 2, 4, 5, 7
- `countTokens` — local helper in Task 5, same algorithm as `DebugModal.jsx`
- `placeholderData.placeholders` keys use the bare name (e.g., `char` not `{{char}}`) — consistent between Task 1 (store shape), Task 2 (renders `{{${name}}}`), and Task 5 (analysis builds with `.replace(/{{|}}/g, '')`)

All consistent.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-14-placeholder-status-panel.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
