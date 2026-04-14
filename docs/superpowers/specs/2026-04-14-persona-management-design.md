# Persona Management — Design Spec

## Problem

User persona (name, description) resets on every page reload because `useUserStore` is not persisted. There's no UI for users to edit their persona. The `{{user}}` and `{{user_description}}` placeholders in system prompts work but are limited to hardcoded defaults.

## Solution

1. Add `persist` middleware to `useUserStore` so persona survives page reloads
2. Add a "Persona" item to the InputMenu dropdown
3. Create `PersonaModal.jsx` — a modal for editing user name, description, and avatar URL
4. Avatar displays in SuperInput toolbar as a visual indicator

## Changes

### `useUserStore.js`
- Wrap with `persist` middleware, store key `persona-storage`
- Exclude `message` from persistence (it's ephemeral chat input)
- Migrate existing defaults (name: "Mac", description: "23 male")

### `PersonaModal.jsx` (new file)
- Follows same visual style as `CharacterModal` (dark theme, rounded inputs, green save button)
- Fields: name (text input), description (textarea), avatarURL (text input)
- Preview avatar image
- Saves to `useUserStore`, closes on save/cancel

### `InputMenu.jsx`
- Add "Persona" menu item with `User` icon
- Opens `PersonaModal` when clicked

### `SuperInput.jsx`
- Show user avatar (small circle) in the toolbar if avatarURL is set
- Opens PersonaModal on click

## No store changes beyond persistence. No new packages.
