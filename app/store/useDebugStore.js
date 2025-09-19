import { create } from "zustand";
import { persist } from "zustand/middleware";

const useDebugStore = create(
  persist(
    (set, get) => ({
      logs: [],
      isModalOpen: false,
      isEnabled: false,
      
      // Add a new log entry
      addLog: (log) => set((state) => {
        // Only add log if debug logging is enabled
        if (!state.isEnabled) return state;
        
        return {
          logs: [...state.logs, {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...log
          }]
        };
      }),
      
      // Clear all logs
      clearLogs: () => set({ logs: [] }),
      
      // Set modal open state
      setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
      
      // Toggle debug logging enabled state
      toggleEnabled: () => set((state) => ({ isEnabled: !state.isEnabled })),
    }),
    {
      name: "debug-storage",
    }
  )
);

export default useDebugStore;