import { create } from "zustand";

import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setInitialized: () =>
    set({
      isInitialized: true,
    }),
}));