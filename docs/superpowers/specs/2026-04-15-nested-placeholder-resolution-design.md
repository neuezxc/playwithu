# Nested Placeholder Resolution Design

## Overview
When `{{char_description}}`, `{{user_description}}`, or `{{scenario}}` contain basic identity placeholders (`{{user}}` or `{{char}}`), they are currently not processed during the template build, leaving literals like `{{user}}` injected directly into the system prompt.

## Solution
Implement a pre-resolution step directly within `replacePlaceholders` inside `app/utils/replacerTemplate.js`. Before full replacement begins, the function will resolve `{{char}}` and `{{user}}` inside the static content of the three main descriptive fields.

## Implementation Details

1. **Target File:** `app/utils/replacerTemplate.js`
2. **Function:** `replacePlaceholders(template, values)`
3. **Logic:**
    - Extract `char` and `user` strings from the incoming `values` object.
    - Loop over the fields `['char_description', 'user_description', 'scenario']`.
    - If a field exists on `values`, run `.replaceAll()` for both `{{char}}` and `{{user}}` with their real string equivalents.
    - Execute the original loop that replaces `{{key}}` with `value` against the main template string using the newly cleaned values.

## Benefits
- **Zero Risk of Infinite Loops:** Specifically targets known, finite variables rather than arbitrary recursion.
- **Universal Application:** Modifying `replacePlaceholders` provides this logic implicitly to everywhere it is used, such as system prompts, first-messages, and when switching active characters.
