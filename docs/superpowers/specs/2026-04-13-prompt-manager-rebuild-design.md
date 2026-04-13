# Prompt Manager Rebuild — Design Spec

**Date:** 2026-04-13
**Status:** Draft
**Scope:** Rebuild the Prompt Manager (store, UI, replacement engine) from scratch while preserving core functionality and design fidelity.

---

## Problem Statement

The current Prompt Manager has several architectural issues:

1. **Duplicate replacement engines** — `utils/replacerTemplate.js` uses `replaceAll`; `useCharacterStore.js` has a separate regex-based version with two-pass replacement. They can produce different results.
2. **Parallel arrays** — `custom_prompts[]` and `prompt_names[]` are matched by index. If they desync (failed deletion, import bug), prompts show wrong names or crash.
3. **Index-based selection** — `selected_prompt_index` breaks when prompts are deleted or reordered.
4. **Default prompt is read-only** — users who want to tweak one line must copy-paste into a new custom prompt.
5. **Missing features from original spec** — preview mode and token counting were planned (`prompts.txt`) but never implemented.

## Goals

- Fix all 5 issues above
- Rebuild store, UI, and replacement engine from scratch
- Maintain design fidelity (dark theme, `#5fdb72` green accents, sidebar + editor layout)
- Migrate existing user data from the old format seamlessly

## Non-Goals

- Per-character prompt overrides
- Prompt categories or folders
- Prompt versioning/history
- Real tokenizer integration (rough estimate is sufficient)

---

## Data Model

### Prompt Object

```js
{
  id: "abc123",           // Unique string ID (Date.now().toString() for new, "default" for built-in)
  name: "My RP Prompt",   // Display name
  content: "You are...",  // The prompt text with {{placeholders}}
  isDefault: false,       // true only for the built-in default prompt
  createdAt: 1713000000,  // Timestamp (ms)
  updatedAt: 1713000000   // Timestamp (ms)
}
```

### Store Shape (`usePromptStore`)

```js
{
  prompts: [
    { id: "default", name: "Default Prompt", content: DEFAULT_SYSTEM_PROMPT, isDefault: true, createdAt: ..., updatedAt: ... },
    { id: "abc123", name: "My Prompt", content: "...", isDefault: false, createdAt: ..., updatedAt: ... }
  ],
  activePromptId: "default"
}
```

Key design decisions:
- **ID-based selection** — `activePromptId` is a string, not an index. Deletion and reordering never break the reference.
- **Default prompt lives in the array** — it's a regular item that can be edited. The `isDefault` flag enables the "Reset to Original" action.
- **Single array** — no parallel arrays. Each prompt is a self-contained object.

### Store Actions

| Action | Signature | Behavior |
|--------|-----------|----------|
| `addPrompt` | `(name, content)` | Creates new prompt with generated ID, sets `createdAt`/`updatedAt` |
| `updatePrompt` | `(id, { name?, content? })` | Partial update, bumps `updatedAt` |
| `deletePrompt` | `(id)` | Removes prompt. If deleting the active prompt, resets `activePromptId` to `"default"`. Cannot delete the default prompt. |
| `duplicatePrompt` | `(id)` | Clones the prompt with a new ID and `" (Copy)"` name suffix |
| `setActivePrompt` | `(id)` | Sets `activePromptId` |
| `resetDefaultPrompt` | `()` | Restores the default prompt's `content` to `DEFAULT_SYSTEM_PROMPT` constant |
| `getActivePrompt` | `()` | Returns the full active prompt object |
| `getActivePromptContent` | `()` | Returns just the content string of the active prompt |

### Persistence

- **Key:** `prompt-storage` (same key, so migration can detect the old format)
- **Version:** `2` (old format is implicitly version `1` / unversioned)
- **Migration:** Zustand's `persist` middleware supports a `version` + `migrate` function. On hydration:
  1. Check if the stored data has the old shape (arrays: `custom_prompts`, `prompt_names`, `selected_prompt_index`)
  2. If yes, convert each `(custom_prompts[i], prompt_names[i])` pair into a prompt object
  3. Map `selected_prompt_index` to the corresponding new ID (or `"default"` if -1)
  4. Prepend the default prompt object
  5. Return the new shape

---

## Replacement Engine

### Single Engine

Delete the `replacerTemplate` function from `useCharacterStore.js`. Keep and use only `utils/replacerTemplate.js`:

```js
export const PROMPT_VARIABLES = [
  "{{char}}",
  "{{user}}",
  "{{char_description}}",
  "{{user_description}}",
  "{{scenario}}",
  "{{memory}}",
  "{{tools}}"
]

export function replacePlaceholders(template, values) {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value || '')
  }
  return result
}
```

Design decisions:
- **No two-pass replacement** — if a character description contains `{{user}}`, it will NOT be resolved. This is intentional: predictable single-pass behavior prevents injection-like surprises.
- **Rename export** — `promptVariables` → `PROMPT_VARIABLES` (constant naming convention).
- **All consumers** (`SuperInput.jsx`, `useCharacterStore.js`, `useMemoryStore.js`) import from this single source.

### Helper: Build Values Object

Add a utility to gather all placeholder values from stores:

