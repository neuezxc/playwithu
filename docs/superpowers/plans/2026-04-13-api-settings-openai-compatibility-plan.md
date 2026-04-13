# API Settings OpenAI Compatibility Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open the application to any OpenAI-compatible provider by allowing manual override of the API Base URL.

**Architecture:** Add `api_endpoint` to Zustand config store, update all `fetch` calls to `/chat/completions` to resolve dynamically via this stored endpoint, and update the UI modal to configure it and fetch dynamic model lists via `GET /models`.

**Tech Stack:** Next.js 15, Zustand, Tailwind CSS v4.

*Note: Since no test runner is configured for this project, verification relies on linting and manual checks where applicable rather than automated TDD unit tests.*

---

### Task 1: Update useApiSettingStore

**Files:**
- Modify: `app/store/useApiSettingStore.js`

- [ ] **Step 1: Write state modifications**

Modify the store to include the new endpoint and setter. Add `api_endpoint: "https://openrouter.ai/api/v1",` to the default state, `setApiEndpoint: (endpoint) => set({ api_endpoint: endpoint }),` to the functions, and reset it appropriately.

```javascript
import { create } from 'zustand'
import { persist } from 'zustand/middleware' 

const useApiSettingStore = create(
  persist(  
    (set) => ({
      api_endpoint: "https://openrouter.ai/api/v1",
      api_key: "",
      model_id: "openrouter/sonoma-dusk-alpha",
      modal: false,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,

      setApiEndpoint: (endpoint) => set({ api_endpoint: endpoint }),
      setApiKey: (key) => set({ api_key: key }),
      setModelId: (id) => set({ model_id: id }),
      setModal: (modal) => set({ modal: modal }),

      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (max_tokens) => set({ max_tokens }),
      setTopP: (top_p) => set({ top_p }),
      setFrequencyPenalty: (frequency_penalty) => set({ frequency_penalty }),
      setPresencePenalty: (presence_penalty) => set({ presence_penalty }),

      resetParameters: () => set({
        api_endpoint: "https://openrouter.ai/api/v1",
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
    }),
    {
      name: 'api-storage',
    }
  )
)

export default useApiSettingStore
```

- [ ] **Step 2: Run linter to ensure validity**

Run: `npm run lint`
Expected: Completion without errors.

- [ ] **Step 3: Commit**

```bash
git add app/store/useApiSettingStore.js
git commit -m "feat: add api_endpoint to useApiSettingStore"
```

---

### Task 2: Update Stores and Components fetch calls

**Files:**
- Modify: `app/store/useCharacterStore.js`
- Modify: `app/store/useMemoryStore.js`
- Modify: `app/components/SuperInput.jsx`

- [ ] **Step 1: Update `useCharacterStore.js`**

Modify `editUserMessageAndRegenerate` and `regenerateLastMessage` functions inside `app/store/useCharacterStore.js`.
Extract `api_endpoint` from the store, and dynamically use it for UI log components and the fetch request.

Replace all instances of `https://openrouter.ai/api/v1/chat/completions` with `${api_endpoint}/chat/completions` inside the functions. Ensure the extract statement brings it: `const { api_endpoint, api_key, model_id... } = useApiSettingStore.getState();` 

```javascript
/* Inside editUserMessageAndRegenerate */
const { api_endpoint, api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore.getState();

// In debug store addLog
addLog({
  type: "api",
  endpoint: `${api_endpoint}/chat/completions`,
  request: {
    model: model_id,
    messages: currentMessages,
  }
});

// In try fetch
const response = await fetch(
  `${api_endpoint}/chat/completions`,
  // ... rest identical ...
```
Do the same identical extraction and substitution for `regenerateLastMessage`.

- [ ] **Step 2: Update `useMemoryStore.js`**

Inside `generateSummary`, extract `api_endpoint` alongside `api_key`. Replace the fetch and endpoint string.

```javascript
const { api_endpoint, api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore.getState();

const response = await fetch(
  `${api_endpoint}/chat/completions`,
// ... rest identical ...
```

- [ ] **Step 3: Update `SuperInput.jsx`**

Inside `SuperInput.jsx` `handleMessage` function, extract `api_endpoint` and use interpolation.

```javascript
// Add extraction at the top of component
const { api_endpoint, api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore();

// Substitute inside handleMessage -> addLog and fetch
addLog({
  type: "api",
  endpoint: `${api_endpoint}/chat/completions`,
  request: {
    model: model_id,
    messages: messagesWithPrompt,
  }
});

const response = await fetch(
  `${api_endpoint}/chat/completions`,
// ...
```

- [ ] **Step 4: Lint check files**

Run: `npm run lint`
Expected: Passes formatting.

