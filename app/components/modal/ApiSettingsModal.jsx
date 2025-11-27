'use client'
import React, { useState } from "react";
import { X, Eye, EyeOff, RefreshCw, Play, Info, CheckCircle, AlertCircle, Server, Sliders, ChevronDown } from "lucide-react";
import useApiSettingStore from "@/app/store/useApiSettingStore";

export default function ApiSettingsModal() {
  const {
    api_key,
    model_id,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty
  } = useApiSettingStore();

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
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [showModelList, setShowModelList] = useState(false);

  const popularModels = [
    "openrouter/auto",
    "anthropic/claude-3.5-sonnet",
    "google/gemini-pro-1.5",
    "meta-llama/llama-3-70b-instruct",
    "mistralai/mixtral-8x7b-instruct",
    "openai/gpt-4o"
  ];

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${api_key}`,
        }
      });

      if (response.ok) {
        setTestResult({ success: true, message: "Connection successful!" });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full h-full md:h-auto md:max-h-[85vh] max-w-2xl rounded-2xl shadow-2xl flex flex-col font-sans border border-white/10 bg-[#121212] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#181818]">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <Server size={18} className="text-green-400" />
            </div>
            API Settings
          </h2>
          <button
            onClick={() => setModal(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-0 border-b border-white/5 bg-[#121212]">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("connection")}
              className={`pb-3 text-sm font-medium transition-all relative ${activeTab === "connection" ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                }`}
            >
              Connection
              {activeTab === "connection" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("parameters")}
              className={`pb-3 text-sm font-medium transition-all relative ${activeTab === "parameters" ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                }`}
            >
              Parameters
              {activeTab === "parameters" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          {activeTab === "connection" && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">

              {/* Provider Selection (Visual only for now as mostly OpenRouter focused) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</label>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 px-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 font-medium text-sm flex items-center justify-center gap-2 transition-all">
                    OpenRouter
                  </button>
                  <button className="flex-1 py-3 px-4 bg-[#1a1a1a] border border-white/5 rounded-xl text-gray-500 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-50">
                    Others (Soon)
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">API Key</label>
                <div className="relative group">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={api_key}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all font-mono"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white transition-colors rounded-md"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Your key is stored locally in your browser.
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-2 relative z-10">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={model_id}
                    onChange={(e) => setModelId(e.target.value)}
                    onFocus={() => setShowModelList(true)}
                    onBlur={() => setTimeout(() => setShowModelList(false), 200)}
                    placeholder="e.g. anthropic/claude-3.5-sonnet"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all font-mono"
                  />
                  {showModelList && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 py-1">
                      {popularModels.map((model) => (
                        <button
                          key={model}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                          onClick={() => {
                            setModelId(model);
                            setShowModelList(false);
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                          {model}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Test Connection */}
              <div className="pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !api_key}
                  className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${!api_key
                      ? "bg-[#1a1a1a] text-gray-500 cursor-not-allowed"
                      : "bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20"
                    }`}
                >
                  {isTesting ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                  {isTesting ? "Verifying..." : "Test Connection"}
                </button>

                {testResult && (
                  <div className={`mt-4 p-3 rounded-xl border flex items-start gap-3 text-sm ${testResult.success
                      ? "bg-green-500/10 border-green-500/20 text-green-300"
                      : "bg-red-500/10 border-red-500/20 text-red-300"
                    }`}>
                    {testResult.success ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                    <p>{testResult.message}</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === "parameters" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Sliders size={16} className="text-green-400" />
                  Model Parameters
                </h3>
                <button
                  onClick={resetParameters}
                  className="text-xs text-gray-500 hover:text-green-400 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5"
                >
                  <RefreshCw size={12} /> Reset Defaults
                </button>
              </div>

              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    Temperature
                    <div className="group relative">
                      <Info size={12} className="text-gray-600 hover:text-gray-300 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#222] border border-white/10 rounded-lg text-[10px] text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Controls randomness: Lower is deterministic, higher is creative.
                      </div>
                    </div>
                  </label>
                  <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
                <div className="flex justify-between text-[10px] text-gray-600 font-medium">
                  <span>Precise (0.0)</span>
                  <span>Creative (2.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Tokens</label>
                <input
                  type="number"
                  value={max_tokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all font-mono"
                />
                <p className="text-[10px] text-gray-600">0 means unlimited (model default)</p>
              </div>

              {/* Top P */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top P</label>
                  <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{top_p}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={top_p}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
              </div>

              {/* Frequency Penalty */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Frequency Penalty</label>
                  <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{frequency_penalty}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={frequency_penalty}
                  onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
              </div>

              {/* Presence Penalty */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Presence Penalty</label>
                  <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{presence_penalty}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={presence_penalty}
                  onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
