import { create } from "zustand";
import { persist } from "zustand/middleware"; // ← Add this

const useMemoryStore = create(
  persist(
    (set) => ({
      summarizeText: "",
      prompts: "[Read the provided conversation and generate a concise, accurate summary. Focus on capturing the main themes, key events, and important characters or concepts. Your summary should be clear and coherent, providing a comprehensive understanding of the original material in a significantly reduced form. Ensure that the essence and tone of the original text are maintained. Bullet Points Format]",
      
      modal: false,
      active: false,
      loading: false,
      setSummarizeText: (text) => set({ summarizeText: text }),
      setModal: (modal) => set({ modal: modal }),
      setActive: (active) => set({ active: active }),
      setLoading: (loading) => set({ loading: loading }),

    }),
    {
      name: "memory-storage", // ← Unique name for localStorage
    }
  )
);

export default useMemoryStore;
