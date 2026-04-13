# Prompt Manager Mobile UX Redesign — Design Spec

**Date:** 2026-04-13
**Status:** Draft
**Scope:** Rebuild the CustomPromptModal UI/UX to feel premium, native, and perfectly responsive, especially fixing the cramped mobile experience.

---

## Architecture: Responsive Stack Navigation

The modal will use a smart responsive layout that shifts from a two-pane (desktop) to a single-pane stack (mobile) without duplicating state.

### State Addition
- `mobileView`: `'list' | 'editor'` (Defaults to `'list'`)
- When user taps a prompt on mobile, it sets `mobileView` to `'editor'`. 
- When user taps the "Back" button in the editor, it sets `mobileView` to `'list'`. 
- On desktop sizes (`md:` breakpoint), this state is ignored and both panes are shown side-by-side.

---

## Visual Aesthetics & Glassmorphism

- **Background:** `#0d0d0d` with a 90% opacity and `backdrop-blur-xl`.
- **Gradients:** Subtle, low-opacity radial gradients behind the active prompt card and the save button to give a "glowing" effect.
- **Borders:** `border-white/5` instead of heavy grays, creating sharp, clean separations.
- **Typography:** Using Inter variables (tracking-tight on headers, leading-relaxed on prompt bodies).

---

## Mobile View: The List (`mobileView === 'list'`)

- **Full Width:** The sidebar takes 100% width on mobile.
- **Prompt Cards:** 
  - Each item is a rounded card with a dark background `bg-[#161616]`.
  - The currently active prompt has a rich green border inset `ring-1 ring-[#5fdb72]/50` and a visible "Active" badge.
- **FAB (Floating Action Button):** The "+ New" button becomes a fixed circle bottom-right button over the list on mobile for native feel.
- **Import/Export:** Lives in a small header actions menu (dots or icons) rather than taking up vertical space.

---

## Mobile View: The Editor (`mobileView === 'editor'`)

- **Navigation Bar:** A top bar with `< Back` on the left (returns to list) and a sleek `Save` or `Set Active` action on the right.
- **Toolbar Consolidation:** 
  - **Edit/Preview Toggle:** A beautiful iOS-styled segmented control (e.g. gray background, sliding white pill for the active state).
  - **Variable Pills:** Instead of a dropdown, variables are horizontally scrollable pills right above the textarea: `[ {{char}} ] [ {{user}} ] [ {{scenario}} ]` allowing one-tap insertion on mobile.
- **Textarea:** Fills the remaining vertical height entirely seamlessly, no heavy borders. 

---

## Desktop Overhaul enhancements

- **Smooth Split Pane:** 300px sidebar, remainder is editor. A highly distinct, thin separator line. 
- **Hover Micro-interactions:** Prompt cards elegantly shift `translate-x-1` on hover and increase brightness.
- **Preview Styling:** The previewed prompt isn't just text. Any text that originated from a placeholder replacement (like the character's name) will be wrapped in a subtle `bg-[#5fdb72]/10 text-[#5fdb72]` so the user exactly sees what the engine injected.

---

## Component Structure & Files

**Modify:** `app/components/modal/CustomPromptModal.jsx`
*We recently rebuilt the logic for this file, so we just need to replace the JSX rendering tree and local UI state, leaving the store interactions intact.*

**No other files need modification.**

---

## Data Flow & Handlers
- Logic handlers like `handleSave`, `handleImportFile`, `handleExport` etc., remain identical.
- We add `hasMobileView` logic and hide/show columns using Tailwind classes like `max-md:hidden` and `max-md:flex`.

## Testing
- Verify responsive layout: Screen resize from < 768px to > 768px.
- Test stack navigation on mobile: Tap prompt -> Editor appears. Tap back -> List appears.
- Test scrollable variable pills above the content area.
- Verify desktop maintains side-by-side view.
