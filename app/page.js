"use client";
import React, { useEffect } from "react";

import useApiSettingStore from "./store/useApiSettingStore";
import ApiSettingsModal from "./components/modal/ApiSettingsModal";
import SuperInput from "./components/SuperInput";
import ChatList from "./components/ChatList";
import useCharacterStore from "./store/useCharacterStore";
export default function Home() {
  const { modal } = useApiSettingStore();
  const {character} = useCharacterStore();
  useEffect(() => {
    console.log(character.messages)
  },[character.messages])
  return (
    <div className="flex flex-col items-center w-full h-screen bg-[#151615] text-[#E4E4E4] font-sans overflow-hidden">
      {/* Chat Header */}
      <header className="flex-shrink-0 flex justify-center items-center w-full h-[45px] py-10">
        <h1 className="text-base font-medium tracking-tight">
          Character name
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
