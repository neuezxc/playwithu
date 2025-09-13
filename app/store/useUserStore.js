import { create } from "zustand";

const useUserStore = create((set) => ({
  user: {
    name: "Mac",
    description: "23, stoic.",
    message: "",
  },
  setUser: (user) => set({ user: user }),
}));

export default useUserStore;
