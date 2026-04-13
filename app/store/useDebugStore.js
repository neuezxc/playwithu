import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_LOGS = 50;

const useDebugStore = create(
  persist(
    (set, get) => ({
      logs: [],
      isModalOpen: false,
      isEnabled: false,

      addLog: (log) => set((state) => {
        if (!state.isEnabled) return state;

        const newEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          status: log.error ? "error" : "ok",
          characterName: log.characterName || "Unknown",
          promptName: log.promptName || "Unknown",
          resolvedSystemPrompt: log.resolvedSystemPrompt || "",
          lastUserMessage: log.lastUserMessage || "",
          lastAiResponse: log.lastAiResponse || "",
          params: log.params || { model: "", temperature: 0, max_tokens: 0, top_p: 0 },
          error: log.error || null,
          messages: log.messages || [],
        };

        const updatedLogs = [...state.logs, newEntry];
        // Cap at MAX_LOGS, drop oldest
        const cappedLogs = updatedLogs.length > MAX_LOGS
          ? updatedLogs.slice(updatedLogs.length - MAX_LOGS)
          : updatedLogs;

        return { logs: cappedLogs };
      }),

      clearLogs: () => set({ logs: [] }),

      setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

      toggleEnabled: () => set((state) => ({ isEnabled: !state.isEnabled })),
    }),
    {
      name: "debug-storage",
    }
  )
);

export default useDebugStore;
