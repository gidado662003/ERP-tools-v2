import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;

  setAdminAuthenticated: (value: boolean) => void;
  setAdminLoading: (value: boolean) => void;
  logoutAdmin: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdminAuthenticated: false,
      isAdminLoading: true,

      setAdminAuthenticated: (value) =>
        set({ isAdminAuthenticated: value, isAdminLoading: false }),
      setAdminLoading: (value) => set({ isAdminLoading: value }),
      logoutAdmin: () => set({ isAdminAuthenticated: false, isAdminLoading: false }),
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isAdminLoading = false;
      },
    }
  )
);

