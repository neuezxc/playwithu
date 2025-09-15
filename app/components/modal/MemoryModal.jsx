import React, { useState } from "react";
import { X, CodeXml, Pencil, Brain } from "lucide-react";

import useMemoryStore from "@/app/store/useMemoryStore";
import useApiSettingStore from "@/app/store/useApiSettingStore";
import useCharacterStore from "@/app/store/useCharacterStore";
import usePromptStore from "@/app/store/usePromptStore";

export default function MemoryModal() {
  const { api_key, model_id } = useApiSettingStore();
  const setModal = useMemoryStore((state) => state.setModal);
  const { prompts } = useMemoryStore();
  const { character } = useCharacterStore();
  const setSummarizeText = useMemoryStore((state) => state.setSummarizeText);
  const { summarizeText } = useMemoryStore();
  const updateSystemPrompt = useCharacterStore(
    (state) => state.updateSystemPrompt
  );
  const { system_prompt } = usePromptStore();
  const { active } = useMemoryStore();
  const setActive = useMemoryStore((state) => state.setActive);


  const handleSummarize = async () => {
    const formattedOutput = character.messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model_id,
            messages: [
              {
                role: "system",
                content: prompts,
              },
              {
                role: "user",
                content: formattedOutput,
              },
            ], // Use the updated messages array
          }),
        }
      );
      const data = await response.json();
      const text = data.choices[0].message.content;
      setSummarizeText(text);
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  const handleSave = () => {
    if(!summarizeText) return;
    updateSystemPrompt(system_prompt.replace("{{memory}}", summarizeText));
    setActive(true);
    setModal(false);
  };
  return (
    // Modal Overlay: Centers the modal and provides a backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-opacity-50 p-4">
      {/* Modal Content */}
      <div className="w-full max-w-lg bg-[#212121] rounded-xl shadow-lg flex flex-col font-sans">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-[#3b3b3b]">
          <h2 className="text-xl font-bold text-[#f2f2f2] tracking-[-0.4px] flex flex-row gap-1 items-center">
            <Brain />
            Memory
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModal(false)}
              className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
              aria-label="Close modal"
            >
              <X size={16} className="text-[#9F9F9F]" />
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <main className="p-6 flex flex-col gap-5">
          {/* Textarea Group */}
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-medium text-[#8e8e8e] tracking-[-0.2px] max-w-md">
              summarize chats - manually summarize the chats. auto summarize -
              it automatically summarize the chats every 10 messages count.
            </p>
            <textarea
              className="w-full h-48 bg-[#5fdb72]/10  border border-[#5fdb72] rounded-md p-4 text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none  transition-shadow resize-none"
              placeholder=""
              value={summarizeText}
              readOnly
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap flex-row items-center gap-4">
            <button
              onClick={handleSummarize}
              className="flex-1 whitespace-nowrap px-4 py-2 bg-[#5fdb72]/15 border border-[#5fdb72] rounded-lg text-[#e4ffe8] text-sm font-medium hover:bg-[#5fdb72]/25 transition-colors"
            >
              Summarize Chats
            </button>
            <button className="flex-1 whitespace-nowrap px-4 py-2 bg-[#454545]/30 border border-[#454545] rounded-lg text-[#e8e8e8] text-sm font-medium hover:bg-[#454545]/60 transition-colors">
              Auto Summarize
            </button>
            <button
              className="flex items-center justify-center h-full hidden"
              aria-label="Edit preview mode"
            >
              <Pencil size={16} className="text-[#9F9F9F]" />
            </button>
          </div>
        </main>

        {/* Modal Footer */}
        <footer className="flex flex-row justify-between items-center gap-4 p-6 border-t border-[#3c3c3c]">
          {active ? (
            <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-1 px-3 text-[0.7em] rounded-full">
              active
            </div>
          ) : (
            <div className="bg-yellow-600/10 border border-yellow-600 text-yellow-200 p-1 px-3 text-[0.7em] rounded-full">
              Not loaded.
            </div>
          )}

          <div className="flex flex-row gap-2">
            <button
              onClick={() => setModal(false)}
              className="px-4 py-2 text-sm font-medium text-white/80 bg-[#454545]/30 border border-[#454545] hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#5fdb72]/15 border border-[#5fdb72] rounded-lg text-[#e4ffe8] text-sm font-medium hover:bg-[#5fdb72]/25 transition-colors"
            >
              Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
