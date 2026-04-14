# Stop Generation Button — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the send button with a stop button while the API is loading, letting users cancel AI responses mid-flight.

**Architecture:** Add an `AbortController` ref in `SuperInput.jsx`. On send, create the controller and pass its signal to fetch. The send button becomes a red stop button when loading. Clicking stop calls `abort()` on the controller, cancelling the request.

**Tech Stack:** React `useRef`, `AbortController`, Fetch API `signal` option, `lucide-react` icons

---

### Task 1: Add AbortController Ref and Stop Button UI

**Files:**
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Add imports and ref**

Add `useRef` to the React import and `Square` to the lucide-react import:

```jsx
import { useState, useRef } from "react";
import { ArrowUp, Users, Square } from "lucide-react";
```

- [ ] **Step 2: Add abort controller ref**

Add this line with the other state/ref declarations (after `setPatternReplacementModal`):

```js
const abortControllerRef = useRef(null);
```

- [ ] **Step 3: Add handleStop function**

Add this function before `handleMessage`:

```js
const handleStop = () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }
};
```

- [ ] **Step 4: Read isLoading from store**

Add this line with the other store selectors (near the top of the component):

```js
const isLoading = useCharacterStore((state) => state.isLoading);
```

- [ ] **Step 5: Update send button to toggle**

Replace the existing send button:

```jsx
<button
  onClick={handleMessage}
  className="flex items-center justify-center w-8 h-8 bg-[#3A9E49]/30 border border-[#3A9E49] rounded-lg text-white hover:bg-[#3A9E49]/50 transition-colors"
>
  <ArrowUp size={18} className="text-[#D3D3D3]" />
</button>
```

With this conditional version:

```jsx
{isLoading ? (
  <button
    onClick={handleStop}
    className="flex items-center justify-center w-8 h-8 bg-red-500/30 border border-red-500 rounded-lg text-white hover:bg-red-500/50 transition-colors"
    title="Stop generation"
  >
    <Square size={16} className="text-[#D3D3D3] fill-current" />
  </button>
) : (
  <button
    onClick={handleMessage}
    className="flex items-center justify-center w-8 h-8 bg-[#3A9E49]/30 border border-[#3A9E49] rounded-lg text-white hover:bg-[#3A9E49]/50 transition-colors"
  >
    <ArrowUp size={18} className="text-[#D3D3D3]" />
  </button>
)}
```

- [ ] **Step 6: Test manually — button toggle**

Run `npm run dev`. Send a message. The send button should become a red stop button. It should NOT call `handleMessage` while loading (it calls `handleStop` instead).

- [ ] **Step 7: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: add stop button UI with AbortController ref"
```

---

### Task 2: Wire AbortController Signal to Fetch

**Files:**
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Create controller in handleMessage**

Inside `handleMessage`, just before the `try` block that contains the fetch (the inner `try` that starts with `const fetchUrl = api_endpoint;`), add:

```js
const controller = new AbortController();
abortControllerRef.current = controller;
```

- [ ] **Step 2: Add signal to fetch options**

Find the existing `fetch()` call:

```js
const response = await fetch(
  fetchUrl,
  {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }
);
```

Add `signal` to the options object:

```js
const response = await fetch(
  fetchUrl,
  {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: controller.signal,
  }
);
```

- [ ] **Step 3: Clear ref in finally**

In the outer `finally` block, add ref cleanup:

```js
abortControllerRef.current = null;
```

The existing finally block already has `setLoading(false)`. Add the ref null on the line before or after it.

- [ ] **Step 4: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: wire AbortController signal to fetch request"
```

---

### Task 3: Handle AbortError Gracefully

**Files:**
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Detect AbortError in catch block**

Find the inner `catch` block (the one that logs the error to `addLog` and re-throws):

```js
} catch (error) {
  addLog({
    characterName: character.name,
    promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
    resolvedSystemPrompt: processedPrompt,
    lastUserMessage: lastUserMsg,
    lastAiResponse: "",
    url: fetchUrl || "",
    headers: headers || {},
    error: error.message,
    params: { model: model_id, temperature, max_tokens, top_p },
    messages: messagesWithPrompt,
  });

  throw error;
}
```

Replace it with:

```js
} catch (error) {
  if (error.name === "AbortError") {
    // User cancelled the request intentionally — skip error logging
    throw error;
  }

  addLog({
    characterName: character.name,
    promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
    resolvedSystemPrompt: processedPrompt,
    lastUserMessage: lastUserMsg,
    lastAiResponse: "",
    url: fetchUrl || "",
    headers: headers || {},
    error: error.message,
    params: { model: model_id, temperature, max_tokens, top_p },
    messages: messagesWithPrompt,
  });

  throw error;
}
```

- [ ] **Step 2: Test manually — stop and verify**

Run `npm run dev`:
1. Send a message → red stop button appears
2. Click stop while loading → button returns to green ArrowUp, no error in console
3. Verify the user's message stays in chat
4. Verify no AI response is added

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

- [ ] **Step 5: Final commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: handle AbortError gracefully without error logging"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ New imports: `useRef`, `Square` (Task 1)
- ✅ New state: `abortControllerRef` (Task 1)
- ✅ Send button toggles to stop button when loading (Task 1)
- ✅ `handleStop()` calls abort and clears ref (Task 1)
- ✅ Create controller in fetch block, pass signal (Task 2)
- ✅ Clear ref in finally (Task 2)
- ✅ AbortError detection skips error logging (Task 3)
- ✅ Only `SuperInput.jsx` changed — no store changes, no new packages

**2. Placeholder scan:** No TBDs, TODOs, or vague steps. All code shown in full. All commands included.

**3. Type consistency:** `abortControllerRef` used consistently. `isLoading` selector matches existing `setLoading` pattern in the store. Error check uses `error.name === "AbortError"` which is the standard AbortController error name.
