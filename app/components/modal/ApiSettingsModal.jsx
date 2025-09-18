'use client'
import React, { useEffect } from "react";
import { X } from "lucide-react";
import useApiSettingStore from "@/app/store/useApiSettingStore";

// To control the visibility of this modal, you can manage its state
// in a parent component and pass down `isOpen` and `onClose` props.
// For demonstration, it is rendered directly here.

export default function ApiSettingsModal() {
  const { api_key, model_id } = useApiSettingStore()
  const setModal = useApiSettingStore((state) => state.setModal);
  const setApiKey = useApiSettingStore((state) => state.setApiKey);
  const setModelId = useApiSettingStore((state) => state.setModelId);



  return (
    // Modal Overlay: Centers the modal and provides a backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm bg-opacity-50 p-4">
      {/* Modal Content */}
      <div className="w-full max-w-2xl rounded-xl shadow-lg flex flex-col font-sans border border-white/20 bg-white/2">
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
            <button className="py-2 text-md  text-[#5fdb72] border-b-2 border-[#5fdb72]">
              Connection
            </button>
            <button className="py-2 text-md text-[#d9d9d9] border-b-2 border-transparent hover:text-white transition-colors">
              Parameters
            </button>
          </nav>
        </div>

        {/* Modal Body */}
        <main className="p-7 flex flex-col gap-8">
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
              className="w-full h-12 px-6 bg-[#161616] rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
              placeholder="Placeholder"
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
              className="w-full h-12 px-6 bg-[#161616] rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
              placeholder="Placeholder"
              value={model_id}
              onChange={(e) => setModelId(e.target.value)}
            />
          </div>
        </main>

        {/* Modal Footer */}
        <footer className="flex justify-end items-center gap-3 p-6 border-t border-[#333]">
        </footer>
      </div>
    </div>
  );
}
