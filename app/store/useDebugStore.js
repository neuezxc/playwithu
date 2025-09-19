import { create } from "zustand";
import { persist } from "zustand/middleware";

const useDebugStore = create(
  persist(
    (set, get) => ({
      logs: [],
      isModalOpen: false,
      
      // Add a new log entry
      addLog: (log) => set((state) => ({
        logs: [...state.logs, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...log
        }]
      })),
      
      // Clear all logs
      clearLogs: () => set({ logs: [] }),
      
      // Set modal open state
      setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
    }),
    {
      name: "debug-storage",
    }
  )
);

export default useDebugStore;