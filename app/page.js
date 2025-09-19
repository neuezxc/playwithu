"use client";
import React, { useEffect } from "react";

import useApiSettingStore from "./store/useApiSettingStore";
import useCharacterStore from "./store/useCharacterStore";
import useChatStore from "./store/useChatStore";
import useMemoryStore from "./store/useMemoryStore";
import usePromptStore from "./store/usePromptStore";
import useDebugStore from "./store/useDebugStore";

import { SuperInput } from "./components";
import { ChatList } from "./components";
import { ApiSettingsModal, MemoryModal, DebugModal } from "./components";

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
  }, [initializeMessage]);
  
  useEffect(() => {
    setMessageCount(character.messages.length);
  }, [character.messages]);

  return (
    <div className="flex flex-col items-center w-full h-[100dvh] bg-[#151615] text-[#E4E4E4] font-sans overflow-hidden">
      {/* Character Profile */}
      <header className="flex-shrink-0 flex justify-center items-center w-full h-[45px] ">
        <h1 className="text-base font-medium tracking-tight flex flex-col items-center">
          {character.name}
        </h1>
      </header>
      {/* Chat Body */}
      <ChatList />
      {/* Input Area */}
      <SuperInput />
      {isMemoryModalOpen && <MemoryModal />}
      {isApiSettingsModalOpen && <ApiSettingsModal />}
      {useDebugStore.getState().isModalOpen && <DebugModal />}
    </div>
  );
}
