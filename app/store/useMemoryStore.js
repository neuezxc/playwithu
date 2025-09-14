import { create } from "zustand";
import { persist } from "zustand/middleware"; // ← Add this

const useMemoryStore = create(
  persist(
    (set) => ({
      summarizeText: "",
      prompts: "Condense key details into one line: who, what, when, where, why — keep it vivid, emotional, and true to character voice for immersive roleplay recall.",
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
