# API Settings Modal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the API Settings modal to match the app's visual style and make the connection test resilient to providers that don't support `/models`.

**Architecture:** Single-file rewrite of `ApiSettingsModal.jsx` — same functionality, corrected style matching the app's palette (`#151615`, `#212121`, `#3A9E49`, `#3b3b3b`), and soft-fail connection testing.

**Tech Stack:** React, Zustand, Tailwind CSS, Lucide Icons

---

### Task 1: Rewrite `ApiSettingsModal.jsx` with corrected style and resilient connection test

**Files:**
- Modify: `c:\Users\jimue\Desktop\Vibe Coding\playwithu\app\components\modal\ApiSettingsModal.jsx`

- [ ] **Step 1: Replace the entire file with the redesigned modal**

Replace the entire file content with:

```jsx
'use client'
import { useState } from "react";
import { X, Eye, EyeOff, RefreshCw, Play, Info, Server, Sliders } from "lucide-react";
import useApiSettingStore from "@/app/store/useApiSettingStore";

export default function ApiSettingsModal() {
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
  const setModal = useApiSettingStore((state) => state.setModal);
  const setApiKey = useApiSettingStore((state) => state.setApiKey);
  const setModelId = useApiSettingStore((state) => state.setModelId);
  const setTemperature = useApiSettingStore((state) => state.setTemperature);
  const setMaxTokens = useApiSettingStore((state) => state.setMaxTokens);
  const setTopP = useApiSettingStore((state) => state.setTopP);
  const setFrequencyPenalty = useApiSettingStore((state) => state.setFrequencyPenalty);
  const setPresencePenalty = useApiSettingStore((state) => state.setPresencePenalty);
  const resetParameters = useApiSettingStore((state) => state.resetParameters);

  const [activeTab, setActiveTab] = useState("connection");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showModelList, setShowModelList] = useState(false);
  const [fetchedModels, setFetchedModels] = useState([]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      let formatUrl = api_endpoint.endsWith('/') ? api_endpoint.slice(0, -1) : api_endpoint;
      if (formatUrl.endsWith('/chat/completions')) {
        formatUrl = formatUrl.slice(0, -'/chat/completions'.length);
      }

      const headers = {
        "Accept": "application/json",
        "X-Title": "PlayWithU",
        "HTTP-Referer": window.location.origin,
      };

      if (api_key) {
        const cleanKey = api_key.startsWith('Bearer ') ? api_key.substring(7) : api_key;
        headers["Authorization"] = `Bearer ${cleanKey}`;
      }

      const response = await fetch(`${formatUrl}/models`, {
        method: "GET",
        headers,
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

        const parsedModels = modelsArray
          .map(model => (typeof model === 'string' ? model : model.id))
          .filter(Boolean);

        setTestResult({
          success: true,
          message: `Connected — ${parsedModels.length} models found.`,
        });
        setFetchedModels(parsedModels);
        setShowModelList(parsedModels.length > 0);
      } else {
        // Soft fail: endpoint responded but /models not supported
        setTestResult({
          success: true,
          message: "Endpoint responded, but model list unavailable. Type the model ID manually.",
        });
        setFetchedModels([]);
        setShowModelList(false);
      }
    } catch (error) {
      // Network error or CORS — soft fail
      setTestResult({
        success: true,
        message: "Couldn't verify connection automatically. You can still use this if the endpoint is correct.",
      });
      setFetchedModels([]);
      setShowModelList(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full h-full max-w-2xl rounded-xl shadow-lg flex flex-col font-sans max-h-[90vh] my-2 mx-1 sm:mx-2 border border-white/20 bg-[#151615]">

        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#3b3b3b]">
          <div>
            <h2 className="text-xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
              <Server size={18} className="text-[#3A9E49]" />
              API Settings
            </h2>
            <p className="text-xs text-[#8e8e8e] mt-1">Connection & parameters</p>
          </div>
          <button
            onClick={() => setModal(false)}
            className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </header>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-[#3b3b3b] flex flex-wrap gap-2 items-center">
          <button
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              activeTab === "connection"
                ? "bg-[#3A9E49]/15 text-[#e4ffe8] border border-[#3A9E49]"
                : "text-[#d9d9d9] hover:text-white hover:bg-[#333]/50"
            }`}
            onClick={() => setActiveTab("connection")}
          >
            Connection
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              activeTab === "parameters"
                ? "bg-[#3A9E49]/15 text-[#e4ffe8] border border-[#3A9E49]"
                : "text-[#d9d9d9] hover:text-white hover:bg-[#333]/50"
            }`}
            onClick={() => setActiveTab("parameters")}
          >
            Parameters
          </button>
        </div>

        {/* Content */}
        <main className="p-4 overflow-y-auto flex-1">

          {/* Connection Tab */}
          {activeTab === "connection" && (
            <div className="space-y-4">

              {/* Base URL */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#8e8e8e]">Base URL</label>
                <input
                  type="text"
                  value={api_endpoint || ""}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="e.g. https://openrouter.ai/api/v1"
                  className="w-full bg-[#212121]/80 border border-[#282828] rounded-lg px-3 py-2.5 text-sm text-[#f2f2f2] placeholder:text-[#656565] focus:border-[#3A9E49] outline-none transition-colors font-mono"
                />
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#8e8e8e]">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={api_key}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full bg-[#212121]/80 border border-[#282828] rounded-lg px-3 py-2.5 pr-10 text-sm text-[#f2f2f2] placeholder:text-[#656565] focus:border-[#3A9E49] outline-none transition-colors font-mono"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8e8e8e] hover:text-[#f2f2f2] transition-colors"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-xs text-[#656565]">Stored locally in your browser.</p>
              </div>

              {/* Model ID */}
              <div className="space-y-2 relative">
                <label className="text-xs font-medium text-[#8e8e8e]">Model ID</label>
                <input
                  type="text"
                  value={model_id || ""}
                  onChange={(e) => setModelId(e.target.value)}
                  onFocus={() => { if (fetchedModels.length > 0) setShowModelList(true); }}
                  onBlur={() => setTimeout(() => setShowModelList(false), 200)}
                  placeholder="e.g. anthropic/claude-3.5-sonnet"
                  className="w-full bg-[#212121]/80 border border-[#282828] rounded-lg px-3 py-2.5 text-sm text-[#f2f2f2] placeholder:text-[#656565] focus:border-[#3A9E49] outline-none transition-colors font-mono"
                />
                {showModelList && fetchedModels.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#212121] border border-[#282828] rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 py-1">
                    {fetchedModels.map((model) => (
                      <button
                        key={model}
                        className="w-full text-left px-3 py-2 text-sm text-[#d9d9d9] hover:bg-[#333]/50 hover:text-white transition-colors"
                        onClick={() => {
                          setModelId(model);
                          setShowModelList(false);
                        }}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Test Connection */}
              <div>
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !api_endpoint}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    !api_endpoint
                      ? "bg-[#454545]/30 text-[#656565] cursor-not-allowed"
                      : "bg-[#3A9E49]/30 border border-[#3A9E49] text-[#f2f2f2] hover:bg-[#3A9E49]/50"
                  }`}
                >
                  {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  {isTesting ? "Testing..." : "Test Connection"}
                </button>

                {testResult && (
                  <div className={`mt-3 p-2.5 rounded-lg border text-xs ${
                    testResult.success
                      ? "bg-[#3A9E49]/10 border-[#3A9E49]/20 text-[#d4edda]"
                      : "bg-red-500/10 border-red-500/20 text-red-300"
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Parameters Tab */}
          {activeTab === "parameters" && (
            <div className="space-y-6">

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#f2f2f2] flex items-center gap-2">
                  <Sliders size={16} className="text-[#3A9E49]" />
                  Model Parameters
                </h3>
                <button
                  onClick={resetParameters}
                  className="text-xs text-[#8e8e8e] hover:text-[#3A9E49] transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[#333]/50"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-[#8e8e8e] flex items-center gap-2">
                    Temperature
                    <div className="group relative">
                      <Info size={12} className="text-[#656565] hover:text-[#8e8e8e] cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#212121] border border-[#282828] rounded-lg text-[10px] text-[#d9d9d9] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Controls randomness: lower is deterministic, higher is creative.
                      </div>
                    </div>
                  </label>
                  <span className="text-xs font-mono text-[#3A9E49] bg-[#3A9E49]/10 px-2 py-0.5 rounded">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3A9E49] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
                <div className="flex justify-between text-[10px] text-[#656565]">
                  <span>Precise (0.0)</span>
                  <span>Creative (2.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#8e8e8e]">Max Tokens</label>
                <input
                  type="number"
                  value={max_tokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#212121]/80 border border-[#282828] rounded-lg px-3 py-2.5 text-sm text-[#f2f2f2] placeholder:text-[#656565] focus:border-[#3A9E49] outline-none transition-colors font-mono"
                />
                <p className="text-[10px] text-[#656565]">0 means unlimited (model default)</p>
              </div>

              {/* Top P */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-[#8e8e8e]">Top P</label>
                  <span className="text-xs font-mono text-[#3A9E49] bg-[#3A9E49]/10 px-2 py-0.5 rounded">{top_p}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={top_p}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3A9E49] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
              </div>

              {/* Frequency Penalty */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-[#8e8e8e]">Frequency Penalty</label>
                  <span className="text-xs font-mono text-[#3A9E49] bg-[#3A9E49]/10 px-2 py-0.5 rounded">{frequency_penalty}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={frequency_penalty}
                  onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3A9E49] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
              </div>

              {/* Presence Penalty */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-[#8e8e8e]">Presence Penalty</label>
                  <span className="text-xs font-mono text-[#3A9E49] bg-[#3A9E49]/10 px-2 py-0.5 rounded">{presence_penalty}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={presence_penalty}
                  onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3A9E49] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
              </div>

            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex justify-end p-4 border-t border-[#3b3b3b]">
          <button
            onClick={() => setModal(false)}
            className="px-4 py-2 bg-[#454545]/30 border border-[#454545] rounded-lg text-[#f2f2f2] text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the modal renders**

```bash
npm run dev
```

Open the app, click the menu button → API Settings. Verify:
1. Modal opens with correct dark styling (`#151615` background)
2. Connection tab shows: Base URL, API Key, Model ID, Test Connection button
3. Parameters tab shows: Temperature slider, Max Tokens, Top P, Frequency/Presence Penalty, Reset button
4. Tab switching works
5. Test Connection shows a soft-fail message when endpoint doesn't support `/models`
6. All inputs are styled consistently with the app (`rounded-lg`, `border-[#282828]`, `focus:border-[#3A9E49]`)

- [ ] **Step 3: Commit**

```bash
git add app/components/modal/ApiSettingsModal.jsx
git commit -m "feat(api-settings): redesign modal to match app style with resilient connection test"
```

---

## Spec Self-Review

**1. Spec coverage:**
- ✅ Match app's visual style (`#151615`, `#212121`, `#3A9E49`, `#3b3b3b`) → Task 1
- ✅ `rounded-lg` borders, no animations → Task 1
- ✅ Soft-fail connection test → Task 1 (`handleTestConnection` shows `success: true` on 404/error)
- ✅ Model input always usable → Task 1 (free-text input always present)
- ✅ 2-tab structure preserved → Task 1
- ✅ All parameter sliders preserved → Task 1
- ✅ Store already has `api_endpoint` → No store changes needed
- ✅ Remove `animate-in`, `fade-in`, `zoom-in-95`, `slide-in-*` → Task 1
- ✅ Filter bar style matches other modals (DebugModal pattern) → Task 1 (uses same tab pill style)

**2. Placeholder scan:** No TBDs, TODOs. All code is complete.

**3. Type consistency:** All store selectors match existing store (`api_endpoint`, `api_key`, `model_id`, etc.). All setters match (`setApiEndpoint`, `setApiKey`, etc.).

**4. Ambiguity check:** All color values exact. All component structure clear.

Plan is clean and complete.
