# Persona Management — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persona management system so users can edit their name, description, and avatar — and have it persist across page reloads.

**Architecture:** Add `persist` middleware to `useUserStore`, create a `PersonaModal` component matching `CharacterModal`'s style, add a "Persona" item to `InputMenu`, and show a user avatar in the SuperInput toolbar.

**Tech Stack:** Zustand with persist middleware, React, lucide-react icons, Tailwind CSS v4

---

### Task 1: Persist useUserStore

**Files:**
- Modify: `app/store/useUserStore.js`

- [ ] **Step 1: Add persist middleware**

Rewrite the store:

```js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: {
        name: "Mac",
        description: "23 male",
        avatarURL: "",
        message: "",
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "persona-storage",
      partialize: (state) => ({
        user: {
          name: state.user.name,
          description: state.user.description,
          avatarURL: state.user.avatarURL,
        },
      }),
    }
  )
);

export default useUserStore;
```

The `partialize` option excludes `message` from persistence so chat input resets on reload (desired behavior).

- [ ] **Step 2: Commit**

```bash
git add app/store/useUserStore.js
git commit -m "feat: persist user persona to localStorage via Zustand persist"
```

---

### Task 2: Create PersonaModal Component

**Files:**
- Create: `app/components/modal/PersonaModal.jsx`

- [ ] **Step 1: Write the component**

```jsx
'use client'
import React, { useState, useEffect } from "react";
import { X, User, Image, Save } from "lucide-react";
import useUserStore from "@/app/store/useUserStore";

export default function PersonaModal({ isOpen, onClose }) {
  const { user } = useUserStore();
  const setUser = useUserStore((state) => state.setUser);

  const [editableUser, setEditableUser] = useState({
    name: "",
    description: "",
    avatarURL: "",
  });

  useEffect(() => {
    if (isOpen) {
      setEditableUser({
        name: user?.name || "",
        description: user?.description || "",
        avatarURL: user?.avatarURL || "",
      });
    }
  }, [isOpen, user]);

  const handleInputChange = (field, value) => {
    setEditableUser({
      ...editableUser,
      [field]: value,
    });
  };

  const handleSave = () => {
    setUser({ ...user, ...editableUser });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full h-full md:h-auto md:max-h-[90vh] max-w-3xl rounded-2xl shadow-2xl flex flex-col font-sans border border-white/10 bg-[#121212] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#181818]">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <User size={18} className="text-green-400" />
            </div>
            Your Persona
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Left Column: Avatar Preview & URL */}
            <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
              {/* Avatar Preview */}
              <div className="aspect-square w-full bg-[#1a1a1a] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                {editableUser.avatarURL ? (
                  <img
                    src={editableUser.avatarURL}
                    alt="Avatar preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-600">
                    <Image size={48} strokeWidth={1} />
                    <span className="text-xs">No Avatar</span>
                  </div>
                )}
              </div>

              {/* Avatar URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avatar URL</label>
                <input
                  type="text"
                  value={editableUser.avatarURL}
                  onChange={(e) => handleInputChange("avatarURL", e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Right Column: Name & Description */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={editableUser.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your name (e.g. Mac)"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-lg font-medium text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={editableUser.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Your appearance, personality, background..."
                  className="w-full flex-1 min-h-[200px] bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all resize-none leading-relaxed font-mono"
                />
                <p className="text-[10px] text-gray-500 text-right">
                  Used as &#123;&#123;user_description&#125;&#125; in prompts.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-[#181818]">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>
        </footer>

      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/modal/PersonaModal.jsx
git commit -m "feat: add PersonaModal component for editing user persona"
```

---

### Task 3: Wire Persona into InputMenu and SuperInput

**Files:**
- Modify: `app/components/InputMenu.jsx`
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Add Persona to InputMenu**

Add `useState` for `isPersonaModalOpen` (if not already present). Import `PersonaModal`.

Add a new menu item after "Lorebook":

```js
{
  icon: <User size={18} />,
  label: "Persona",
  onClick: () => {
    setIsPersonaModalOpen(true);
    setIsOpen(false);
  },
},
```

Add the `isPersonaModalOpen` prop to the component's destructured props:

```js
export default function InputMenu({
  setIsCustomPromptOpen,
  setIsDebugModalOpen,
  setIsPersonaModalOpen,
}) {
```

- [ ] **Step 2: Update SuperInput to pass prop**

In `SuperInput.jsx`, add state for persona modal:

```js
const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
```

Pass it to `InputMenu`:

```jsx
<InputMenu
  setIsCustomPromptOpen={setIsCustomPromptOpen}
  setIsDebugModalOpen={setIsDebugModalOpen}
  setIsPersonaModalOpen={setIsPersonaModalOpen}
/>
```

Import and render `PersonaModal`:

```js
import PersonaModal from "./modal/PersonaModal";
```

```jsx
{isPersonaModalOpen && <PersonaModal isOpen={isPersonaModalOpen} onClose={() => setIsPersonaModalOpen(false)} />}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/InputMenu.jsx app/components/SuperInput.jsx
git commit -m "feat: add Persona menu item to InputMenu and wire into SuperInput"
```

---

### Task 4: Show User Avatar in SuperInput Toolbar

**Files:**
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Show small avatar circle in toolbar**

Read `user.avatarURL` from store. In the bottom toolbar (left side, before the "All Characters" button), add a small circular avatar button:

```jsx
{user?.avatarURL ? (
  <button
    onClick={() => setIsPersonaModalOpen(true)}
    className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#454545] hover:border-[#3A9E49] transition-colors"
    title="Edit Persona"
  >
    <img src={user.avatarURL} alt="Your avatar" className="w-full h-full object-cover" />
  </button>
) : (
  <button
    onClick={() => setIsPersonaModalOpen(true)}
    className="flex items-center justify-center w-8 h-8 bg-white/5 border border-[#454545] rounded-full hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all"
    title="Edit Persona"
  >
    <User size={16} className="text-[#EEEEEE]" />
  </button>
)}
```

Import `User` from lucide-react if not already imported.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: show user avatar button in SuperInput toolbar"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Persist useUserStore with partialize (Task 1)
- ✅ PersonaModal with name, description, avatarURL (Task 2)
- ✅ Persona menu item in InputMenu (Task 3)
- ✅ Persona modal wired into SuperInput (Task 3)
- ✅ User avatar shown in toolbar (Task 4)
- ✅ `{{user_description}}` already works in replacerTemplate — no changes needed there

**2. Placeholder scan:** No TBDs, TODOs, or vague steps. All code shown in full.

**3. Type consistency:** `user` object fields (`name`, `description`, `avatarURL`, `message`) used consistently. `setUser` signature unchanged. `partialize` correctly excludes `message`.
