'use client'
import React, { useEffect } from "react";
import { Settings2, CodeXml, ArrowUp, User } from "lucide-react";

import useApiSettingStore from "./store/useApiSettingStore";
import ApiSettingsModal from "./components/modal/ApiSettingsModal";

export default function Home() {
  const { api_key, model_id, modal } = useApiSettingStore();
  const setApiKey = useApiSettingStore((state) => state.setApiKey);
  const setModal = useApiSettingStore((state) => state.setModal);
  const handleMessage = () => {
    try {
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model_id,
          messages: [
            {
              role: "user",
              content: "What is the meaning of life?",
            },
          ],
        }),
      });
    } catch (err) {}
  };
  return (
    <div className="flex flex-col items-center w-full h-screen bg-[#151615] text-[#E4E4E4] font-sans overflow-hidden">
      {/* Chat Header */}
      <header className="flex-shrink-0 flex justify-center items-center w-full h-[45px] py-3">
        <h1 className="text-base font-medium tracking-tight">Character name</h1>
      </header>

      {/* Chat Body */}
      <main className="flex-1 w-full max-w-2xl px-4 overflow-y-auto">
        <div className="flex flex-col gap-6 py-6 mx-[50px]">
          {/* Character's Chat Message */}
          <div className="flex items-start gap-3">
            <div className="w-[50px] h-[50px] bg-[#393A39] rounded-lg flex-shrink-0">
              {/* You can place an <img /> tag here for the character's avatar */}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-base font-medium text-[#E4E4E4]">
                Character Name:
              </span>
              <p className="text-sm font-normal text-[#CDCDCD]">
                Hey there! The usual today? Or are we feeling adventurous and
                trying something new?
              </p>
            </div>
          </div>

          {/* User's Chat Message */}
          <div className="flex justify-end">
            <div className="bg-[#242524] border border-[#333333] rounded-2xl p-4 max-w-sm">
              <p className="text-sm font-normal text-[#CDCDCD]">
                Hmm, maybe something new. What do you recommend that's not too
                sweet?
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex flex-col items-center w-full p-4">
        <div className="w-full max-w-xl bg-[#212121] border border-[#282828] rounded-2xl p-3 flex flex-col gap-3">
          <textarea
            className="w-full bg-transparent text-[#CDCDCD] text-base placeholder:text-[#A2A2A2] resize-none outline-none"
            placeholder="Enter to send chat + Enter for linebreak."
            rows={3}
          ></textarea>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <button onClick={() => setModal(true)} className="flex items-center justify-center w-8 h-8 bg-white/10 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all">
                <Settings2 size={16} />
              </button>
              <button className="flex items-center justify-center w-8 h-8 bg-white/10 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all ">
                <CodeXml size={18} className="" />
              </button>
              <button className="flex items-center justify-center px-3 h-8 bg-white/10 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all">
                <span className="text-sm font-medium text-[#EEEEEE]">
                  Characters
                </span>
              </button>
            </div>
            <button onClick={handleMessage} className="flex items-center justify-center w-8 h-8 bg-[#3A9E49]/30 border border-[#3A9E49] rounded-lg hover:bg-[#3A9E49]/50 transition-colors">
              <ArrowUp size={16} className="text-[#D3D3D3]" />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-2 text-xs font-normal text-[#656565]">
          This is an AI-generated persona, not a real person.
        </p>
      </footer>
      {modal && <ApiSettingsModal />}
    </div>
  );
}
