# Placeholder Replacement Fix — Design Spec

**Date:** 2026-04-15
**Status:** Draft

## Problem

When switching characters via `setActiveCharacter`, the placeholder values are built manually instead of using the shared `buildPlaceholderValues()` function. This causes `{{user}}` and other placeholders to potentially receive wrong or empty values, resulting in the API receiving literal `{{user}}` strings instead of real names.

## Solution

### 1. Fix `setActiveCharacter` (useCharacterStore.js)

Replace the manual `values` object with a call to `buildPlaceholderValues()`:

**Before:**
```js
const values = {
  char: selectedCharacter?.name || '',
  user: user?.name || '',
  char_description: selectedCharacter?.description || '',
  user_description: user?.description || '',
  scenario: selectedCharacter?.scenario || '',
  memory: summarizeText || '',
  lorebook: '',  // <-- hardcoded empty!
  tools: state.patternReplacements...
}
```

**After:**
```js
const values = buildPlaceholderValues()
```

This ensures all placeholder replacement paths go through the same function.

### 2. Add `validatePlaceholders()` (replacerTemplate.js)

A new function that checks if a resolved template still contains unresolved `{{...}}` patterns:

```js
export function validatePlaceholders(resolvedText) {
  const unresolved = resolvedText.match(/{{\w+}}/g)
  if (unresolved && unresolved.length > 0) {
    console.warn('[Placeholder Validation] Unresolved placeholders:', unresolved)
    return { valid: false, unresolved }
  }
  return { valid: true }
}
```

### 3. Call validation before API send (SuperInput.jsx)

Before the fetch call, run the validation and log a warning if placeholders are unresolved:

```js
const { validatePlaceholders } = require('../utils/replacerTemplate')
const validation = validatePlaceholders(processedPrompt)
if (!validation.valid) {
  console.warn('Unresolved placeholders before API call:', validation.unresolved)
}
```

## Files Changed

| File | Change |
|------|--------|
| `app/utils/replacerTemplate.js` | Add `validatePlaceholders()` function |
| `app/store/useCharacterStore.js` | Replace manual `values` object in `setActiveCharacter` with `buildPlaceholderValues()` |
| `app/components/SuperInput.jsx` | Add `validatePlaceholders()` call before API fetch |

## Testing

1. Switch characters and verify `{{user}}` resolves to the real user name
2. Send a message and check debug panel — all placeholders should show resolved values
3. Intentionally break a placeholder (rename `{{user}}` to `{{user_name}}` in the prompt) and verify a warning appears in console
