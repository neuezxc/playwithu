# PlayWithU — Agent Instructions

## Project Overview

AI character roleplay chat app. Next.js 15 App Router + Zustand + Tailwind CSS v4. Calls the OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`) directly from client components—no backend routes.

## Commands

- `npm run dev` — dev server (uses Turbopack)
- `npm run build` — production build (uses Turbopack)
- `npm run lint` — ESLint (next/core-web-vitals config)
- No test runner is configured.

## Architecture

- **Single-page app** at `app/page.js` — the root is `"use client"`; there are no server components with data fetching.
- **Zustand stores** (`app/store/`) are persisted to localStorage via `zustand/middleware/persist`. Store keys: `api-storage`, `character-storage`, `chat-storage`, `prompt-storage`, `memory-storage`.
- **`useCharacterStore`** is the central store: holds the active character, character list, message history, pattern replacements, and the `replacerTemplate` function. Other stores import from it.
- **`useApiSettingStore`** holds the OpenRouter API key, model ID, and generation parameters (temperature, max_tokens, etc.).
- **`usePromptStore`** manages the system prompt with `{{placeholder}}` template syntax (`{{char}}`, `{{user}}`, `{{char_description}}`, etc.). Has a default prompt and supports custom prompt selection.
- **`useMemoryStore`** handles chat summarization—also calls the OpenRouter API directly.
- **`useUserStore`** is NOT persisted (no `persist` middleware). Resets on page reload.

## Key Conventions

- **Path alias**: `@/*` → project root (configured in `jsconfig.json`), but source files primarily use relative imports.
- **JavaScript only** — no TypeScript.
- **`.jsx` for components, `.js` for stores/utils** — both work; convention is inconsistent.
- **No CSS modules or Stylus** — uses Tailwind utility classes only, plus `globals.css` for base styles.
- **Exported component files** use `export default` or named exports; the barrel file is `app/components/index.js`.

## Gotchas

- **`useCharacterStore` uses cross-store imports**: it calls `usePromptStore.getState()`, `useUserStore.getState()`, `useApiSettingStore.getState()`, `useDebugStore.getState()` directly inside action functions. Do not reorder store definitions or you'll break circular dependencies.
- **Message regeneration** stores candidate arrays (`message.candidates[]` + `message.currentIndex`) on assistant messages. UI needs to handle these extra fields.
- **`useUserStore` is not persisted** — user name/description resets on every reload. This appears intentional but could be a source of confusion.
- **All API calls go to a hardcoded OpenRouter endpoint**. If adding a backend proxy or different provider, update `useCharacterStore`, `useMemoryStore`, and `SuperInput.jsx`.
- **Default model ID** is `openrouter/sonoma-dusk-alpha` — defined in `useApiSettingStore`.

## Style Notes (from QWEN.md)

- No semicolons unless needed to disambiguate
- Single quotes for strings
- 2-space indentation
- `===` only, no `==`
- `handleXxx` naming for event handlers
- Named exports preferred for components
- Prefer server components; minimize `'use client'` (though this app is mostly client-side)