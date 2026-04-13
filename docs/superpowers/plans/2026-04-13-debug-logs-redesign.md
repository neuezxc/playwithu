# Debug Logs Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Debug Logs modal with collapsible cards showing resolved system prompts, last exchanges, and params — replacing the current raw JSON dump.

**Architecture:** Update the debug store with a new structured `addLog` signature and 50-entry cap. Rewrite `DebugModal.jsx` with collapsible log cards. Update all API call sites (`SuperInput.jsx`, `useCharacterStore.js`) to pass structured data.

**Tech Stack:** Zustand, React, Tailwind CSS, Lucide Icons

---

### Task 1: Update `useDebugStore` with new log structure and cap

**Files:**
- Modify: `c:\Users\jimue\Desktop\Vibe Coding\playwithu\app\store\useDebugStore.js`

- [ ] **Step 1: Rewrite the store with new `addLog` signature and 50-entry cap**

Replace the entire file content with:

```js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_LOGS = 50;

const useDebugStore = create(
  persist(
    (set, get) => ({
      logs: [],
      isModalOpen: false,
      isEnabled: false,

      addLog: (log) => set((state) => {
        if (!state.isEnabled) return state;

        const newEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          status: log.error ? "error" : "ok",
          characterName: log.characterName || "Unknown",
          promptName: log.promptName || "Unknown",
          resolvedSystemPrompt: log.resolvedSystemPrompt || "",
          lastUserMessage: log.lastUserMessage || "",
          lastAiResponse: log.lastAiResponse || "",
          params: log.params || { model: "", temperature: 0, max_tokens: 0, top_p: 0 },
          error: log.error || null,
          messages: log.messages || [],
        };

        const updatedLogs = [...state.logs, newEntry];
        // Cap at MAX_LOGS, drop oldest
        const cappedLogs = updatedLogs.length > MAX_LOGS
          ? updatedLogs.slice(updatedLogs.length - MAX_LOGS)
          : updatedLogs;

        return { logs: cappedLogs };
      }),

      clearLogs: () => set({ logs: [] }),

      setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

      toggleEnabled: () => set((state) => ({ isEnabled: !state.isEnabled })),
    }),
    {
      name: "debug-storage",
    }
  )
);

export default useDebugStore;
```

- [ ] **Step 2: Commit**

```bash
git add app/store/useDebugStore.js
git commit -m "refactor(debug): new addLog signature with structured fields and 50-entry cap"
```

---

### Task 2: Rewrite `DebugModal.jsx` with collapsible log cards

**Files:**
- Modify: `c:\Users\jimue\Desktop\Vibe Coding\playwithu\app\components\modal\DebugModal.jsx`

- [ ] **Step 1: Write the new DebugModal component**

Replace the entire file content with:

