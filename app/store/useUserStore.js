import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: {
        name: "Mac",
        description: "23 male",
        avatarURL: "",
        message: "",
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "persona-storage",
      partialize: (state) => ({
        user: {
          name: state.user.name,
          description: state.user.description,
          avatarURL: state.user.avatarURL,
        },
      }),
    }
  )
);

export default useUserStore;
