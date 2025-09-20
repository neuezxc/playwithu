'use client'
import React, { useState } from "react";
import { X } from "lucide-react";
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

  const [activeTab, setActiveTab] = useState("connection");

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
                <input
                  id="apiKey"
                  type="password"
                  className="w-full h-12 px-6 bg-[#161616] border border-white/10 rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
                  placeholder="Enter your API key"
                  onChange={(e) => setApiKey(e.target.value)}
                  value={api_key}
                />
              </div>

              {/* Model ID Input */}
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="modelId"
                  className="text-md text-[#f2f2f2]"
                >
                  Model
                </label>
                <input
                  id="modelId"
                  type="text"
                  className="w-full h-12 px-6 bg-[#161616] border border-white/10 rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
                  placeholder="Enter model ID"
                  value={model_id}
                  onChange={(e) => setModelId(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Parameters Tab Content */}
          {activeTab === "parameters" && (
            <div className="flex flex-col gap-6">
              {/* Temperature */}
              <div className="flex flex-col gap-3">
                <label className="text-md text-[#f2f2f2]">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  className="w-full h-2 bg-[#161616] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5fdb72]"
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
                <label className="text-md text-[#f2f2f2]">
                  Top-p: {top_p}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full h-2 bg-[#161616] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5fdb72]"
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
                <label className="text-md text-[#f2f2f2]">
                  Frequency Penalty: {frequency_penalty}
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  className="w-full h-2 bg-[#161616] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5fdb72]"
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
                <label className="text-md text-[#f2f2f2]">
                  Presence Penalty: {presence_penalty}
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  className="w-full h-2 bg-[#161616] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5fdb72]"
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
