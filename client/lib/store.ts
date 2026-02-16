// client/lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  department: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, // Start with no user
      isAuthenticated: false,
      isLoading: true, // Start loading while hydrating

      setUser: (user) => {
        // Normalize the user object to always have _id
        const normalizedUser = user
          ? {
              ...user,
              _id: user._id || user.id, // Handle both _id and id from API
            }
          : null;

        set({
          user: normalizedUser,
          isAuthenticated: !!normalizedUser,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("erp_token");
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage", // Key for localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set loading to false after hydration is complete
        if (state) {
          state.isLoading = false;
        }
      },
    },
  ),
);

type ThemeMode = "light" | "dark";

interface DisplayModeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useDisplayMode = create<DisplayModeState>()(
  persist(
    (set, get) => ({
      mode: "light",

      setMode: (mode) => {
        if (typeof window !== "undefined") {
          const html = document.documentElement;
          html.classList.remove("light", "dark");
          html.classList.add(mode);
        }

        set({ mode });
      },

      toggleMode: () => {
        const current = get().mode;
        const newMode = current === "light" ? "dark" : "light";

        if (typeof window !== "undefined") {
          const html = document.documentElement;
          html.classList.remove("light", "dark");
          html.classList.add(newMode);
        }

        set({ mode: newMode });
      },
    }),
    {
      name: "display-mode-storage",

      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          const html = document.documentElement;
          html.classList.remove("light", "dark");
          html.classList.add(state.mode);
        }
      },
    },
  ),
);
