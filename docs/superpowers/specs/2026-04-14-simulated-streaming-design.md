# Simulated Streaming (Fake Typewriter) — Design Spec

## Problem

Proxies that don't support SSE return the full JSON response at once. The current fallback shows all text instantly, losing the streaming feel.

## Solution

When `response.body` is missing (no SSE support), fetch the full JSON as before, then reveal the text character-by-character using `setInterval`. This simulates the typewriter effect even without true streaming.

## Data Flow

1. Fetch returns full JSON response with complete text
2. We store the full text in a variable
3. Add placeholder assistant message with empty content
4. Start `setInterval` that reveals ~5 characters per tick (~30 chars/sec at 60ms intervals)
5. Each tick updates the Zustand store with accumulated text so UI refreshes
6. When all text is revealed, clear interval, set `isLoading = false`
7. If user clicks stop: clear interval, partial message stays

## Changes

### `app/components/SuperInput.jsx`

In the `if (!response.body)` fallback block, instead of:
```js
setCharacter({ ...character, messages: [...messagesWithPrompt, { role: "assistant", content: text }] });
```

Replace with:
```js
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

// Store interval ID so handleStop can clear it
abortControllerRef.current = { abort: () => clearInterval(streamInterval) };

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
```

### `app/store/useCharacterStore.js`

Similar changes for `regenerateLastMessage` and `editUserMessageAndRegenerate` fallback paths. Use `setInterval` with the same timing. The stop button already calls `handleStop()` which aborts the controller — we need to also make it clear the interval.

**Key change in `SuperInput.jsx`:** `handleStop` currently does:
```js
abortControllerRef.current?.abort();
```

This works because we store `{ abort: () => clearInterval(streamInterval) }` in the ref.

### No other files change. No store changes. No new packages.
