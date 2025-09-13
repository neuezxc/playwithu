import { create } from "zustand";

const usePromptStore = create((set) => ({
  system_prompt: "You are neko,  put this below your chat: <test>",
  setSystemPrompt: (prompt) => set({ system_prompt: prompt }),
}));

export default usePromptStore;

