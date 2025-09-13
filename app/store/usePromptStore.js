import { create } from "zustand";

const usePromptStore = create((set) => ({
  system_prompt: ``,
  setSystemPrompt: (prompt) => set({ system_prompt: prompt }),
}));
