import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatStore = create(
  persist((set) => ({
    messageCount: 0,
    setMessageCount: (count) => set({ messageCount: count }),
  })),
  {
    name: "chat-storage",
  }
);
export default useChatStore;