```js
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

This eliminates the repeated value-gathering code scattered across `SuperInput.jsx` and `useCharacterStore.js`.

---

## UI Design

### Layout

Same sidebar + editor split as current, with refinements:

```
┌──────────────────────────────────────────────────────┐
│  🔧 Prompt Manager                              [X] │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │  Editor                                   │
│          │                                           │
│ [Default]│  Prompt Name (editable title)             │
│  ────────│  ┌─ Toolbar ──────────────────────────┐   │
│ CUSTOM   │  │ [Insert Var ▾] [Edit|Preview] 423t │   │
│ [Prompt1]│  │ [Set Active]   [Reset to Original] │   │
│ [Prompt2]│  └────────────────────────────────────┘   │
│          │  ┌─ Content ──────────────────────────┐   │
│          │  │                                     │   │
│          │  │  (textarea or preview)              │   │
│          │  │                                     │   │
│          │  └────────────────────────────────────┘   │
│──────────│                                           │
│ [+ New ] │                                           │
│ [⬆][⬇]  │                                           │
├──────────┴───────────────────────────────────────────┤
│  3 prompts                        [Cancel] [Save]    │
└──────────────────────────────────────────────────────┘
```

### Sidebar Details

- **All prompts in one list** — default prompt first, always present, with a subtle "DEFAULT" badge
- **Active indicator** — green dot or check on the currently active prompt
- **Each item shows:** name + truncated first line of content as subtitle
- **Hover actions:** duplicate (copy icon), delete (trash icon, disabled on default)
- **Bottom actions:**
  - **+ New Prompt** button (green outline)
  - **Import / Export** buttons (gray, icon + label)

### Editor Details

**Name input:**
- Styled as an inline editable title (large, bold, transparent background)
- Placeholder: "Untitled Prompt"

**Toolbar:**
- **Insert Variable** — dropdown button that shows all 7 `{{placeholders}}`. Clicking one inserts at cursor position in the textarea.
- **Edit / Preview toggle** — two-segment toggle button
  - Edit: shows raw textarea with placeholders visible
  - Preview: shows read-only rendered text with all `{{placeholders}}` replaced with live values from current character/user
- **Token count** — `Math.ceil(content.length / 4)` displayed as `~423 tokens` (rough estimate, no tokenizer dependency)
- **Set as Active** — green button, only shown when viewing a non-active prompt. Clicking sets `activePromptId`.
- **Reset to Original** — ghost/outline button, only shown on the default prompt AND only when its content differs from `DEFAULT_SYSTEM_PROMPT`. Clicking calls `resetDefaultPrompt()`.

**Content area:**
- **Edit mode:** full-height textarea, monospace font, green focus ring, spellcheck off
- **Preview mode:** same area but rendered as read-only styled text with resolved placeholders. Uses the same dark background but non-editable. Highlights resolved values with a subtle background tint so users can see what was replaced.

### Footer

- Left: `"3 prompts"` count
- Right: Cancel (ghost) + Save (solid green with glow)

### Design Tokens (matching existing app)

| Token | Value |
|-------|-------|
| Background (modal) | `#0f0f0f` |
| Background (sidebar) | `#111111` |
| Background (header/footer) | `#141414` |
| Background (editor surface) | `#1c1c1c` |
| Border | `#2a2a2a` |
| Accent green | `#5fdb72` |
| Text primary | `#f2f2f2` |
| Text secondary | `#a1a1a1` |
| Text muted | `#666666` |
| Font (editor) | Monospace (system) |

### Draft Editing Behavior

- All changes are local state until "Save" is clicked (same as current)
- Save commits the entire prompts array + activePromptId to the Zustand store
- Save also calls `useCharacterStore.getState().refreshSystemPrompt()` to immediately apply the active prompt
- Cancel discards all local changes and closes the modal

---

## Integration Points

### Files Modified

| File | Change |
|------|--------|
| `store/usePromptStore.js` | **Rewrite** — new data model, new actions, migration logic |
| `components/modal/CustomPromptModal.jsx` | **Rewrite** — new UI with preview, token counting, toolbar |
| `utils/replacerTemplate.js` | **Update** — rename export, add `buildPlaceholderValues()` |
| `store/useCharacterStore.js` | **Update** — remove internal `replacerTemplate`, import from utils, update `getEffectivePrompt()` → `getActivePromptContent()` references |
| `components/SuperInput.jsx` | **Update** — use `buildPlaceholderValues()` + `getActivePromptContent()` |
| `app/page.js` | **Update** — update `system_prompt` subscription to new store shape |

### Files Deleted

None — we rewrite in place.

### Backward Compatibility

- Old localStorage data is automatically migrated on first load
- All external interfaces (how other stores/components get the prompt content) remain functionally equivalent
- The `useCharacterStore` cross-store calls work the same way, just using the centralized replacement engine

---

## Error Handling

- **Delete active prompt** — automatically falls back to default prompt, shows no error
- **Import invalid JSON** — shows alert with helpful message, no state change
- **Import valid JSON with wrong structure** — validates that imported objects have `name` and `content` fields, skips invalid entries
- **Empty prompt content** — allowed (user might be drafting), but shows a subtle warning in the editor
- **Missing active prompt ID** — if `activePromptId` references a deleted/missing prompt, `getActivePrompt()` falls back to the default prompt

---

## Testing Approach

No test runner is configured in this project. Manual verification:

1. **Fresh start** — default prompt loads, is editable, can be reset
2. **Migration** — load with old format in localStorage, verify prompts appear correctly
3. **CRUD** — create, edit name/content, duplicate, delete custom prompts
4. **Selection** — set active, verify chat uses the correct prompt
5. **Preview** — toggle preview, verify placeholders resolve with current character data
6. **Token count** — verify count updates as content changes
7. **Import/export** — export prompts, clear data, import them back
8. **Edge cases** — delete active prompt, import invalid JSON, empty content
