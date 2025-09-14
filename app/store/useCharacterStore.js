import { create } from "zustand";
import { persist } from "zustand/middleware";
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
        firstMessage: "YOOOOO?",
        messages: [],
      },
      isInitialized: false,
      initializeMessage: () => {
        if (get().isInitialized) return;
        const currentFirstMessage = get().character.firstMessage;
        const newMessages = [
          {
            role: "system",
            content: usePromptStore.getState().system_prompt,
          },
          {
            role: "assistant",
            content: currentFirstMessage,
          },
        ];
        set((state) => ({
          character: {
            ...state.character,
            messages: newMessages,
          },
          isInitialized: true,
        }));
      },
      setCharacter: (character) => set({ character: character }),
      // In useCharacterStore
      setFirstMessage: (newMessage) => {
        set((state) => ({
          character: {
            ...state.character,
            firstMessage: newMessage,
          },
        }));
      },
    }),
    {
      name: "character-storage",
    }
  )
);

export default useCharacterStore;