```jsx
"use client";

import { useState } from "react";
import { X, Trash2, Power, ChevronDown, ChevronRight, Copy } from "lucide-react";
import useDebugStore from "../../store/useDebugStore";

function countTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.3);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-[#8e8e8e] hover:text-[#f2f2f2] transition-colors"
      title="Copy"
    >
      {copied ? "Copied!" : <Copy size={12} />}
    </button>
  );
}

function LogCard({ log, isExpanded, onToggle }) {
  const formatTime = (ts) => new Date(ts).toLocaleTimeString();

  const statusIcon = log.status === "ok" ? "✅" : "❌";

  return (
    <div className="border border-[#333] rounded-lg bg-[#1a1a1a] overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#252525] transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown size={14} className="text-[#8e8e8e] flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-[#8e8e8e] flex-shrink-0" />
        )}
        <span className="text-xs text-[#8e8e8e] flex-shrink-0">
          {formatTime(log.timestamp)}
        </span>
        <span className="text-xs flex-shrink-0">{statusIcon}</span>
        <span className="text-xs text-[#d9d9d9] truncate">
          {log.characterName}
        </span>
        <span className="text-xs text-[#656565] truncate">
          — {log.promptName}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Error Message */}
          {log.error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              {log.error}
            </div>
          )}

          {/* System Prompt */}
          {log.resolvedSystemPrompt && (
            <Section title="System Prompt" count={`${countTokens(log.resolvedSystemPrompt)} tokens`}>
              <CopyButton text={log.resolvedSystemPrompt} />
              <pre className="text-xs text-[#f2f2f2] whitespace-pre-wrap break-words font-mono">
                {log.resolvedSystemPrompt}
              </pre>
            </Section>
          )}

          {/* Last Exchange */}
          {(log.lastUserMessage || log.lastAiResponse) && (
            <Section title="Last Exchange">
              <CopyButton text={`User: ${log.lastUserMessage}\n${log.characterName}: ${log.lastAiResponse}`} />
              {log.lastUserMessage && (
                <div className="mt-1">
                  <span className="text-xs text-[#3A9E49] font-medium">User:</span>
                  <p className="text-xs text-[#d9d9d9] mt-0.5 whitespace-pre-wrap">
                    {log.lastUserMessage}
                  </p>
                </div>
              )}
              {log.lastAiResponse && (
                <div className="mt-2">
                  <span className="text-xs text-[#5f9fdb] font-medium">{log.characterName}:</span>
                  <p className="text-xs text-[#d9d9d9] mt-0.5 whitespace-pre-wrap">
                    {log.lastAiResponse}
                  </p>
                </div>
              )}
            </Section>
          )}

          {/* Params */}
          {log.params && log.params.model && (
            <Section title="Params">
              <div className="text-xs text-[#d9d9d9] font-mono space-y-0.5">
                <div>model: {log.params.model}</div>
                <div>temp: {log.params.temperature} · max_tokens: {log.params.max_tokens} · top_p: {log.params.top_p}</div>
              </div>
            </Section>
          )}

          {/* Full Messages Toggle */}
          {log.messages && log.messages.length > 0 && (
            <FullMessages messages={log.messages} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div className="bg-[#252525] rounded border border-[#333]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#d9d9d9]">{title}</span>
          {count && <span className="text-xs text-[#656565]">{count}</span>}
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

function FullMessages({ messages }) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-[#5f9fdb] hover:text-[#8ec5ff] transition-colors flex items-center gap-1"
      >
        <ChevronRight size={12} />
        Full Messages ({messages.length})
      </button>
    );
  }

  const fullText = messages.map((m) => `[${m.role}]\n${m.content}`).join("\n\n---\n\n");

  return (
    <div className="bg-[#252525] rounded border border-[#333]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#333]">
        <span className="text-xs font-medium text-[#d9d9d9]">
          Full Messages ({messages.length})
        </span>
        <CopyButton text={fullText} />
      </div>
      <div className="px-3 py-2">
        <pre className="text-xs text-[#f2f2f2] whitespace-pre-wrap break-words font-mono max-h-64 overflow-y-auto">
          {fullText}
        </pre>
      </div>
    </div>
  );
}

export default function DebugModal({ onClose }) {
  const { logs, clearLogs, isEnabled, toggleEnabled } = useDebugStore();
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.status === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 bg-opacity-50 p-2 sm:p-4 overflow-y-auto">
      <div className="w-full h-full lg:h-auto max-w-4xl rounded-xl shadow-lg flex flex-col font-sans max-h-[90vh] my-2 sm:my-4 mx-1 sm:mx-2 border border-white/20 bg-white/2">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#3b3b3b]">
          <div>
            <h2 className="text-xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
              Debug Logs
            </h2>
            <p className="text-xs text-[#8e8e8e] mt-1">API requests</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </header>

        {/* Filter Bar */}
        <div className="px-4 py-2 border-b border-[#3b3b3b] flex flex-wrap gap-2 items-center">
          <button
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-lg ${
              filter === "all"
                ? "bg-[#5fdb72]/15 text-[#e4ffe8] border border-[#5fdb72]"
                : "text-[#d9d9d9] hover:text-white hover:bg-[#333]/50"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              filter === "error"
                ? "bg-red-500/15 text-red-300 border border-red-500"
                : "text-[#d9d9d9] hover:text-white hover:bg-[#333]/50"
            }`}
            onClick={() => setFilter("error")}
          >
            Errors
          </button>
          <button
            className={`ml-auto px-2 sm:px-3 py-1 text-xs font-medium flex items-center gap-1 ${
              isEnabled
                ? "text-green-400 hover:text-green-300"
                : "text-red-400 hover:text-red-300"
            }`}
            onClick={toggleEnabled}
          >
            <Power size={14} />
            {isEnabled ? "Enabled" : "Disabled"}
          </button>
          <button
            className="px-2 sm:px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
            onClick={clearLogs}
          >
            <Trash2 size={14} />
            Clear Logs
          </button>
        </div>

        {/* Log Cards */}
        <main className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#8e8e8e]">
              <p>No debug logs found</p>
              <p className="text-sm mt-2">Make API requests to see logs here</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                isExpanded={expandedId === log.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === log.id ? null : log.id))
                }
              />
            ))
          )}
        </main>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-[#333]">
          <div className="text-xs text-[#8e8e8e]">Total logs: {logs.length}</div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#454545]/30 border border-[#454545] rounded-lg text-[#f2f2f2] text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
```

**Important note about Section component:** The Section component above has a small issue — `children` is used twice (once in the header for CopyButton, once in the body for content). Let me fix the Section to separate header actions from body content:

Replace the Section component with:

```jsx
function Section({ title, count, action, children }) {
  return (
    <div className="bg-[#252525] rounded border border-[#333]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#d9d9d9]">{title}</span>
          {count && <span className="text-xs text-[#656565]">{count}</span>}
        </div>
        {action}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}
```

And update the Section usages in LogCard:

```jsx
{/* System Prompt */}
{log.resolvedSystemPrompt && (
  <Section
    title="System Prompt"
    count={`${countTokens(log.resolvedSystemPrompt)} tokens`}
    action={<CopyButton text={log.resolvedSystemPrompt} />}
  >
    <pre className="text-xs text-[#f2f2f2] whitespace-pre-wrap break-words font-mono">
      {log.resolvedSystemPrompt}
    </pre>
  </Section>
)}

{/* Last Exchange */}
{(log.lastUserMessage || log.lastAiResponse) && (
  <Section
    title="Last Exchange"
    action={
      <CopyButton
        text={`User: ${log.lastUserMessage}\n${log.characterName}: ${log.lastAiResponse}`}
      />
    }
  >
    {log.lastUserMessage && (
      <div className="mb-2">
        <span className="text-xs text-[#3A9E49] font-medium">User:</span>
        <p className="text-xs text-[#d9d9d9] mt-0.5 whitespace-pre-wrap">
          {log.lastUserMessage}
        </p>
      </div>
    )}
    {log.lastAiResponse && (
      <div>
        <span className="text-xs text-[#5f9fdb] font-medium">
          {log.characterName}:
        </span>
        <p className="text-xs text-[#d9d9d9] mt-0.5 whitespace-pre-wrap">
          {log.lastAiResponse}
        </p>
      </div>
    )}
  </Section>
)}

{/* Params */}
{log.params && log.params.model && (
  <Section title="Params">
    <div className="text-xs text-[#d9d9d9] font-mono space-y-0.5">
      <div>model: {log.params.model}</div>
      <div>
        temp: {log.params.temperature} · max_tokens: {log.params.max_tokens} · top_p: {log.params.top_p}
      </div>
    </div>
  </Section>
)}
```

- [ ] **Step 2: Verify the dev server can render the modal**

```bash
npm run dev
```

Open the app, open debug modal via `/dbg`, confirm it renders (will show empty since store structure changed).

- [ ] **Step 3: Commit**

```bash
git add app/components/modal/DebugModal.jsx
git commit -m "feat(debug): redesign modal with collapsible log cards"
```

---

### Task 3: Update `SuperInput.jsx` to pass structured data to `addLog`

**Files:**
- Modify: `c:\Users\jimue\Desktop\Vibe Coding\playwithu\app\components\SuperInput.jsx`

- [ ] **Step 1: Update all `addLog` calls in SuperInput to use the new structured format**

There are 3 `addLog` calls in this file. Replace each one.

**First `addLog` call (request log, ~line 89):** Replace with:

```js
const activePrompt = usePromptStore.getState().getActivePrompt();
const lastUserMsg = user.message;

addLog({
  characterName: character.name,
  promptName: activePrompt?.name || "Unknown",
  resolvedSystemPrompt: processedPrompt,
  lastUserMessage: lastUserMsg,
  lastAiResponse: "",
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: messagesWithPrompt,
});
```

Add `usePromptStore` import at the top (already imported).

**Second `addLog` call (response log, ~line 129):** Replace with:

```js
addLog({
  characterName: character.name,
  promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
  resolvedSystemPrompt: processedPrompt,
  lastUserMessage: lastUserMsg,
  lastAiResponse: text,
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: messagesWithPrompt,
});
```

**Third `addLog` call (error log, ~line 152):** Replace with:

```js
addLog({
  characterName: character.name,
  promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
  resolvedSystemPrompt: processedPrompt,
  lastUserMessage: lastUserMsg,
  lastAiResponse: "",
  error: error.message,
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: messagesWithPrompt,
});
```

The `handleMessage` function also needs to capture `processedPrompt`, `lastUserMsg` before the async boundary. Add these at the top of `handleMessage`, right after the `setLoading(true)` line:

```js
const promptContent = usePromptStore.getState().getActivePromptContent();
const activePrompt = usePromptStore.getState().getActivePrompt();
const values = buildPlaceholderValues();
const processedPrompt = replacePlaceholders(promptContent, values);
const lastUserMsg = user.message;
```

Remove the duplicate prompt processing that happens later (the existing `const promptContent = ...` block lower down), keeping only the one at the top.

- [ ] **Step 2: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "refactor(debug): pass structured data to addLog in SuperInput"
```

---

### Task 4: Update `useCharacterStore.js` API call sites

**Files:**
- Modify: `c:\Users\jimue\Desktop\Vibe Coding\playwithu\app\store\useCharacterStore.js`

- [ ] **Step 1: Update `addLog` in `editUserMessageAndRegenerate`**

There are 3 `addLog` calls in this method. The existing calls pass `{ type: "api", endpoint, ... }`. Replace each.

**Request log** (inside `editUserMessageAndRegenerate`, ~line 155):

```js
const activePrompt = usePromptStore.getState().getActivePrompt();
const systemMsg = currentMessages.find((m) => m.role === "system");
const lastUserMsg = [...currentMessages].reverse().find((m) => m.role === "user");

addLog({
  characterName: get().character.name,
  promptName: activePrompt?.name || "Unknown",
  resolvedSystemPrompt: systemMsg?.content || "",
  lastUserMessage: lastUserMsg?.content || "",
  lastAiResponse: "",
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: currentMessages,
});
```

**Response log** (~line 195):

```js
addLog({
  characterName: get().character.name,
  promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
  resolvedSystemPrompt: systemMsg?.content || "",
  lastUserMessage: lastUserMsg?.content || "",
  lastAiResponse: text,
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: currentMessages,
});
```

**Error log** (~line 215):

```js
addLog({
  characterName: get().character.name,
  promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
  resolvedSystemPrompt: systemMsg?.content || "",
  lastUserMessage: lastUserMsg?.content || "",
  lastAiResponse: "",
  error: error.message,
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: currentMessages,
});
```

- [ ] **Step 2: Update `addLog` in `regenerateLastMessage`**

There are 2 `addLog` calls in this method.

**Request log** (~line 240):

```js
const activePrompt = usePromptStore.getState().getActivePrompt();
const systemMsg = contextMessages.find((m) => m.role === "system");
const lastUserMsg = [...contextMessages].reverse().find((m) => m.role === "user");

addLog({
  characterName: get().character.name,
  promptName: activePrompt?.name || "Unknown",
  resolvedSystemPrompt: systemMsg?.content || "",
  lastUserMessage: lastUserMsg?.content || "",
  lastAiResponse: "",
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: contextMessages,
});
```

**Response log** (~line 270):

```js
addLog({
  characterName: get().character.name,
  promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
  resolvedSystemPrompt: systemMsg?.content || "",
  lastUserMessage: lastUserMsg?.content || "",
  lastAiResponse: newContent,
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: contextMessages,
});
```

Note: `regenerateLastMessage` does not have an error `addLog` call, so no error log to update there.

- [ ] **Step 3: Commit**

```bash
git add app/store/useCharacterStore.js
git commit -m "refactor(debug): pass structured data to addLog in useCharacterStore"
```

---

### Task 5: Final verification and cleanup

**Files:**
- All modified files

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Fix any errors reported.

- [ ] **Step 2: Run dev server and manual test**

```bash
npm run dev
```

Manual test checklist:
1. Open app, verify it loads
2. Type a message, send it
3. Type `/dbg` to open debug modal
4. Verify: log card appears with character name, prompt name, timestamp
5. Click to expand — verify System Prompt section shows fully resolved text (no `{{placeholders}}`)
6. Verify Last Exchange shows your message and the AI response
7. Verify Params shows model, temp, max_tokens, top_p
8. Click Copy button on System Prompt — verify it copies
9. Click "Full Messages" — verify full message array appears
10. Filter to "Errors" — verify only error logs show (or empty if no errors)
11. Verify 50+ logs cap works (hard to test manually, but code logic is in place)

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: lint and final cleanup for debug logs redesign"
```

---

## Spec Self-Review

**1. Spec coverage:**
- ✅ Collapsible log cards → Task 2
- ✅ System Prompt (resolved) → Task 2 + Task 3/4 (data population)
- ✅ Last Exchange → Task 2 + Task 3/4
- ✅ Params → Task 2 + Task 3/4
- ✅ Full Messages toggle → Task 2
- ✅ Copy buttons per section → Task 2
- ✅ 50-entry cap → Task 1
- ✅ Error display → Task 2 + Task 3/4
- ✅ Same design fidelity → Task 2 (same colors, borders, fonts)
- ✅ Filter bar (All/Errors) → Task 2
- ✅ Enabled toggle, Clear → Task 2

**2. Placeholder scan:** No TBDs, TODOs, or "implement later". All code is complete.

**3. Type consistency:** `addLog` signature is consistent across all tasks. Fields: `characterName`, `promptName`, `resolvedSystemPrompt`, `lastUserMessage`, `lastAiResponse`, `params`, `error`, `messages`. Used identically in Task 1 (store), Task 3 (SuperInput), Task 4 (useCharacterStore).

**4. Ambiguity check:** Each step shows exact code. No "similar to" references. All imports accounted for.

Plan is clean and complete.
