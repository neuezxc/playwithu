import { create } from "zustand";
import { persist } from 'zustand/middleware'

import usePromptStore from "./usePromptStore";

const useCharacterStore = create(
  persist(
    (set, get) => ({
      character: {
        name: "Hayeon",
        avatarURL: "",
        bio: "streamer",
        description: "hayeon 23, streamer have million views",
        scenario: "living together with user",
        messages: [
          {
            role: "system",
            content: usePromptStore.getState().system_prompt,
          },
          {
            role: "assistant",
            content: "I'm neko, what i can help you? <test>",
          },
        ],
      },
      setCharacter: (character) => set({ character: character }),
    }),
    {
      name: "character-storage", // unique name for the storage
      // You can add other options like:
      // storage: localStorage, // (default) or sessionStorage
      // partialize: (state) => ({ character: state.character }), // to persist only specific parts
    }
  )
);

export default useCharacterStore;