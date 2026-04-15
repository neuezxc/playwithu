# Simulated Streaming (Fake Typewriter) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the proxy doesn't support SSE, simulate a typewriter effect by fetching the full JSON response and revealing text character-by-character using `setInterval`.

**Architecture:** Single-file modifications to `SuperInput.jsx` and `useCharacterStore.js`. Replace the instant `setCharacter` call in the `if (!response.body)` fallback with a `setInterval` loop that reveals ~5 chars every 60ms. Store the interval reference so `handleStop` can cancel it.

**Tech Stack:** React, Zustand, setInterval, Fetch API

---

### Task 1: Add Simulated Streaming to `handleMessage` in `SuperInput.jsx`

**Files:**
- Modify: `app/components/SuperInput.jsx`

**Context:** The current `if (!response.body)` fallback in `handleMessage` sets the full text at once. We replace it with a `setInterval` loop that reveals text gradually.

The current code block looks like this (inside the `if (!response.body)` block):

```js
if (!response.body) {
  const data = await response.json().catch(() => ({}));
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices returned from API");
  }
  const text = data.choices[0].message.content;

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
    messages: [...messagesWithPrompt, { role: "assistant", content: text }],
  });
  return;
}
```

- [ ] **Step 1: Replace the instant setCharacter with setInterval loop**

Replace the entire `if (!response.body)` block with:

```js
if (!response.body) {
  const data = await response.json().catch(() => ({}));
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices returned from API");
  }
  const text = data.choices[0].message.content;

  // Add placeholder assistant message
  setCharacter({
    ...useCharacterStore.getState().character,
    messages: [...messagesWithPrompt, { role: "assistant", content: "" }],
  });

  // Simulate streaming with setInterval
  let revealedIndex = 0;
  const charsPerTick = 5;
  const intervalMs = 60;

  const streamInterval = setInterval(() => {
    revealedIndex += charsPerTick;
    if (revealedIndex >= text.length) {
      revealedIndex = text.length;
      clearInterval(streamInterval);
      abortControllerRef.current = null;
      setLoading(false);
    }
    const revealedText = text.slice(0, revealedIndex);
    setCharacter({
      ...useCharacterStore.getState().character,
      messages: [...messagesWithPrompt, { role: "assistant", content: revealedText }],
    });
  }, intervalMs);

  // Store abort reference so handleStop can clear the interval
  abortControllerRef.current = { abort: () => {
    clearInterval(streamInterval);
    abortControllerRef.current = null;
    setLoading(false);
  }};

  // Log the final response
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
  return;
}
```

- [ ] **Step 2: Verify lint passes**

Run `npm run lint`.

