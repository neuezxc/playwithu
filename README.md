<p align="center">
  <h1 align="center">PlayWithU</h1>
  <p align="center">
    An open-source AI character roleplay chat app — your own <strong>Character.AI alternative</strong>, running entirely in the browser.
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#customization">Customization</a> •
    <a href="#contributing">Contributing</a>
  </p>
</p>

---

## ✨ What is PlayWithU?

PlayWithU is a **privacy-first, client-side AI roleplay chat app** that lets you create, customize, and chat with AI characters — all without a backend. Your data never leaves your browser.

Bring your own API key (via [OpenRouter](https://openrouter.ai)), pick any LLM, and start roleplaying. No sign-ups, no subscriptions, no data collection.

---

## 🎯 Features

### 💬 Immersive Chat Interface
- **Real-time AI conversations** with rich markdown rendering (bold, italics, code blocks)
- **Message editing** — edit any user message and regenerate the AI response from that point
- **Response regeneration** with candidate navigation — swipe through multiple AI responses for the same prompt
- **Message deletion** — remove individual messages from chat history
- **Slash commands** — `/reset` to start over, `/characters` to manage personas, `/dbg` for debug tools

### 🎭 Character Management
- **Create custom characters** with name, avatar, bio, description, scenario, and first message
- **Dedicated character gallery** at `/characters` with search, grid view, and active character indicator
- **Import / Export** — share characters as JSON files or back up your entire collection
- **Default character included** — start chatting immediately with the built-in persona

### 🧠 Memory & Summarization
- **AI-powered chat memory** — automatically summarizes your conversation into a structured memory block (NPCs, places, relationships, lore, timeline)
- **Auto-summarize** — triggers every 10 messages to keep context fresh without manual effort
- **Memory snapshots** — save, restore, and manage up to 10 memory versions
- **Custom memory prompt** — full control over how the AI structures its memory

### ✏️ Custom System Prompts
- **Dynamic placeholder system** — use `{{char}}`, `{{user}}`, `{{char_description}}`, `{{user_description}}`, `{{scenario}}`, `{{memory}}`, and `{{tools}}` in your prompts
- **Create & manage multiple prompts** — CRUD operations with the ability to switch between prompts on the fly
- **Live preview mode** — see how placeholders resolve before sending to the API
- **Token counting** — keep track of prompt size to stay within model limits

### 🔧 Pattern Replacements (Tools)
- **Inject reusable prompt snippets** into the `{{tools}}` placeholder
- **Toggle tools on/off** per conversation without deleting them
- **Great for** adding personality quirks, knowledge bases, or behavior rules dynamically

### ⚙️ API Configuration
- **OpenRouter integration** — access hundreds of LLMs through a single API key
- **Model selection** — use any model available on OpenRouter
- **Tunable parameters** — temperature, max tokens, top-p, frequency penalty, presence penalty
- **One-click parameter reset** to sensible defaults

### 🛠️ Developer Tools
- **Built-in debug modal** (`/dbg`) — inspect API request/response logs in real time
- **Full request tracing** — see exactly what's being sent to and received from the LLM

### 📱 Other Highlights
- **Dark theme** — sleek, modern UI built for extended sessions
- **Responsive design** — works on desktop and mobile
- **Persistent state** — all data saved to `localStorage` (survives page reloads)
- **Zero backend** — no server, no database, no cloud — everything runs client-side

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- An API key from [OpenRouter](https://openrouter.ai)

### Installation

```bash
# Clone the repository
git clone https://github.com/neuezxc/playwithu.git
cd playwithu

# Install dependencies
npm install

# Start the dev server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First-Time Setup

1. Click the **menu button** (⚙️) in the chat input area
2. Open **API Settings**
3. Paste your OpenRouter API key and set your preferred model ID
4. Start chatting!

---

## 🏗️ Architecture

PlayWithU is a **single-page Next.js 15 app** (App Router) with no server components doing data fetching — everything is client-side.

```
app/
├── page.js                    # Main chat page ("use client")
├── layout.js                  # Root layout with Geist font
├── globals.css                # Global styles + Tailwind v4
├── characters/
│   └── page.jsx               # Character gallery page
├── components/
│   ├── SuperInput.jsx         # Chat input with slash commands
│   ├── InputMenu.jsx          # Settings menu buttons
│   ├── chat/
│   │   ├── ChatList.jsx       # Message list with auto-scroll
│   │   ├── CharacterChat.jsx  # AI message bubble (with regen/navigate)
│   │   ├── UserChat.jsx       # User message bubble (with edit)
│   │   └── CharacterImagePopup.jsx  # Draggable character avatar
│   └── modal/
│       ├── ApiSettingsModal.jsx       # API key, model, parameters
│       ├── CharacterModal.jsx         # Create/edit characters
│       ├── CustomPromptModal.jsx      # System prompt editor
│       ├── MemoryModal.jsx            # Memory & summarization
│       ├── PatternReplacementModal.jsx # Tools / prompt snippets
│       └── DebugModal.jsx             # API request inspector
├── store/
│   ├── useCharacterStore.js   # Characters, messages, pattern replacements
│   ├── useApiSettingStore.js   # API key, model, generation params
│   ├── usePromptStore.js       # System prompts (default + custom)
│   ├── useMemoryStore.js       # Chat summarization & snapshots
│   ├── useChatStore.js         # Message count tracking
│   ├── useUserStore.js         # User name/description (non-persisted)
│   └── useDebugStore.js        # Debug logs
└── utils/
    ├── replacerTemplate.js    # {{placeholder}} replacement engine
    ├── textFormatter.js       # Markdown/formatting utilities
    ├── textUtils.js           # Text helper functions
    └── formatChatForSummarize.js  # Chat → summary formatter
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| UI | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| State | [Zustand 5](https://zustand-demo.pmnd.rs/) (persisted to localStorage) |
| Icons | [Lucide React](https://lucide.dev/) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + [rehype-raw](https://github.com/rehypejs/rehype-raw) |
| AI Provider | [OpenRouter API](https://openrouter.ai/) (client-side fetch) |
| Font | [Geist](https://vercel.com/font) + [Inter](https://fonts.google.com/specimen/Inter) |

### State Management

All stores use Zustand with `persist` middleware (saved to `localStorage`), except `useUserStore` which resets on reload.

| Store | Key | Purpose |
|-------|-----|---------|
| `useCharacterStore` | `character-storage` | Active character, character list, messages, pattern replacements |
| `useApiSettingStore` | `api-storage` | API key, model ID, temperature, max_tokens, etc. |
| `usePromptStore` | `prompt-storage` | Default + custom system prompts |
| `useMemoryStore` | `memory-storage` | Summarization text, snapshots, memory prompt |
| `useChatStore` | `chat-storage` | Message count for auto-summarize triggers |
| `useUserStore` | *(not persisted)* | User name & description |
| `useDebugStore` | *(not persisted)* | API request/response logs |

---

## 🎨 Customization

### Creating a Character

Characters are defined with:

| Field | Description |
|-------|-------------|
| **Name** | The character's display name |
| **Avatar URL** | Image URL for chat bubbles and gallery |
| **Bio** | Short tagline shown in the character card |
| **Description** | Detailed personality and appearance (supports `{{user}}` placeholders) |
| **Scenario** | World-building context injected into the system prompt |
| **First Message** | The opening message when a chat starts |

### Writing System Prompts

Use the **Custom Prompt** editor to write your own system prompts with dynamic placeholders:

```
You are roleplaying as {{char}}. The user is {{user}}.

{{char_description}}

Scenario: {{scenario}}

Memory: {{memory}}

Tools: {{tools}}
```

All placeholders are replaced with real values before the prompt is sent to the API.

### Pattern Replacements (Tools)

Add reusable prompt snippets that get injected into `{{tools}}`:

- Toggle them on/off per conversation
- Great for adding situational rules, knowledge, or personality modifiers
- Changes take effect immediately — the system prompt is refreshed on every toggle

---

## 🧪 Commands

| Command | Action |
|---------|--------|
| `/reset` | Clear chat history and memory, start fresh |
| `/characters` | Navigate to the character gallery |
| `/dbg` | Open the debug inspector modal |

---

## 📦 Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🤝 Contributing

Contributions are welcome! This is a JavaScript-only project (no TypeScript).

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Code Style

- No semicolons (unless needed for disambiguation)
- Single quotes for strings
- 2-space indentation
- `===` only, never `==`
- `handleXxx` naming for event handlers
- Named exports for components

---

## 📄 License

This project is open source. See the repository for license details.

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/neuezxc">neuezxc</a></sub>
</p>
