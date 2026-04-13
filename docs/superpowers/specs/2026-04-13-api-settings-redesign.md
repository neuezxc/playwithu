# API Settings Modal Redesign

## Problem

The current API Settings modal has two categories of issues:

**Design (out of sync with app):**
- Uses `#121212` background while app uses `#151615`
- Uses `rounded-2xl`, `shadow-2xl`, animations (`animate-in`, `fade-in`, `zoom-in-95`, `slide-in-from-left-4`) that the rest of the app doesn't use
- Uses green accent (`#green-500/10`) in ways that don't match the app's `#3A9E49` palette
- Input styling (`rounded-xl`, `border-white/10`) is inconsistent with other inputs in the app (`rounded-lg`, `border-[#454545]`)

**Functionality (broken):**
- `api_endpoint` and `setApiEndpoint` are referenced in the modal but not defined in the store — silent undefined behavior
- Test Connection is fragile: URL normalization manually strips path segments, then hits `/models` endpoint which some OpenAI-compatible providers don't support (LM Studio, local proxies). When it fails, the user gets no models and no clear guidance.
- Model dropdown appears only after Test Connection succeeds, but the user might need to type a model ID manually (it works but isn't obvious)

## Goal

Rebuild the API Settings modal to match the app's visual style, fix the missing store fields, and make the connection test resilient to providers that don't support `/models`.

## Store Changes (`useApiSettingStore.js`)

Add `api_endpoint` field and `setApiEndpoint` setter:

```js
api_endpoint: "",
setApiEndpoint: (url) => set({ api_endpoint: url }),
```

The field should be persisted to localStorage (it's inside the `persist` wrapper already).

## Modal Redesign (`ApiSettingsModal.jsx`)

### Visual Style

Match the app's exact palette and border style:
- Background: `#151615`
- Header/footer border: `border-[#3b3b3b]`
- Input background: `#212121/80`
- Input border: `border-[#282828]`
- Input focus: `border-[#3A9E49]`
- Button style: `bg-[#3A9E49]/30 border border-[#3A9E49]`
- Remove all animations (`animate-in`, `fade-in`, `zoom-in-95`, `slide-in-*`)
- Use `rounded-lg` (not `rounded-xl` or `rounded-2xl`)
- Use `font-sans` (already used)
- Text colors: `text-[#f2f2f2]` for primary, `text-[#8e8e8e]` for secondary, `text-[#656565]` for tertiary

### Structure (Same 2 Tabs)

**Connection tab:**
- Base URL input (free text)
- API Key input (with show/hide toggle)
- Model ID input (free text, always usable)
- Test Connection button — tries `/models` endpoint
  - On success: shows model list dropdown, green confirmation
  - On soft fail (e.g., 404 or network error): shows gentle message ("couldn't fetch models, but your connection may still work"), model input still usable
  - On hard fail (network error + CORS): shows warning but doesn't block

**Parameters tab:**
- Temperature slider (0-2)
- Max Tokens number input
- Top P slider (0-1)
- Frequency Penalty slider (-2 to 2)
- Presence Penalty slider (-2 to 2)
- Reset Defaults button

### Connection Test Logic

```js
const handleTestConnection = async () => {
  setIsTesting(true)
  setTestResult(null)
  try {
    let formatUrl = api_endpoint
    if (formatUrl.endsWith('/')) formatUrl = formatUrl.slice(0, -1)
    if (formatUrl.endsWith('/chat/completions')) {
      formatUrl = formatUrl.slice(0, -'/chat/completions'.length)
    }

    const response = await fetch(`${formatUrl}/models`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(api_key ? { "Authorization": `Bearer ${api_key}` } : {}),
      },
    })

    if (response.ok) {
      const data = await response.json()
      // Parse models from various response formats
      let modelsArray = []
      if (Array.isArray(data.data)) {
        modelsArray = data.data
      } else if (data.data && Array.isArray(data.data.data)) {
        modelsArray = data.data.data
      } else if (Array.isArray(data)) {
        modelsArray = data
      }

      const parsedModels = modelsArray
        .map(model => typeof model === 'string' ? model : model.id)
        .filter(Boolean)

      setTestResult({ success: true, message: `Connected — ${parsedModels.length} models found.` })
      setFetchedModels(parsedModels)
      setShowModelList(parsedModels.length > 0)
    } else {
      // Soft fail: endpoint exists but /models not supported
      setTestResult({ success: true, message: "Endpoint responded, but model list unavailable. You can type the model ID manually." })
      setFetchedModels([])
      setShowModelList(false)
    }
  } catch (error) {
    // Network error or CORS — soft fail
    setTestResult({ success: true, message: "Couldn't verify connection automatically. You can still use this if the endpoint is correct." })
    setFetchedModels([])
    setShowModelList(false)
  } finally {
    setIsTesting(false)
  }
}
```

Key change: the "failure" case no longer shows `success: false` (red). It shows `success: true` with a gentle message, because the `/models` endpoint is optional for OpenAI-compatible APIs. Only truly unreachable endpoints (like empty base URL) would be hard errors.

### Model Dropdown

Works the same: appears below the Model ID input after Test Connection succeeds. Click a model to fill the input. The input is always directly editable — the dropdown is a helper, not a requirement.

## What Stays the Same

- 2-tab structure (Connection / Parameters)
- All parameter sliders and inputs
- Reset Defaults button
- Show/hide API key toggle
- OpenAI-compatible base URL support
- Proxy support (any `/v1/chat/completions` compatible endpoint)

## What Changes

- `useApiSettingStore.js`: add `api_endpoint` + `setApiEndpoint`
- `ApiSettingsModal.jsx`: complete rewrite — same functionality, corrected style, resilient connection test

## Success Criteria

- `api_endpoint` is properly stored and persisted
- Modal looks visually consistent with the rest of the app (same colors, borders, spacing, fonts)
- Test Connection works: shows models when available, gives helpful message when not
- User can always type a model ID manually, regardless of test result
- No animations or visual mismatches
