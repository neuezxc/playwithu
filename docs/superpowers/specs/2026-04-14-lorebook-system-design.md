# Lorebook System — Design Spec

**Date:** 2026-04-14  
**Status:** Implemented

## Overview

A lorebook (World Info) system that dynamically injects world-building details into the system prompt when trigger keywords appear in recent chat messages. Similar to SillyTavern's World Info feature.

## Design Decisions

### Storage
- **Global lorebooks**: Stored in `useLorebookStore` (persisted, localStorage key: `lorebook-storage`). Multiple named lorebooks, each with an enable/disable toggle and an array of entries.
- **Per-character lorebooks**: Stored as a `lorebook` field on each character object: `{ entries: [{ id, keywords, content }] }`. Automatically added to new characters.

### Scanning
- **Scan depth**: Last 5 non-system messages (fixed, no config).
- **Keyword matching**: Case-insensitive, comma-separated keywords per entry.
- **Combination**: All active global entries + character-specific entries that match are merged into a single text block. Global entries come first, then character-specific.

### Injection
- Single `{{lorebook}}` placeholder added to the system prompt variables.
- Resolved by `buildPlaceholderValues(messages)` which calls `buildLorebookContent(messages, character)`.
- If no entries match, the placeholder resolves to empty string.

### Content Format
- Plain text only (no markdown).
- Each matched entry is output as: `[LorebookName]\n<content>\n`
- No length limit on entry content.

## Architecture

### New Files
| File | Purpose |
|------|---------|
| `app/store/useLorebookStore.js` | Zustand store for global lorebooks (CRUD, entries, import/export) |
| `app/components/modal/LorebookModal.jsx` | Quick-access modal in chat for per-character entries |
| `app/lorebook/page.jsx` | Full page for managing global lorebooks |

### Modified Files
| File | Changes |
|------|---------|
| `app/utils/replacerTemplate.js` | Added `{{lorebook}}` to `PROMPT_VARIABLES`, added `buildLorebookContent()` function, updated `buildPlaceholderValues()` to accept optional messages array |
| `app/store/useCharacterStore.js` | Added `lorebook` field to default characters, `addCharLorebookEntry`, `updateCharLorebookEntry`, `deleteCharLorebookEntry` actions, ensured new characters get default lorebook |
| `app/components/InputMenu.jsx` | Added "Lorebook" menu item that opens quick-access modal |
| `app/components/SuperInput.jsx` | Added `LorebookModal` render, updated `buildPlaceholderValues` call to pass messages |
| `app/components/modal/index.js` | Added `LorebookModal` export |

## Data Flow

```
User sends message
  → handleMessage() builds updatedMessage array
  → buildPlaceholderValues(updatedMessage) is called
    → buildLorebookContent(updatedMessage, character) scans last 5 messages
      → Collects matching entries from enabled global lorebooks
      → Collects matching entries from character's lorebook
      → Returns combined plain text
  → {{lorebook}} is resolved in system prompt
  → API request sent with updated system prompt
```

## UI

### Input Menu
- New "Lorebook" item (book icon) opens the quick-access modal.

### Quick-Access Modal (in chat)
- Shows current character's lorebook entries.
- Add/edit/delete entries inline.
- "Manage Global Lorebooks" button navigates to `/lorebook`.

### Global Lorebook Page (`/lorebook`)
- List of all global lorebooks with expand/collapse.
- Enable/disable toggle per lorebook.
- CRUD for lorebooks (create, rename, delete, export).
- CRUD for entries within each lorebook.
- Import/export (single or all).
- Search across lorebook names, keywords, and content.

## Import/Export Format

Single lorebook:
```json
{
  "name": "World Lore",
  "enabled": true,
  "entries": [
    { "keywords": "sword, blade", "content": "The Excalibur..." }
  ]
}
```

All lorebooks: array of the above.
