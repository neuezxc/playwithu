# Debug Logs Redesign

## Problem

The current debug modal dumps raw JSON request/response blobs into a long scrollable list. In long sessions this becomes unusable — users can't find what they need, and the core question ("did my system prompt actually get sent to the API?") requires digging through walls of text.

## Goal

Give users a quick way to **verify that their prompts are being sent correctly** to the LLM API, with a clean, scannable interface that works even after dozens of API calls.

## Log Entry Structure

Each API call produces one log entry:

```js
{
  id: Date.now(),
  timestamp: ISO string,
  status: 'ok' | 'error',
  characterName: string,
  promptName: string,
  resolvedSystemPrompt: string,  // all {{placeholders}} replaced with real values
  lastUserMessage: string,       // most recent user message
  lastAiResponse: string,        // most recent AI response
  params: {
    model: string,
    temperature: number,
    max_tokens: number,
    top_p: number,
  },
  error: string | null,          // null on success
  messages: Array,               // full message array (only shown in "Full Messages")
}
```

Logs capped at **50 entries**. Oldest dropped first to prevent localStorage bloat.

## Component Design

### Header (unchanged)
- Title: "Debug Logs"
- Subtitle: "API requests"
- Close button (X)

### Filter Bar (unchanged)
- All / API Requests toggle
- Enabled/Disabled toggle
- Clear Logs button

### Log Cards (new)

Each log is a **collapsible card**.

**Collapsed state** (single line):
```
▼  2:34 PM  —  ✅  —  Luna  —  Default Roleplay
```
Shows: time, status icon (✅ green / ❌ red), character name, prompt name.

**Expanded state** (3 short sections + hidden full messages):

1. **System Prompt** — fully resolved text with token count. Copy button.
2. **Last Exchange** — latest user message + latest AI response. Copy button.
3. **Params** — model, temperature, max_tokens, top_p.
4. **Full Messages ▸** (collapsed toggle) — the complete message array. Hidden by default.

Each section has a border matching the modal style. Background `#1a1a1a`, inner sections `#252525`.

### Error State

If `error` is present:
- Status shows ❌ red
- Error message displayed in red text below the collapsed header
- Response section omitted (there is none)
- System Prompt and Params still shown

### Empty State

"No debug logs yet. Make an API request to see logs here."

## Store Changes (`useDebugStore.js`)

- `addLog(log)` accepts the structured fields above instead of raw `{request, response}`
- Logs capped at 50 entries (oldest removed when adding 51st)
- `clearLogs()` — unchanged
- `toggleEnabled()` — unchanged
- `logs` array — persisted to localStorage
- `isEnabled` — unchanged

## Integration Points

Wherever the app calls the API (currently `page.js`), the caller must gather:
- Active character name (from `useCharacterStore`)
- Active prompt name (from `usePromptStore`)
- Resolved system prompt (the text actually sent)
- Last user message
- AI response (or error)
- Current API params (from `useApiSettingStore`)

Then call `addLog()` with the structured object.

## What Stays the Same

- Dark color palette (`#1a1a1a`, `#252525`, `#3b3b3b`, `#f2f2f2`, `#8e8e8e`)
- Modal overlay style
- Filter bar layout
- Enabled toggle, clear button
- Font styles, border styles, spacing scale

## What Changes

- `DebugModal.jsx` — complete rewrite with collapsible cards
- `useDebugStore.js` — new `addLog` signature, 50-entry cap
- API call sites — must pass structured data to `addLog()`

## Success Criteria

- User can open debug modal and see at a glance whether their system prompt was sent
- System prompt is fully visible (resolved placeholders), not a JSON blob
- Each log card fits on screen without scrolling
- 50+ API calls don't blow up localStorage
- Copy button works for each section
