import { create } from "zustand";

export const useApiSettingStore = create((set) => ({
  api_key: "",
  model_id: "openrouter/sonoma-dusk-alpha",
  modal: false,

  setApiKey: (key) => set({ api_key: key }),
  setModelId: (id) => set({ model_id: id }),
  setModal: (modal) => set({ modal: modal }),
}));

export default useApiSettingStore;

