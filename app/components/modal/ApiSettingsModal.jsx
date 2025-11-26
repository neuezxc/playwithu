'use client'
import React, { useState } from "react";
import { X, Eye, EyeOff, RefreshCw, Play, Info } from "lucide-react";
import useApiSettingStore from "@/app/store/useApiSettingStore";


// To control the visibility of this modal, you can manage its state
// in a parent component and pass down `isOpen` and `onClose` props.
// For demonstration, it is rendered directly here.

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
      // Simple fetch to OpenRouter models endpoint to verify key
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
    // Modal Overlay: Centers the modal and provides a backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-opacity-50 p-4">
      {/* Modal Content */}
      <div className="w-full  h-full lg:h-auto max-w-2xl rounded-xl shadow-lg flex flex-col font-sans border border-white/20 bg-white/2">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 py-4 border-b border-[#3b3b3b]">
          <h2 className="text-xl font-bold text-[#f2f2f2] tracking-[-0.4px] flex flex-row gap-1 items-center">
            API settings
          </h2>
          <button
            onClick={() => setModal(false)}
            className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} className="text-[#9F9F9F]" />
          </button>
        </header>

        {/* Tabs */}
        <div className="px-7 border-b border-[#3b3b3b]">
          <nav className="flex items-center gap-10 -mb-px ">
            <button
              className={`py-2 text-md ${activeTab === "connection" ? "text-[#5fdb72] border-b-2 border-[#5fdb72]" : "text-[#d9d9d9] border-b-2 border-transparent hover:text-white transition-colors"}`}
              onClick={() => setActiveTab("connection")}
            >
              Connection
            </button>
            <button
              className={`py-2 text-md ${activeTab === "parameters" ? "text-[#5fdb72] border-b-2 border-[#5fdb72]" : "text-[#d9d9d9] border-b-2 border-transparent hover:text-white transition-colors"}`}
              onClick={() => setActiveTab("parameters")}
            >
              Parameters
            </button>
          </nav>
        </div>

        {/* Modal Body */}
        <main className="p-7 flex flex-col gap-8">
          {/* Connection Tab Content */}
          {activeTab === "connection" && (
            <>
              {/* LLM Selection Button */}
              <div>
                <button className="px-6 py-2.5 bg-[#5fdb72]/15 border border-[#5fdb72] rounded-lg text-[#e4ffe8] font-medium text-base hover:bg-[#5fdb72]/25 transition-colors">
                  Openrouter
                </button>
              </div>

              {/* API Key Input */}
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="apiKey"
                  className="text-md font text-[#f2f2f2]"
                >
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    className="w-full h-12 px-6 pr-12 bg-[#161616] border border-white/10 rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
                    placeholder="Enter your API key"
                    onChange={(e) => setApiKey(e.target.value)}
                    value={api_key}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f2f2f2]/60 hover:text-white transition-colors"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Test Connection Button & Result */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || !api_key}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!api_key
                    ? "bg-[#2a2a2a] text-[#555] cursor-not-allowed"
                    : "bg-[#5fdb72]/10 text-[#5fdb72] border border-[#5fdb72]/50 hover:bg-[#5fdb72]/20"
                    }`}
                >
                  {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                  {isTesting ? "Testing..." : "Test Connection"}
                </button>

                {testResult && (
                  <span className={`text-sm ${testResult.success ? "text-green-400" : "text-red-400"}`}>
                    {testResult.message}
                  </span>
                )}
              </div>

              {/* Model ID Input with Custom Dropdown */}
              <div className="flex flex-col gap-3 relative z-20">
                <label
                  htmlFor="modelId"
                  className="text-md text-[#f2f2f2]"
                >
                  Model
                </label>
                <div className="relative group">
                  <input
                    id="modelId"
                    type="text"
                    className="w-full h-12 px-6 bg-[#161616] border border-white/10 rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
                    placeholder="Enter model ID or select from list"
                    value={model_id}
                    onChange={(e) => setModelId(e.target.value)}
                    onFocus={() => setShowModelList(true)}
                    onBlur={() => setTimeout(() => setShowModelList(false), 200)} // Delay to allow click
                    autoComplete="off"
                  />

                  {/* Custom Dropdown List */}
                  {showModelList && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                      {popularModels.map((model) => (
                        <button
                          key={model}
                          className="w-full text-left px-4 py-3 text-sm text-[#f2f2f2] hover:bg-[#5fdb72]/10 hover:text-[#5fdb72] transition-colors border-b border-white/5 last:border-0"
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
                <p className="text-xs text-[#f2f2f2]/40">
                  Type to search or select a popular model.
                </p>
              </div>
            </>
          )}

          {/* Parameters Tab Content */}
          {activeTab === "parameters" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-end">
                <button
                  onClick={resetParameters}
                  className="text-xs text-[#f2f2f2]/60 hover:text-[#5fdb72] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[#5fdb72]/10"
                >
                  <RefreshCw size={12} /> Reset to Defaults
                </button>
              </div>
              {/* Temperature */}
              <div className="flex flex-col gap-3">
                <label className="text-md text-[#f2f2f2] flex items-center gap-2">
                  Temperature: {temperature}
                  <div className="group relative">
                    <Info size={14} className="text-[#f2f2f2]/40 cursor-help hover:text-[#5fdb72] transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl text-xs text-[#f2f2f2] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                      Controls randomness. Lower values are more deterministic, higher values are more creative.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e] border-b border-r border-white/10 rotate-45"></div>
                    </div>
                  </div>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  className="w-full h-2 bg-[#161616] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5fdb72] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-xs text-[#f2f2f2]/60">
                  <span>0 (More deterministic)</span>
                  <span>2 (More random)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="flex flex-col gap-3">
                <label className="text-md text-[#f2f2f2]">
                  Max Tokens
                </label>
                <input
                  type="number"
                  className="w-full h-12 px-6 bg-[#161616] border border-white/10 rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
                  placeholder="Enter max tokens"
                  value={max_tokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Top-p */}
              <div className="flex flex-col gap-3">
                <label className="text-md text-[#f2f2f2] flex items-center gap-2">
                  Top-p: {top_p}
                  <div className="group relative">
                    <Info size={14} className="text-[#f2f2f2]/40 cursor-help hover:text-[#5fdb72] transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl text-xs text-[#f2f2f2] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                      Controls diversity via nucleus sampling. 1.0 is standard.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e] border-b border-r border-white/10 rotate-45"></div>
                    </div>
                  </div>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full h-2 bg-[#161616] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5fdb72] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                  value={top_p}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-xs text-[#f2f2f2]/60">
                  <span>0 (More focused)</span>
                  <span>1 (More diverse)</span>
                </div>
              </div>

              {/* Frequency Penalty */}
              <div className="flex flex-col gap-3">
                <label className="text-md text-[#f2f2f2] flex items-center gap-2">
                  Frequency Penalty: {frequency_penalty}
                  <div className="group relative">
                    <Info size={14} className="text-[#f2f2f2]/40 cursor-help hover:text-[#5fdb72] transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl text-xs text-[#f2f2f2] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                      Penalizes tokens based on their existing frequency in the text so far.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e] border-b border-r border-white/10 rotate-45"></div>
                    </div>
                  </div>
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  className="w-full h-2 bg-[#161616] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5fdb72] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                  value={frequency_penalty}
                  onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-xs text-[#f2f2f2]/60">
                  <span>-2 (More repetition)</span>
                  <span>2 (Less repetition)</span>
                </div>
              </div>

              {/* Presence Penalty */}
              <div className="flex flex-col gap-3">
                <label className="text-md text-[#f2f2f2] flex items-center gap-2">
                  Presence Penalty: {presence_penalty}
                  <div className="group relative">
                    <Info size={14} className="text-[#f2f2f2]/40 cursor-help hover:text-[#5fdb72] transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl text-xs text-[#f2f2f2] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                      Penalizes tokens based on whether they appear in the text so far.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e] border-b border-r border-white/10 rotate-45"></div>
                    </div>
                  </div>
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  className="w-full h-2 bg-[#161616] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5fdb72] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                  value={presence_penalty}
                  onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-xs text-[#f2f2f2]/60">
                  <span>-2 (More repetition)</span>
                  <span>2 (Less repetition)</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modal Footer */}
      </div>
    </div>
  );
}
