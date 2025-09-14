"use client";
import React, { useEffect } from "react";

import useApiSettingStore from "./store/useApiSettingStore";
import ApiSettingsModal from "./components/modal/ApiSettingsModal";
import SuperInput from "./components/SuperInput";
import ChatList from "./components/ChatList";
import useCharacterStore from "./store/useCharacterStore";
import useChatStore from "./store/useChatStore";
import { formatChatForSummarize } from "./utils/formatChatForSummarize";

export default function Home() {
  const { modal } = useApiSettingStore();
  const { character } = useCharacterStore();
  const initializeMessage = useCharacterStore(
    (state) => state.initializeMessage
  );
  const { api_key, model_id } = useApiSettingStore();
  const setSummarizeText = useChatStore((state) => state.setSummarizeText);

  useEffect(() => {
    if (character.messages.length % 6 === 0 && character.messages.length > 0) {
      console.log(character.messages.length);
      console.log(formatChatForSummarize(character.messages));
      autoSummarize();
    }
  }, [character.messages]);

  const autoSummarize = async () => {
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
                content:
                  "You are a concise and immersive summarization engine for a dynamic roleplay chat. Your sole purpose is to silently observe the narrative and provide a brief, third-person summary of the events.",
              },
              {
                role: "user",
                content: formatChatForSummarize(character.messages),
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const text = data.choices[0].message.content;
      setSummarizeText(text);
      console.log(text);
    } catch (error) {
      console.error("Error sending message:", error.message);
      // You might want to revert the user message or show an error to the user
    }
  };

  useEffect(() => {
    initializeMessage();
  }, [initializeMessage]);

  return (
    <div className="flex flex-col items-center w-full h-screen bg-[#151615] text-[#E4E4E4] font-sans overflow-hidden">
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
      {modal && <ApiSettingsModal />}
    </div>
  );
}
