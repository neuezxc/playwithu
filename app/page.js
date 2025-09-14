"use client";
import React, { useEffect } from "react";

import useApiSettingStore from "./store/useApiSettingStore";
import ApiSettingsModal from "./components/modal/ApiSettingsModal";
import SuperInput from "./components/SuperInput";
import ChatList from "./components/ChatList";
import useCharacterStore from "./store/useCharacterStore";
import useChatStore from "./store/useChatStore";
import MemoryModal from "./components/modal/MemoryModal";
import useMemoryStore from "./store/useMemoryStore";
import usePromptStore from "./store/usePromptStore";

export default function Home() {
  const isApiSettingsModalOpen = useApiSettingStore((state) => state.modal);
  const isMemoryModalOpen = useMemoryStore((state) => state.modal);
  const { character } = useCharacterStore();
  const summarizeText = useMemoryStore((state) => state.summarizeText);
  const initializeMessage = useCharacterStore(
    (state) => state.initializeMessage
  );
  const setMessageCount = useChatStore((state) => state.setMessageCount);
  const { messageCount } = useChatStore();
  const updateSystemPrompt = useCharacterStore(
    (state) => state.updateSystemPrompt
  );
  const { system_prompt } = usePromptStore();

  useEffect(() => {
    initializeMessage();
    console.log(character.messages);
  }, [initializeMessage]);
  useEffect(() => {
    console.log(character.messages);
    setMessageCount(character.messages.length);
    console.log(messageCount);
  }, [character.messages]);

  return (
    <div className="flex flex-col items-center w-full h-[100dvh] bg-[#151615] text-[#E4E4E4] font-sans overflow-hidden">
      {/* Chat Header */}
      <header className="flex-shrink-0 flex justify-center items-center w-full h-[45px] py-10">
        <h1 className="text-base font-medium tracking-tight flex flex-col items-center">
          {character.name}
          <span className="text-sm font-normal opacity-40">
            {character.bio}
          </span>
        </h1>
      </header>

      {/* Chat Body */}
      <ChatList />
      {/* Input Area */}
      <SuperInput />
      {isMemoryModalOpen && <MemoryModal />}
      {isApiSettingsModalOpen && <ApiSettingsModal />}
    </div>
  );
}
