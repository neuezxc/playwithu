# Stop Generation Button — Design Spec

## Problem

Users have no way to cancel an AI response once it's being generated. The send button remains active during loading and users can accidentally fire off duplicate requests.

## Solution

Replace the green send button with a red stop button while the API call is in flight. Clicking stop cancels the request using `AbortController`.

## Changes

### File: `app/components/SuperInput.jsx`

**New imports:**
- `useRef` from React
- `Square` from lucide-react

**New state:**
- `abortControllerRef` — a `useRef` holding the active `AbortController` instance

**Send button behavior:**
- Not loading: green `ArrowUp` icon, calls `handleMessage()`
- Loading (`isLoading === true`): red `Square` icon, calls `handleStop()`

**handleStop():**
- Calls `abortControllerRef.current?.abort()`
- Sets ref to `null`

**handleMessage() changes:**
- At the start of the fetch block, create `new AbortController()` and store it in the ref
- Pass `{ signal: controller.signal }` as the 4th argument to `fetch()`
- In the `catch` block, check for `error.name === 'AbortError'` — if true, skip error logging and just reset loading
- In the `finally` block, null out the ref

**After stop:**
- User's message stays in chat (already added before fetch starts)
- No AI response message is created (the request was cancelled)
- Loading state resets, send button returns to green ArrowUp

## No other files change. No store changes. No new packages.