- [ ] **Step 3: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: simulate typewriter effect when SSE not available (proxy fallback)"
```

---

### Task 2: Add Simulated Streaming to `useCharacterStore.js`

**Files:**
- Modify: `app/store/useCharacterStore.js`

**Context:** Both `editUserMessageAndRegenerate` and `regenerateLastMessage` have `if (!response.body)` fallbacks that set text instantly. We need to add simulated streaming to both.

However, these functions run inside the Zustand store and don't have access to `abortControllerRef` (which is in `SuperInput.jsx`). For now, they will run the full simulated animation without stop support. The stop button only works during the initial `handleMessage` call.

- [ ] **Step 1: Replace fallback in `editUserMessageAndRegenerate`**

Find the `if (!response.body)` block in `editUserMessageAndRegenerate` and replace with:

```js
if (!response.body) {
  const data = await response.json().catch(() => ({}));
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices returned from API");
  }
  const text = data.choices[0].message.content;

  const assistantMsgIndex = index + 1;

  // Add placeholder assistant message
  set((state) => {
    const msgs = [...state.character.messages];
    msgs[assistantMsgIndex] = { role: "assistant", content: "" };
    return { character: { ...state.character, messages: msgs } };
  });

  // Simulate streaming
  let revealedIndex = 0;
  const charsPerTick = 5;
  const intervalMs = 60;

  const streamInterval = setInterval(() => {
    revealedIndex += charsPerTick;
    if (revealedIndex >= text.length) {
      revealedIndex = text.length;
      clearInterval(streamInterval);
      setLoading(false);
    }
    const revealedText = text.slice(0, revealedIndex);
    set((state) => {
      const msgs = [...state.character.messages];
      msgs[assistantMsgIndex] = { role: "assistant", content: revealedText };
      return { character: { ...state.character, messages: msgs } };
    });
  }, intervalMs);

  // Log the final response
  addLog({
    characterName: get().character.name,
    promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
    resolvedSystemPrompt: systemMsg?.content || "",
    lastUserMessage: lastUserMsg?.content || "",
    lastAiResponse: text,
    url: fetchUrl,
    headers: headers,
    params: { model: model_id, temperature, max_tokens, top_p },
    messages: currentMessages,
  });
  return;
}
```

- [ ] **Step 2: Replace fallback in `regenerateLastMessage`**

Find the `if (!response.body)` block in `regenerateLastMessage` and replace with:

```js
if (!response.body) {
  const data = await response.json().catch(() => ({}));
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices returned from API");
  }
  const text = data.choices[0].message.content;

  // Add placeholder assistant message
  set((state) => {
    const currentMessages = [...state.character.messages];
    const targetMessage = { ...currentMessages[lastMessageIndex] };
    if (!targetMessage.candidates) {
      targetMessage.candidates = [targetMessage.content];
    }
    targetMessage.candidates.push("");
    targetMessage.currentIndex = targetMessage.candidates.length - 1;
    targetMessage.content = "";
    currentMessages[lastMessageIndex] = targetMessage;

    return { character: { ...state.character, messages: currentMessages } };
  });

  // Simulate streaming
  let revealedIndex = 0;
  const charsPerTick = 5;
  const intervalMs = 60;

  const streamInterval = setInterval(() => {
    revealedIndex += charsPerTick;
    if (revealedIndex >= text.length) {
      revealedIndex = text.length;
      clearInterval(streamInterval);
      setLoading(false);
    }
    const revealedText = text.slice(0, revealedIndex);
    set((state) => {
      const currentMessages = [...state.character.messages];
      const targetMessage = { ...currentMessages[lastMessageIndex] };
      if (!targetMessage.candidates) {
        targetMessage.candidates = [targetMessage.content];
      }
      targetMessage.candidates[targetMessage.candidates.length - 1] = revealedText;
      targetMessage.currentIndex = targetMessage.candidates.length - 1;
      targetMessage.content = revealedText;
      currentMessages[lastMessageIndex] = targetMessage;

      return { character: { ...state.character, messages: currentMessages } };
    });
  }, intervalMs);

  // Log the final response
  addLog({
    characterName: get().character.name,
    promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
    resolvedSystemPrompt: systemMsg?.content || "",
    lastUserMessage: lastUserMsg?.content || "",
    lastAiResponse: text,
    url: fetchUrl,
    headers: headers,
    params: { model: model_id, temperature, max_tokens, top_p },
    messages: contextMessages,
  });
  return;
}
```

- [ ] **Step 3: Verify lint passes**

Run `npm run lint`.

- [ ] **Step 4: Commit**

```bash
git add app/store/useCharacterStore.js
git commit -m "feat: simulate typewriter effect in regenerate and edit functions"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Simulated streaming in `handleMessage` — Task 1
- ✅ Simulated streaming in `editUserMessageAndRegenerate` — Task 2
- ✅ Simulated streaming in `regenerateLastMessage` — Task 2
- ✅ Stop button cancels interval in `handleMessage` via `abortControllerRef` — Task 1
- ✅ `addLog` calls use full `text` — all three functions
- ✅ No other files change, no store changes, no new packages — confirmed

**2. Placeholder scan:** No TBDs, TODOs, or vague references.

**3. Type/signature consistency:**
- `setCharacter` — used in SuperInput.jsx
- `set((state) => {...})` — used in useCharacterStore.js
- `abortControllerRef` — used in SuperInput.jsx for stop button
- `setLoading(false)` — called when animation completes
- `charsPerTick = 5`, `intervalMs = 60` — consistent across all functions

Plan is ready for execution.
