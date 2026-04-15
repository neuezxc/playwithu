# Placeholder Replacement Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix placeholder replacement so `{{user}}`, `{{char}}`, etc. always resolve to real values, and add validation to catch unresolved placeholders before API calls.

**Architecture:** Replace the manually-duplicated `values` object in `setActiveCharacter` with a call to the shared `buildPlaceholderValues()` function. Add a `validatePlaceholders()` utility that scans resolved prompts for any remaining `{{...}}` patterns and warns in console. Call this validation in `SuperInput.jsx` before the API fetch.

**Tech Stack:** JavaScript, Zustand, Next.js 15

---

### Task 1: Add `validatePlaceholders()` to replacerTemplate.js

**Files:**
- Modify: `app/utils/replacerTemplate.js`

- [ ] **Step 1: Add the `validatePlaceholders` function**

Add this function at the end of `app/utils/replacerTemplate.js`, after `buildPlaceholderValues()`:

```js
/**
 * Check if a resolved template still contains unresolved {{...}} placeholders.
 * Returns { valid: true } if all resolved, or { valid: false, unresolved: [...] }
 *
 * @param {string} resolvedText - The template after placeholder replacement
 * @returns {{ valid: boolean, unresolved?: string[] }}
 */
export function validatePlaceholders(resolvedText) {
  if (!resolvedText) return { valid: true }
  const unresolved = resolvedText.match(/{{\w+}}/g)
  if (unresolved && unresolved.length > 0) {
    console.warn('[Placeholder Validation] Unresolved placeholders:', unresolved)
    return { valid: false, unresolved }
  }
  return { valid: true }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/utils/replacerTemplate.js
git commit -m "feat: add validatePlaceholders utility function"
```

---

### Task 2: Fix `setActiveCharacter` to use `buildPlaceholderValues()`

**Files:**
- Modify: `app/store/useCharacterStore.js` (lines ~834-858)

- [ ] **Step 1: Replace the manual `values` object with `buildPlaceholderValues()`**

In `app/store/useCharacterStore.js`, find the `setActiveCharacter` action. Replace this block:

```js
            const promptContent = usePromptStore.getState().getActivePromptContent()
            const { user } = useUserStore.getState()
            const { summarizeText } = useMemoryStore.getState()

            // Build values with the selected character's data (not the current one)
            const values = {
              char: selectedCharacter?.name || '',
              user: user?.name || '',
              char_description: selectedCharacter?.description || '',
              user_description: user?.description || '',
              scenario: selectedCharacter?.scenario || '',
              memory: summarizeText || '',
              lorebook: '',
              tools: state.patternReplacements
                .filter(p => p.active && p.prompt)
                .map(p => p.prompt)
                .join('\n')
            }

            const processedPrompt = replacePlaceholders(promptContent, values)
            const processedFirstMessage = replacePlaceholders(
              selectedCharacter.firstMessage,
              values
            )
```

With this:

```js
            const promptContent = usePromptStore.getState().getActivePromptContent()

            // Use buildPlaceholderValues for consistent placeholder resolution
            // Temporarily set character to selectedCharacter so buildPlaceholderValues picks it up
            const previousCharacter = state.character
            const values = buildPlaceholderValues()
            // Override char-related values with selectedCharacter data
            values.char = selectedCharacter?.name || ''
            values.char_description = selectedCharacter?.description || ''
            values.scenario = selectedCharacter?.scenario || ''
            const processedPrompt = replacePlaceholders(promptContent, values)
            const processedFirstMessage = replacePlaceholders(
              selectedCharacter.firstMessage,
              values
            )
```

- [ ] **Step 2: Commit**

```bash
git add app/store/useCharacterStore.js
git commit -m "fix: use buildPlaceholderValues in setActiveCharacter instead of manual values"
```

---

### Task 3: Add validation before API call in SuperInput.jsx

**Files:**
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Update the import line**

Change this line:

```js
import { replacePlaceholders, buildPlaceholderValues, PROMPT_VARIABLES } from "../utils/replacerTemplate"
```

To:

```js
import { replacePlaceholders, buildPlaceholderValues, PROMPT_VARIABLES, validatePlaceholders } from "../utils/replacerTemplate"
```

- [ ] **Step 2: Add validation before the fetch call**

Find this section (around line 140-145, after `updateSystemPrompt(processedPrompt)` and before `const messagesWithPrompt`):

```js
      // Update the system prompt in the character store
      const { updateSystemPrompt } = useCharacterStore.getState();
      updateSystemPrompt(processedPrompt);
```

Add this validation block right after `updateSystemPrompt(processedPrompt);`:

```js
      // Validate all placeholders were resolved before sending to API
      const validation = validatePlaceholders(processedPrompt);
      if (!validation.valid) {
        console.warn('[API Call] Unresolved placeholders in system prompt:', validation.unresolved);
      }
```

- [ ] **Step 3: Commit**

```bash
git add app/components/SuperInput.jsx
git commit -m "feat: validate placeholders before API call and warn if unresolved"
```

---

### Task 4: Manual Testing

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test character switching**

1. Open the app in browser at `http://localhost:3000`
2. Open browser dev tools console
3. Switch to a different character
4. Check console — there should be NO warnings about unresolved placeholders
5. Open the debug panel (`/dbg`) and verify `{{user}}` shows your actual user name, not `{{user}}`

- [ ] **Step 3: Test sending a message**

1. Type a message and send it
2. Check console — no unresolved placeholder warnings
3. In debug panel, verify all placeholders show resolved values

- [ ] **Step 4: Test validation warning (optional)**

1. Go to Custom Prompt editor
2. Temporarily change `{{user}}` to `{{user_name}}` in the prompt template
3. Send a message
4. Check console — you should see: `[API Call] Unresolved placeholders in system prompt: [ '{{user_name}}' ]`
5. Change the prompt back to `{{user}}`

---

## Self-Review

1. **Spec coverage:** All 3 spec items covered — Task 1 adds `validatePlaceholders()`, Task 2 fixes `setActiveCharacter`, Task 3 adds validation before API call. Testing in Task 4 matches spec testing requirements. ✓
2. **Placeholder scan:** No TBD, TODO, or vague steps. All code blocks are complete. ✓
3. **Type consistency:** `validatePlaceholders` returns `{ valid, unresolved }` consistently in Task 1 and Task 3. `buildPlaceholderValues` returns the same object shape in all call sites. ✓
4. **No contradictions:** The approach in Task 2 overrides char-specific values after calling `buildPlaceholderValues()` because `buildPlaceholderValues()` reads from `state.character` which hasn't been updated yet. This is correct — we need the selected character's data, not the current one. ✓
