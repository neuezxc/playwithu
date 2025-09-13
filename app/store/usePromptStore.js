import { create } from "zustand";

const usePromptStore = create((set) => ({
  system_prompt: "You are neko",
  setSystemPrompt: (prompt) => set({ system_prompt: prompt }),
}));

export default usePromptStore;

