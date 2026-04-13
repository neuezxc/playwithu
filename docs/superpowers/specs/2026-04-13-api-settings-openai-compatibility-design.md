# API Settings OpenAI Compatibility Redesign

## Purpose
The application is currently hardcoded to only communicate with OpenRouter. The objective is to open the application up to any OpenAI-compatible provider (e.g., LM Studio, Ollama, local or custom setups) by allowing manual override of the API Base URL, while continuing to preserve the design fidelity of the existing configuration modal.

## Architecture & Store Updates
1. **Zustand Store Changes (`useApiSettingStore.js`)**
   - Add new property `api_endpoint` initialized to `"https://openrouter.ai/api/v1"`.
   - Add a corresponding setter `setApiEndpoint: (endpoint) => set({ api_endpoint: endpoint })`.

2. **Core File API Path Replacements**
   - Files to update: `useCharacterStore.js`, `useMemoryStore.js`, `SuperInput.jsx`.
   - Locate hardcoded API strings `"https://openrouter.ai/api/v1/chat/completions"`.
   - Retrieve `api_endpoint` from `useApiSettingStore.getState()`.
   - Substitute the hardcoded URL with `${api_endpoint}/chat/completions`.
   - Update the `addLog` endpoint paths in `useDebugStore.js` to accurately track the generated dynamic URL.

## UI/UX Redesign (`ApiSettingsModal.jsx`)
1. **Base URL Input**
   - Remove the superficial "Provider" visual block that has OpenRouter/Others mock buttons.
   - Insert a "Base URL" input field placed just above the API Key field.
   - Bind this field to `api_endpoint`.
   
2. **"Test Connection" Workflow & Model Fetching**
   - Modify the connection test to dispatch a `GET` request to `${api_endpoint}/models`.
   - Upon a successful response, parse the JSON payload (expecting the common OpenAI structure: `{ data: [ { id: "model-name" } ] }`).
   - Save the dynamically fetched model IDs into a local component state array `fetchedModels`.
   
3. **Model ID Field Modifications**
   - Retain the Model ID field as a standard editable text input to allow unhindered typing if fetching models is impossible or undesired.
   - When focused, if `fetchedModels` has entries (due to a successful Test Connection), display these entries as the dropdown suggestions instead of hardcoding popular formats.
   - If `fetchedModels` is empty, omit the dropdown, allowing the user pure structural typing.

## Error Handling & Stability Constraints
- The user will actively maintain the ability to close the modal and submit messages irrespective of whether "Test Connection" fails or passes.
- Exceptions raised during `fetch` on "Test Connection" (e.g. CORS block, bad URL) will render a clear inline error in the modal, omitting stack traces.
