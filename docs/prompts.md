Let's implement this open-source chat app like Character AI using Next.js(no typescript), Tailwind CSS, Zustand, Lucide Icons, and localStorage (no database), focusing on a chat interface that integrates with Openrouter, allowing users to input their own API key, manage characters, and customize system prompts with dynamic placeholders (e.g., {{char}}, {{user}}) that get replaced with actual values before API requests.  The foundation is already built, the design so you only focus on is functionality. 

What's in there?
ChatInput(big text area)
- send button
- API-SETTINGS Button
- Custom Prompt Button
- Character Button
Chatlist.


Let's break it down.
## Api Settings
user click api settings btn
modal appear
2 tabs in there -> connection & parameters
in connection
- selection llm provider (eg, openrouter, google gemini. but we focus on openrouter for now.)
- api key input
- modelid input
in parameters
- temperature
- max tokens
- context size
- advance settings
    - repetition penalty
    - top-p 0.8

## Custom Prompt Button
user click api custom prompt btn
modal appear
2 tabs in there -> my prompts & create new
*my prompts tab*
- default card prompt & cards prompts(user prompt)
    - What inside that card prompt?
    - activate if card is activated, edit, delete (CRUD)
- Create Button
    - user click that go to the create new tab.

*create new tab*
we have 2 inputs there and placeholder selection
- prompt name
- prompt content (This user write their own, system prompt)
    - token count
    - toggle preview/edit mode
        - preview, replacing placeholder example: {{user}} to mac
        - edit mode, user continue writing their own prompt.
- Insert placeholders, our reusable placeholder like {{user}}, {{char}}, {{user_description}} {{char_description}}.
    - What is this?
        Instead user type the real data, user just insert that placeholder that automatically replace the real data in the backend.
- Save Button

## Character Button
- This crud.
user click character button -> modal show
*first section*
- Create Character Button
- Import
*Cards section*
- we have one default character there.
- Show all cards character
*In character card*
- image, character name, character bio
- user can edit, delete that character