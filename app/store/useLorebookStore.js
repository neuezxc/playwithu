import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLorebookStore = create(
  persist(
    (set, get) => ({
      // Global lorebooks: [{ id, name, enabled, entries: [{ id, keywords, content }] }]
      globalLorebooks: [],
      modal: false,
      activeCharacterLorebook: null, // for the quick-access modal

      // Global lorebook actions
      addLorebook: (name) =>
        set((state) => ({
          globalLorebooks: [
            ...state.globalLorebooks,
            {
              id: Date.now().toString(),
              name: name || 'New Lorebook',
              enabled: true,
              entries: [],
            },
          ],
        })),

      updateLorebook: (id, updates) =>
        set((state) => ({
          globalLorebooks: state.globalLorebooks.map((lb) =>
            lb.id === id ? { ...lb, ...updates } : lb
          ),
        })),

      deleteLorebook: (id) =>
        set((state) => ({
          globalLorebooks: state.globalLorebooks.filter((lb) => lb.id !== id),
        })),

      toggleLorebook: (id) =>
        set((state) => ({
          globalLorebooks: state.globalLorebooks.map((lb) =>
            lb.id === id ? { ...lb, enabled: !lb.enabled } : lb
          ),
        })),

      // Entry actions for global lorebooks
      addEntry: (lorebookId) =>
        set((state) => ({
          globalLorebooks: state.globalLorebooks.map((lb) =>
            lb.id === lorebookId
              ? {
                  ...lb,
                  entries: [
                    ...lb.entries,
                    {
                      id: Date.now().toString(),
                      keywords: '',
                      content: '',
                    },
                  ],
                }
              : lb
          ),
        })),

      updateEntry: (lorebookId, entryId, updates) =>
        set((state) => ({
          globalLorebooks: state.globalLorebooks.map((lb) =>
            lb.id === lorebookId
              ? {
                  ...lb,
                  entries: lb.entries.map((entry) =>
                    entry.id === entryId ? { ...entry, ...updates } : entry
                  ),
                }
              : lb
          ),
        })),

      deleteEntry: (lorebookId, entryId) =>
        set((state) => ({
          globalLorebooks: state.globalLorebooks.map((lb) =>
            lb.id === lorebookId
              ? {
                  ...lb,
                  entries: lb.entries.filter((entry) => entry.id !== entryId),
                }
              : lb
          ),
        })),

      // Modal
      setModal: (open) => set({ modal: open }),

      // Export/Import
      exportLorebook: (id) => {
        const lorebook = get().globalLorebooks.find((lb) => lb.id === id)
        if (!lorebook) return null
        return JSON.stringify(lorebook, null, 2)
      },

      importLorebook: (jsonString) => {
        try {
          const data = JSON.parse(jsonString)
          if (!data.name || !Array.isArray(data.entries)) {
            throw new Error('Invalid lorebook format')
          }
          const newLorebook = {
            id: Date.now().toString(),
            name: data.name,
            enabled: data.enabled ?? true,
            entries: data.entries.map((entry) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              keywords: entry.keywords || '',
              content: entry.content || '',
            })),
          }
          set((state) => ({
            globalLorebooks: [...state.globalLorebooks, newLorebook],
          }))
          return true
        } catch (error) {
          console.error('Error importing lorebook:', error)
          return false
        }
      },

      exportAll: () => {
        return JSON.stringify(get().globalLorebooks, null, 2)
      },

      importAll: (jsonString) => {
        try {
          const data = JSON.parse(jsonString)
          if (!Array.isArray(data)) {
            throw new Error('Invalid format: expected array of lorebooks')
          }
          const imported = data.map((lb) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: lb.name || 'Imported Lorebook',
            enabled: lb.enabled ?? true,
            entries: (lb.entries || []).map((entry) => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              keywords: entry.keywords || '',
              content: entry.content || '',
            })),
          }))
          set((state) => ({
            globalLorebooks: [...state.globalLorebooks, ...imported],
          }))
          return true
        } catch (error) {
          console.error('Error importing lorebooks:', error)
          return false
        }
      },
    }),
    {
      name: 'lorebook-storage',
    }
  )
)

export default useLorebookStore
