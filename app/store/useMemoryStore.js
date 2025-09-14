import { create } from "zustand";
import { persist } from "zustand/middleware"; // ← Add this

const useMemoryStore = create(
  persist(
    (set) => ({
      summarizeText: "",
      prompts: "Concisely summarize the current scene, characters, and immediate objective to maintain context. response in description not in markdown formatting style.",
      modal: false,
      active: false,
      setSummarizeText: (text) => set({ summarizeText: text }),
      setModal: (modal) => set({ modal: modal }),
      setActive: (active) => set({ active: active }),

    }),
    {
      name: "memory-storage", // ← Unique name for localStorage
    }
  )
);

export default useMemoryStore;
