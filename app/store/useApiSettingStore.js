import { create } from 'zustand'
import { persist } from 'zustand/middleware'  // ← Add this

const useApiSettingStore = create(
  persist(  // ← Wrap with persist
    (set) => ({
      api_key: "",
      model_id: "openrouter/sonoma-dusk-alpha",
      modal: false,
      // API parameters with default values
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,

      setApiKey: (key) => set({ api_key: key }),
      setModelId: (id) => set({ model_id: id }),
      setModal: (modal) => set({ modal: modal }),
      // Parameter setters
      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (max_tokens) => set({ max_tokens }),
      setTopP: (top_p) => set({ top_p }),
      setFrequencyPenalty: (frequency_penalty) => set({ frequency_penalty }),
      setPresencePenalty: (presence_penalty) => set({ presence_penalty }),
    }),
    {
      name: 'api-storage',  // ← Unique name for localStorage
    }
  )
)

export default useApiSettingStore