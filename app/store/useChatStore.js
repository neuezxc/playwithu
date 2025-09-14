import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatStore = create(
  persist((set) => ({
    summarizeText: "asdasdasd",
    setSummarizeText: (text) => set({ summarizeText: text }),
  })),
  {
    name: "chat-storage",
  }
);
export default useChatStore;
