import { create } from "zustand";
const useChatStore = create((set) => ({
    summarizeText: "" 
}));

export default useChatStore;

