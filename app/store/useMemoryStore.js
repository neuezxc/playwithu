import { create } from "zustand";
import { persist } from "zustand/middleware"; // ← Add this

const useMemoryStore = create(
  persist(
    (set) => ({
      summarizeText: "",
      prompts: "Concisely summarize the current scene, characters, and immediate objective to maintain context.",
      modal: false,
      setSummarizeText: (text) => set({ summarizeText: text }),
      setModal: (modal) => set({ modal: modal }),
    }),
    {
      name: "memory-storage", // ← Unique name for localStorage
    }
  )
);

export default useMemoryStore;
