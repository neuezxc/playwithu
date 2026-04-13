# API Settings UI Fidelity Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the styling of the API Settings modal to perfectly match the chat page's premium dark glassmorphic design.

**Architecture:** No logic changes. Update Tailwind utility classes in `ApiSettingsModal.jsx` to map to custom hex variables (`#3A9E49`, `#212121/95`, `#E4E4E4`).

**Tech Stack:** Next.js, Tailwind v4.

*Note: Since no test runner is configured for this project, verification relies on linting and manual styling checks.*

---

### Task 1: Re-skin the Core Container & Modals Background

**Files:**
- Modify: `app/components/modal/ApiSettingsModal.jsx`

- [ ] **Step 1: Replace Background & Container borders**

In `ApiSettingsModal.jsx`, find the main container div matching `className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300"`:
Change `backdrop-blur-sm` to `backdrop-blur-md`.

Find the immediate child div `className="w-full h-full md:h-auto... bg-[#121212]"` and change `bg-[#121212]` to `bg-[#212121]/95` and `border-white/10` to `border-[#282828]`.

Similarly, for the Header and Tabs section, find `bg-[#181818]` and `bg-[#121212]` and remove them or change them to `bg-transparent`. Change all `border-white/5` and `border-white/10` across the entire document to `border-[#282828]`.

### Task 2: Re-skin Text, Inputs, and Accents

**Files:**
- Modify: `app/components/modal/ApiSettingsModal.jsx`

- [ ] **Step 1: Update Green Accents and typography**

Throughout `ApiSettingsModal.jsx`:
- Replace `text-green-400` with `text-[#3A9E49]`.
- Replace `bg-green-500` with `bg-[#3A9E49]`.
- Replace `bg-green-500/10` with `bg-[#3A9E49]/10`.
- Replace `text-green-300` with `text-[#3A9E49]`.
- Replace `text-white` with `text-[#E4E4E4]`.
- Replace `text-gray-400` with `text-[#CDCDCD]`.
- Replace `text-gray-500` with `text-[#A2A2A2]`.
- Replace `text-gray-600` with `text-[#A2A2A2]`.
- Replace `bg-[#1a1a1a]` with `bg-transparent`.
- For the active tab active indicator: change `bg-green-400` to `bg-[#3A9E49]`.

For focus borders (inputs): replace `focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50` with `focus:border-[#3A9E49] focus:ring-1 focus:ring-[#3A9E49]/50`.
For range inputs (sliders): replace `[&::-webkit-slider-thumb]:bg-green-500` with `[&::-webkit-slider-thumb]:bg-[#3A9E49]`.

### Task 3: Lint and Commit

- [ ] **Step 1: Run linter to ensure component valid**

Run: `npm run lint`
Expected: Completion without errors.

- [ ] **Step 2: Commit**

```bash
git add app/components/modal/ApiSettingsModal.jsx
git commit -m "style: apply premium chat design fidelity to ApiSettingsModal"
```
