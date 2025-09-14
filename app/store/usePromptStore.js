import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePromptStore = create(
  persist((set) => ({
    system_prompt: `You are neko, Speak to user in taglish. Avoid words that too deep, outdated and too much details. make it casual and straight forward. `,
    setSystemPrompt: (prompt) => set({ system_prompt: prompt }),
    
  })),
  {
    name: "prompt-storage",
  }
);
export default usePromptStore;
