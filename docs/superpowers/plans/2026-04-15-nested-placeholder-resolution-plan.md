# Nested Placeholder Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the core template replacer to pre-resolve `{{char}}` and `{{user}}` inside descriptive string fields, so nested placeholders format fully before system prompt injection.

**Architecture:** We will intercept the `values` argument right inside `replacePlaceholders`, extract the base `char` and `user` names, and run a safe `.replaceAll` against `char_description`, `user_description`, and `scenario` fields before continuing with the standard iteration.

**Tech Stack:** JavaScript, Next.js 15

---

### Task 1: Update `replacePlaceholders` logic

**Files:**
- Modify: `app/utils/replacerTemplate.js`

- [ ] **Step 1: Add pre-resolution logic to `replacePlaceholders`**

Locate the `replacePlaceholders` function. Currently it looks like:
```javascript
export function replacePlaceholders(template, values) {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value || '')
  }
  return result
}
```

Update it to exactly this:
```javascript
export function replacePlaceholders(template, values) {
  // Pre-resolve identity placeholders inside descriptions
  const baseValues = { char: values.char || '', user: values.user || '' }
  const nestedFields = ['char_description', 'user_description', 'scenario']
  
  nestedFields.forEach(field => {
    if (values[field]) {
      values[field] = values[field]
        .replaceAll('{{char}}', baseValues.char)
        .replaceAll('{{user}}', baseValues.user)
    }
  })

  // Normal replacement sequence
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value || '')
  }
  return result
}
```

- [ ] **Step 2: Run linter to verify syntax**

Run: `npm run lint`
Expected: Passes without new errors for `app/utils/replacerTemplate.js`

- [ ] **Step 3: Commit**

```bash
git add app/utils/replacerTemplate.js
git commit -m "fix: pre-resolve user and char placeholders inside description properties"
```

---

### Task 2: Manual Testing

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Add nested variable via UI**

1. Go to characters UI.
2. Edit active character's description to include: "Best friend of {{user}}".
3. Save the character settings.

- [ ] **Step 3: Verify the prompt generation**

1. Go to Debug (`/dbg`).
2. Check the "Placeholder Status" and the System Prompt injection logs.
3. Verify that the system prompt outputs "Best friend of [YourUserName]" instead of "Best friend of {{user}}".

---

## Self-Review

1. **Spec coverage:** The single targeted fix in Task 1 exactly executes the solution required by the spec. Testing is provided in Task 2.
2. **Placeholder scan:** Exact code blocks, no TBDs, no vague instructions.
3. **Type consistency:** Function matches the signature mapped across the codebase. Base values correctly default to empty strings if missing.
