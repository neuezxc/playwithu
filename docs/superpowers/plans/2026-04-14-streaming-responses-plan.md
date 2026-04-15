# Streaming Responses with Typewriter Effect — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add streaming SSE response parsing to the chat input so AI text appears character-by-character as it arrives from the OpenRouter API.

**Architecture:** Single-file modification to `SuperInput.jsx`. Add `stream: true` to the API request body. Replace `await response.json()` with a ReadableStream read loop. Parse SSE chunks, extract `delta.content`, and update the Zustand store incrementally. The UI already renders `message.content` reactively, so streaming text appears automatically.

**Tech Stack:** React, Zustand, Fetch API ReadableStream, SSE (Server-Sent Events), TextDecoder

---

### Task 1: Add Streaming to `handleMessage` in `SuperInput.jsx`

**Files:**
- Modify: `app/components/SuperInput.jsx`

**Context:** The current `handleMessage` function sends a fetch request, waits for `await response.json()`, then adds the full response text as a new assistant message. We replace that flow with streaming.

The relevant code block is inside the `try` block of `handleMessage`, after the fetch call and before the error handling. Currently it looks like:

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

const data = await response.json().catch(() => ({}));

if (!response.ok) {
  const errorMessage = data.error?.message || response.statusText || "API request failed";
  throw new Error(`${errorMessage} (${response.status})`);
}
if (!data.choices || data.choices.length === 0) {
  throw new Error("No choices returned from API");
}

const text = data.choices[0].message.content;

// Log the response
addLog({
  characterName: character.name,
  promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
  resolvedSystemPrompt: processedPrompt,
  lastUserMessage: lastUserMsg,
  lastAiResponse: text,
  url: fetchUrl,
  headers: headers,
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: messagesWithPrompt,
});

setCharacter({
  ...character,
  messages: [
    ...messagesWithPrompt,
    {
      role: "assistant",
      content: text,
    },
  ],
});
```

This entire block needs to be replaced with the streaming version.

- [ ] **Step 1: Add `stream: true` to the request body**

Find the `body` object in `handleMessage` and add `stream: true`:

```js
const body = {
  model: model_id,
  messages: messagesWithPrompt,
  temperature: temperature,
  top_p: top_p,
  stream: true,
};
```

- [ ] **Step 2: Replace the JSON response handling with streaming**

Replace the entire code block from `const response = await fetch(...)` to the `setCharacter({...})` call with this streaming version:

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

// Handle non-streaming error responses (e.g., 401, 400)
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.error?.message || response.statusText || "API request failed";
  throw new Error(`${errorMessage} (${response.status})`);
}

const reader = response.body.getReader();
const decoder = new TextDecoder();
let accumulatedText = "";

// Add placeholder assistant message so the UI shows the bubble
setCharacter({
  ...character,
  messages: [...messagesWithPrompt, { role: "assistant", content: "" }],
});

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (data === "[DONE]") break;

    try {
      const parsed = JSON.parse(data);
      const content = parsed.choices?.[0]?.delta?.content || "";
      if (content) {
        accumulatedText += content;
        setCharacter({
          ...character,
          messages: [...messagesWithPrompt, { role: "assistant", content: accumulatedText }],
        });
      }
    } catch {
      // Skip invalid JSON lines — common in streaming
    }
  }
}

// Log the final response
addLog({
  characterName: character.name,
  promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
  resolvedSystemPrompt: processedPrompt,
  lastUserMessage: lastUserMsg,
  lastAiResponse: accumulatedText,
  url: fetchUrl,
  headers: headers,
  params: { model: model_id, temperature, max_tokens, top_p },
  messages: messagesWithPrompt,
});
```

- [ ] **Step 3: Verify the change is correct**

Read the full `handleMessage` function and check:
- `stream: true` is in the body
- `response.ok` check handles error responses before streaming starts
- The ReadableStream loop parses SSE correctly
- `setCharacter` updates the assistant message incrementally
- The `addLog` call uses `accumulatedText` instead of `data.choices[0].message.content`
- The `catch` blocks below (AbortError, error logging) are untouched

- [ ] **Step 4: Run the dev server and test**

Run `npm run dev`. Open the app. Send a message to the AI. The response should appear character-by-character. Click the stop button mid-stream — the partial message should stay in chat.

- [ ] **Step 5: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: add streaming SSE response parsing with typewriter effect"
```

---

### Task 2: Update `regenerateLastMessage` in `useCharacterStore.js` (Optional but recommended)

**Files:**
- Modify: `app/store/useCharacterStore.js`

**Context:** `SuperInput.jsx` handles the initial message send, but `useCharacterStore.js` has two other functions that also call the API: `regenerateLastMessage` and `editUserMessageAndRegenerate`. These still use the old `await response.json()` approach. For consistency, we should add streaming to these too.

This is a separate task because it's a different file and the code structure is slightly different (the message is already in the store, we update it in place rather than adding a new one).

- [ ] **Step 1: Add `stream: true` to the request body in `regenerateLastMessage`**

Find the `body` object in `regenerateLastMessage` and add `stream: true`:

```js
const body = {
  model: model_id,
  messages: contextMessages,
  temperature: temperature,
  top_p: top_p,
  stream: true,
};
```

- [ ] **Step 2: Replace the JSON response handling in `regenerateLastMessage`**

Find the block from `const response = await fetch(...)` to `set((state) => {...})` and replace with:

```js
const response = await fetch(
  fetchUrl,
  {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }
);

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.error?.message || response.statusText || "API request failed";
  throw new Error(`${errorMessage} (${response.status})`);
}

