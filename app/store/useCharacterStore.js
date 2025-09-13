import { create } from "zustand";

import usePromptStore from "./usePromptStore";
const useCharacterStore = create((set) => ({
  character: {
    name: "hayeon",
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
        role: "user",
        content: "Whats your name?",
      },
    ],
  },
  setCharacter: (character) => set({ character: character }),
}));

export default useCharacterStore;