- [ ] **Step 5: Commit changes**

```bash
git add app/store/useCharacterStore.js app/store/useMemoryStore.js app/components/SuperInput.jsx
git commit -m "refactor: apply dynamic api endpoint interpolation for API calls"
```

---

### Task 3: ApiSettingsModal Architecture & UI Updates

**Files:**
- Modify: `app/components/modal/ApiSettingsModal.jsx`

- [ ] **Step 1: Modal State Setup & `handleTestConnection` rebuild**

Add `api_endpoint` extraction. Redesign the fetching logic to use the dynamic models endpoint. Since different generic endpoints might put models directly in `data` or under `data.data` array structure, support simple parsing.

```javascript
const {
  api_endpoint,
  api_key,
  model_id,
  temperature,
  max_tokens,
  top_p,
  frequency_penalty,
  presence_penalty
} = useApiSettingStore();

const setApiEndpoint = useApiSettingStore((state) => state.setApiEndpoint);
// ... [existing setters]

const [fetchedModels, setFetchedModels] = useState([]); // Empty by default
// Remove popularModels array!

const handleTestConnection = async () => {
  setIsTesting(true);
  setTestResult(null);
  try {
    const formatUrl = api_endpoint.endsWith('/') ? api_endpoint.slice(0, -1) : api_endpoint;
    const response = await fetch(`${formatUrl}/models`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${api_key}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      let modelsArray = [];
      if (Array.isArray(data.data)) {
        modelsArray = data.data;
      } else if (data.data && Array.isArray(data.data.data)) {
        modelsArray = data.data.data;
      } else if (Array.isArray(data)) {
        modelsArray = data;
      }

      const parsedModels = modelsArray.map(model => (typeof model === 'string' ? model : model.id)).filter(Boolean);

      setTestResult({ success: true, message: "Connection successful! Models refreshed." });
      setFetchedModels(parsedModels);
      setShowModelList(parsedModels.length > 0);
    } else {
      const errorData = await response.json().catch(() => ({}));
      setTestResult({ success: false, message: errorData.error?.message || "Connection failed" });
    }
  } catch (error) {
    setTestResult({ success: false, message: "Network error or CORS issue" });
  } finally {
    setIsTesting(false);
  }
};
```

- [ ] **Step 2: Update the React UI Elements**

Remove the Provider buttons. Add the Base URL input right above API Key. Iterate `fetchedModels` instead of `popularModels`.

Change this block inside the `{activeTab === "connection"}` check:
```jsx
{/* Base URL */}
<div className="space-y-2">
  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base URL</label>
  <div className="relative">
    <input
      type="text"
      value={api_endpoint}
      onChange={(e) => setApiEndpoint(e.target.value)}
      placeholder="e.g. https://openrouter.ai/api/v1"
      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all font-mono"
    />
  </div>
</div>

{/* API Key */}
<div className="space-y-2">
{/* ... keep API Key exactly as is ... */}
</div>

{/* Model Selection */}
<div className="space-y-2 relative z-10">
  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model ID</label>
  <div className="relative">
    <input
      type="text"
      value={model_id}
      onChange={(e) => setModelId(e.target.value)}
      onFocus={() => { if (fetchedModels.length > 0) setShowModelList(true); }}
      onBlur={() => setTimeout(() => setShowModelList(false), 200)}
      placeholder="e.g. anthropic/claude-3.5-sonnet"
      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all font-mono"
    />
    {showModelList && fetchedModels.length > 0 && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 py-1 scrollbar-thin scrollbar-thumb-white/10 text-ellipsis whitespace-nowrap">
        {fetchedModels.map((model) => (
          <button
            key={model}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
            onClick={() => {
              setModelId(model);
              setShowModelList(false);
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-green-500/50"></span>
            <span className="truncate">{model}</span>
          </button>
        ))}
      </div>
    )}
  </div>
  {fetchedModels.length === 0 && <p className="text-[10px] text-gray-500">Test Connection to fetch available models, or type manually.</p>}
</div>

{/* Test Connection */}
<div className="pt-2">
  <button
    onClick={handleTestConnection}
    disabled={isTesting || !api_endpoint}
    className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${!api_endpoint
        ? "bg-[#1a1a1a] text-gray-500 cursor-not-allowed"
        : "bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20"
      }`}
  >
{/* ... keep testResult as is ... */}
```

- [ ] **Step 3: Lint check**

Run: `npm run lint`
Expected: Zero compilation errors regarding missing dependencies or invalid HTML properties.

- [ ] **Step 4: Commit**

```bash
git add app/components/modal/ApiSettingsModal.jsx
git commit -m "feat: complete UI rebuild for generic OpenAI custom endpoint implementation"
```
