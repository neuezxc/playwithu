# Placeholder Status Panel — Design Spec

## Purpose

Give users real-time visibility into which placeholders (`{{char}}`, `{{user}}`, `{{lorebook}}`, etc.) are actually included in each API call, so they can verify that configured features are being sent as expected.

## Problem Statement

Users configure placeholders and features (lorebooks, memory, tools, pattern replacements) but have no way to quickly verify that the active prompt template actually uses them. A placeholder might have content ready but if the template doesn't contain `{{lorebook}}`, that content is never sent to the API.

## Architecture

### New Component: `PlaceholderStatusPanel.jsx`

A compact, toggle-able panel positioned above the chat input in `SuperInput.jsx`.

**States:**
- `isOpen` — controls collapsed/expanded state
- `placeholderData` — data from the last API call (stored in `useDebugStore`)

**UI Structure (collapsed):**
```
[🔍 Placeholders (7)] — single button, shows count
```

**UI Structure (expanded):**
```
┌─────────────────────────────────────────┐
│ Placeholder Status              [✕]     │
├─────────────────────────────────────────┤
│ ✅ {{char}}         "Hayeon"            │
│ ✅ {{user}}         "neue"              │
│ ✅ {{char_description}}  (234 tokens)   │
│ ⚠️ {{user_description}}  (empty)        │
│ ✅ {{scenario}}     (123 tokens)        │
| ❌ {{lorebook}}     not in template     │
│ ✅ {{tools}}        (1 active)          │
└─────────────────────────────────────────┘
```

### Status Logic (3-part verification)

Each placeholder is checked against two dimensions: is it in the template, and does it have content?

| inTemplate | hasContent | Status | Meaning |
|------------|------------|--------|---------|
| true | true | ✅ **Green** | Placeholder is used and has content — sent to API |
| true | false | ⚠️ **Yellow** | Placeholder is in template but resolved to empty string |
| false | false | ❌ **Red** | Placeholder not in template, no content exists |
| false | true | ⚠️ **Orange** | Content exists (e.g., lorebook matched) but template doesn't use it — NOT sent to API |

The orange case is critical: it catches the "misleading green" problem where content is ready but the template never references it.

### Store Enhancement: `useDebugStore.js`

Add new fields:

```js
{
  placeholderData: {
    timestamp: null,           // when this data was captured
    rawTemplate: '',           // the active prompt before replacement
    resolvedTemplate: '',      // after placeholder replacement
    placeholders: {            // map of placeholder name → status
      char: {
        inTemplate: true,      // was {{char}} in the raw template?
        hasContent: true,      // does the resolved value have content?
        value: 'Hayeon',       // the actual resolved value
        tokenCount: 1          // approximate token count
      },
      lorebook: {
        inTemplate: false,
        hasContent: true,      // lorebook entries matched!
        value: '[Lorebook]\n...',
        tokenCount: 89
      }
    }
  }
}
```

Actions:
- `setPlaceholderData(data)` — stores the captured placeholder analysis
- `clearPlaceholderData()` — resets to null

### Data Capture Flow

In `SuperInput.jsx`, before the API call:

1. Get raw template: `usePromptStore.getState().getActivePromptContent()`
2. Get resolved values: `buildPlaceholderValues(updatedMessage)`
3. Get resolved template: `replacePlaceholders(rawTemplate, values)`
4. For each placeholder in `PROMPT_VARIABLES`:
   - Check if `{{name}}` exists in `rawTemplate` → `inTemplate`
   - Check if `values[name]` is non-empty → `hasContent`
   - Calculate approximate token count
5. Store result via `useDebugStore.getState().setPlaceholderData(...)`
6. Panel re-renders with new data

### Access Point

Add button to `InputMenu.jsx`:
- Icon: `Eye` or `Search` (from lucide-react)
- Label: "Placeholder Status"
- Toggles `isPlaceholderPanelOpen` state in `SuperInput`

### Files to Modify

| File | Change |
|------|--------|
| `app/components/PlaceholderStatusPanel.jsx` | **NEW** — panel component |
| `app/store/useDebugStore.js` | Add `placeholderData` field + actions |
| `app/components/SuperInput.jsx` | Capture placeholder data before API call, render panel |
| `app/components/InputMenu.jsx` | Add toggle button for panel |
| `app/components/index.js` | Export `PlaceholderStatusPanel` |

## Data Flow Diagram

```
User sends message
       │
       ▼
buildPlaceholderValues() ──→ resolved values
       │
       ▼
Check each placeholder:
  - inTemplate? (scan raw template)
  - hasContent? (check resolved value)
       │
       ▼
setPlaceholderData() ──→ useDebugStore
       │
       ▼
PlaceholderStatusPanel reads store → renders status chips
       │
       ▼
API call proceeds with resolved messages
```

## Token Counting

Use simple word-based approximation: `Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.3)`
This matches the existing `countTokens()` function in `DebugModal.jsx`.

## Error Handling

- If no API call has been made yet, panel shows "Send a message to see placeholder status"
- If store data is stale (from previous character), show warning badge
- Empty content should still show the placeholder name (not hide it)

## Testing Checklist

- [ ] Panel toggles open/collapse correctly
- [ ] Status shows ✅ for placeholder in template with content
- [ ] Status shows ⚠️ for placeholder in template with empty content
- [ ] Status shows ❌ for placeholder NOT in template with no content
- [ ] Status shows ⚠️ (orange) for placeholder NOT in template BUT has content
- [ ] Lorebook status shows match count when content exists
- [ ] Memory status shows snapshot info when available
- [ ] Panel updates after each API call
- [ ] Panel clears/resets when character is switched
- [ ] Token counts are reasonable approximations
