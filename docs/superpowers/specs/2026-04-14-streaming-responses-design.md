# Streaming Responses with Typewriter Effect — Design Spec

## Problem

AI responses appear all at once after a long wait. Users see "Thinking..." with no progress indication, making the app feel slow and unresponsive.

## Solution

Add `stream: true` to the OpenRouter API request. Parse the SSE (Server-Sent Events) response as a ReadableStream, extract text deltas from each chunk, and update the message incrementally in the Zustand store. Text appears character-by-character as it arrives (typewriter effect).

## Data Flow

1. User sends message → message added to chat → `isLoading = true`
2. API call starts with `stream: true` in the request body
3. We get a `ReadableStream` back, create a `TextDecoder` to read chunks
4. Parse each SSE chunk: look for `data: {"choices":[{"delta":{"content":"..."}}]}`
5. Extract the `content` field and append to a running text buffer
6. Call `set()` to update the current message with accumulated text
7. Repeat until stream ends (`[DONE]`)
8. Set `isLoading = false`, message is complete
9. If user clicks stop: AbortController cancels, partial message stays, loading resets

## SSE Chunk Format

Each chunk looks like:
```
data: {"id":"...","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"...","choices":[{"delta":{"content":" world"},"index":0}]}

data: [DONE]
```

## Changes

### File: `app/components/SuperInput.jsx`

This is the ONLY file that needs changing. The `handleMessage` function contains the fetch call that currently waits for a full JSON response. We replace that with a streaming read loop.

**New helper function:** `parseStreamChunk(line)` — extracts text from an SSE data line. Returns the text content or null if the line is `[DONE]` or invalid.

**Streaming read loop:** After getting the response, instead of `await response.json()`:
```js
const reader = response.body.getReader()
const decoder = new TextDecoder()
let accumulatedText = ""

// Add placeholder assistant message
const assistantMsgIndex = messagesWithPrompt.length
setCharacter({
  ...character,
  messages: [...messagesWithPrompt, { role: "assistant", content: "" }],
})

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value, { stream: true })
  const lines = chunk.split("\n")

  for (const line of lines) {
    if (!line.startsWith("data:")) continue
    const data = line.slice(5).trim()
    if (data === "[DONE]") break

    try {
      const parsed = JSON.parse(data)
      const content = parsed.choices?.[0]?.delta?.content || ""
      if (content) {
        accumulatedText += content
        setCharacter({
          ...character,
          messages: [...messagesWithPrompt, { role: "assistant", content: accumulatedText }],
        })
      }
    } catch {
      // Skip invalid JSON lines
    }
  }
}
```

**AbortError handling:** Unchanged. The existing `catch` block for `AbortError` still works — the partial message stays in chat.

**Debug logging:** Log the final `accumulatedText` as `lastAiResponse` after the stream completes.

### No other files change

- `useCharacterStore.js` — no changes (streaming happens in SuperInput.jsx)
- Store structure unchanged (messages still stored as `{ role, content }`)
- UI components unchanged (they already render `message.content` reactively)
- Stop button unchanged (AbortController still cancels the stream)
- Candidate cycling on regenerate unchanged

## Error Handling

- **Network errors:** Caught by outer try/catch, logged to debug, console.error
- **AbortError:** Partial message stays in chat, loading resets, no error logged
- **Invalid SSE chunks:** Skipped silently (malformed JSON lines are common in streaming)
- **Non-200 responses:** Error thrown as before, caught and logged

## No other files change. No store changes. No new packages.
