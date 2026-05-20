import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  admin: Admin | null;
  setSession: (s: { accessToken: string; refreshToken: string; admin: Admin }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      admin: null,
      setSession: (s) =>
        set({ accessToken: s.accessToken, refreshToken: s.refreshToken, admin: s.admin }),
      clear: () => set({ accessToken: null, refreshToken: null, admin: null }),
    }),
    { name: 'oxygen-admin-session' },
  ),
);