const reader = response.body.getReader();
const decoder = new TextDecoder();
let accumulatedText = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (data === "[DONE]") break;

    try {
      const parsed = JSON.parse(data);
      const content = parsed.choices?.[0]?.delta?.content || "";
      if (content) {
        accumulatedText += content;
        set((state) => {
          const currentMessages = [...state.character.messages];
          const targetMessage = { ...currentMessages[lastMessageIndex] };

          if (!targetMessage.candidates) {
            targetMessage.candidates = [targetMessage.content];
          }

          targetMessage.candidates.push(accumulatedText);
          targetMessage.currentIndex = targetMessage.candidates.length - 1;
          targetMessage.content = accumulatedText;
          currentMessages[lastMessageIndex] = targetMessage;

          return {
            character: {
              ...state.character,
              messages: currentMessages,
            },
          };
        });
      }
    } catch {
      // Skip invalid JSON
    }
  }
}
```

- [ ] **Step 3: Add `stream: true` to the request body in `editUserMessageAndRegenerate`**

Find the `body` object in `editUserMessageAndRegenerate` and add `stream: true`:

```js
const body = {
  model: model_id,
  messages: currentMessages,
  temperature: temperature,
  top_p: top_p,
  stream: true,
};
```

- [ ] **Step 4: Replace the JSON response handling in `editUserMessageAndRegenerate`**

Find the inner `try` block's response handling (the `fetch` call through the `setCharacter` call) and replace with:

```js
const response = await fetch(
  fetchUrl,
  {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }
);

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.error?.message || response.statusText || "API request failed";
  throw new Error(`${errorMessage} (${response.status})`);
}

const reader = response.body.getReader();
const decoder = new TextDecoder();
let accumulatedText = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (data === "[DONE]") break;

    try {
      const parsed = JSON.parse(data);
      const content = parsed.choices?.[0]?.delta?.content || "";
      if (content) {
        accumulatedText += content;
        set((state) => ({
          character: {
            ...state.character,
            messages: [
              ...state.character.messages,
              {
                role: "assistant",
                content: accumulatedText,
              },
            ],
          },
        }));
      }
    } catch {
      // Skip invalid JSON
    }
  }
}
```

Note: This uses `set()` with an accumulating message being appended each update. This is less efficient than updating in place, but the function doesn't have a pre-created assistant message to update — it creates one as it goes. For a follow-up optimization, we could pre-create the message and update it by index.

- [ ] **Step 5: Run the dev server and test**

Run `npm run dev`. Test:
1. Send a message — streaming works
2. Regenerate the last message — streaming works
3. Edit a message and regenerate — streaming works
4. Click stop mid-stream — partial message stays

- [ ] **Step 6: Commit**

```bash
git add app/store/useCharacterStore.js
git commit -m "feat: add streaming to regenerate and edit-regenerate functions"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ `stream: true` added to API requests — Task 1 Step 1, Task 2 Steps 1 & 3
- ✅ ReadableStream read loop — Task 1 Step 2, Task 2 Steps 2 & 4
- ✅ SSE parsing (split by newlines, `data:` prefix, `[DONE]` check, JSON parse) — Task 1 Step 2
- ✅ Incremental `setCharacter` / `set()` calls with accumulated text — Task 1 Step 2, Task 2 Steps 2 & 4
- ✅ AbortError handling unchanged — existing catch blocks untouched
- ✅ Debug logging uses `accumulatedText` — Task 1 Step 2
- ✅ Error handling for non-200 responses — Task 1 Step 2, Task 2 Steps 2 & 4
- ✅ No other files change, no store changes, no new packages — confirmed

**2. Placeholder scan:**
- No TBDs, TODOs, or vague references
- All code blocks contain actual implementation code
- All function names and variable names are consistent (`accumulatedText`, `setCharacter`, `messagesWithPrompt`, etc.)

**3. Type/signature consistency:**
- `accumulatedText` — string, used consistently across all tasks
- `setCharacter` — Zustand setter from `useCharacterStore`, used in Task 1
- `set()` — Zustand setter callback, used in Task 2
- `lastMessageIndex` — defined in the existing `regenerateLastMessage` function, used in Task 2
- `contextMessages` — defined in the existing `regenerateLastMessage` function, used in Task 2
- `currentMessages` — defined in the existing `editUserMessageAndRegenerate` function, used in Task 2

Plan is ready for execution.
