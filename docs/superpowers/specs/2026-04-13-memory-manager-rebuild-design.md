# Memory Manager Rebuild — Design Spec

## Summary

Rebuild the Memory Manager with three goals: fix the broken injection mechanism so memory stays a live placeholder, make auto-summarize actually refresh the system prompt after generation, and rebuild the UI to match the sidebar-nav glassmorphic pattern used by ApiSettingsModal.

## Current Problems

1. **Fragile injection**: `MemoryModal.handleSave` does `activePromptContent.replace('{{memory}}', summarizeText)` — a destructive one-shot string replace that bakes memory into the system prompt. After this, `{{memory}}` is gone from the template and can never be updated again without a full reset.
2. **Auto-summarize is broken**: The `useEffect` in `page.js` calls `generateSummary()` every 10 messages, which updates `summarizeText` in the store — but never calls `refreshSystemPrompt()`, so the new memory sits in the store doing nothing.
3. **UI doesn't match design fidelity**: The current modal uses a full-screen horizontal-tab layout with generic green styling, while the rest of the app (ApiSettingsModal) uses a sidebar-nav glassmorphic pattern.

## Design

### 1. Live Placeholder Injection

**What changes:**
- `buildPlaceholderValues()` in `replacerTemplate.js` already reads `summarizeText` from `useMemoryStore` and maps it to the `memory` key. No change needed here.
- **Remove** the destructive `handleSave` logic in `MemoryModal` that does `activePromptContent.replace('{{memory}}', summarizeText)`.
- **Replace** with: "Save & Activate" sets `active: true` and calls `useCharacterStore.getState().refreshSystemPrompt()`. This rebuilds the system prompt from the template, resolving `{{memory}}` dynamically from the store's current `summarizeText`.
- The `{{memory}}` placeholder stays in the prompt template permanently. It gets resolved fresh every time `refreshSystemPrompt()` is called.

**Files touched:** `MemoryModal.jsx` (remove old handleSave, add new one).

### 2. Auto-Summarize That Works

**What changes:**
- In `useMemoryStore.generateSummary()`, after `set({ summarizeText: text })` succeeds, add: `useCharacterStore.getState().refreshSystemPrompt()` to immediately rebuild the system prompt with the new memory.
- Add a configurable `summarizeInterval` field (default: `10`) to the memory store. Users can set how many messages between auto-summarize triggers (e.g., 5, 10, 15, 20).
- Update the `useEffect` in `page.js` to use `summarizeInterval` instead of hardcoded `10`.

**Files touched:** `useMemoryStore.js`, `page.js`.

### 3. UI Rebuild — Sidebar-Nav Glassmorphic Layout

**Layout:** Match `ApiSettingsModal` exactly:
- Sidebar left panel (full-height on desktop, horizontal strip on mobile) with icon nav items
- Scrollable content area on the right
- Same glassmorphic tokens: `bg-[#0d0d0d]/90`, `border-white/10`, `rounded-2xl`

**Three sidebar tabs:**

#### Tab 1: Memory (Brain icon)
- Section header: "Memory Content" with char count badge
- Full-height textarea: `bg-white/[0.03]`, `border-white/10`, `rounded-xl`, `font-mono`, `focus:border-[#3A9E49]/50`
- "Generate Summary" button: primary green action button styled like ApiSettingsModal's "Verify Endpoint"
- Loading state: spinner in button, textarea disabled

#### Tab 2: Config (Settings icon)
- **Auto-Summarize toggle**: Same card-style toggle as current, but with `bg-white/[0.03]` card background
- **Summarize Interval**: Number input (5–50) or a set of radio-style preset buttons (5, 10, 15, 20)
- **Memory Generation Prompt**: Full-height textarea for the custom system prompt that instructs the AI how to generate memory. Same styling as Memory tab textarea.

#### Tab 3: History (History icon)
- Snapshot cards: each with timestamp, char count, restore/delete actions
- Empty state: icon + "No snapshots yet" text
- Same card styling: `bg-white/[0.03]`, hover border glow

**Footer area:**
- The old full-width footer is removed.
- "Save & Activate" primary green button renders at the **bottom of the content area** (sticky, like a form submit).
- Status badge (green/yellow dot + "Active"/"Inactive") renders in the **sidebar header area**, below the Brain icon title.

**Bottom of sidebar:**
- "Reset All" small danger text button
- "Close" button (X icon + label on desktop, icon-only on mobile)

**Color tokens (matching ApiSettingsModal):**
- Background: `bg-[#0d0d0d]/90`
- Sidebar: `bg-black/20`
- Inputs: `bg-white/[0.03]`, `border-white/10`, focus: `border-[#3A9E49]/50`, `bg-[#3A9E49]/5`
- Labels: `text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#656565]`
- Accent: `#3A9E49` (green)
- Active nav: `bg-[#3A9E49]/10 text-[#3A9E49] border border-[#3A9E49]/20`

**Files touched:** `MemoryModal.jsx` (full rewrite of JSX/styling).

### 4. Store Cleanup

- Add `summarizeInterval: 10` to `useMemoryStore` initial state.
- Add `setSummarizeInterval: (interval) => set({ summarizeInterval: interval })` action.
- Keep all existing store fields and actions (`summarizeText`, `autoSummarize`, `memoryPrompt`, `snapshots`, `generateSummary`, etc.).
- No breaking changes to the store API.

**Files touched:** `useMemoryStore.js`.

## Files Changed (Summary)

| File | Change Type | Description |
|------|-------------|-------------|
| `app/store/useMemoryStore.js` | Modify | Add `summarizeInterval`, call `refreshSystemPrompt()` after generation |
| `app/components/modal/MemoryModal.jsx` | Rewrite | Full UI rebuild with sidebar-nav layout, fix handleSave |
| `app/page.js` | Modify | Use `summarizeInterval` from store instead of hardcoded 10 |

## Out of Scope

- Granular/card-based memory (decided against in brainstorming)
- RAG/vector search
- Changes to `replacerTemplate.js` (already correct)
- Changes to `useCharacterStore.js` (already has `refreshSystemPrompt`)
