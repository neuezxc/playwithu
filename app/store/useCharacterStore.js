import { create } from "zustand";
import { persist } from "zustand/middleware";


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
