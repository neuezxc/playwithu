import { create } from 'zustand'
import { persist } from 'zustand/middleware'  // ← Add this

const useApiSettingStore = create(
  persist(  // ← Wrap with persist
    (set) => ({
      api_key: "",
      model_id: "openrouter/sonoma-dusk-alpha",
      modal: false,

      setApiKey: (key) => set({ api_key: key }),
      setModelId: (id) => set({ model_id: id }),
      setModal: (modal) => set({ modal: modal }),
    }),
    {
      name: 'api-storage',  // ← Unique name for localStorage
    }
  )
)

export default useApiSettingStore