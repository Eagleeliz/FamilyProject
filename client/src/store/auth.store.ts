import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        if (response.success && response.data) {
          const token = response.data.tokens.accessToken;
          set({ token, isAuthenticated: true });
          const userResponse = await authService.getMe();
          if (userResponse.success && userResponse.data) {
            set({ user: userResponse.data });
          } else {
            set({ user: null, token: null, isAuthenticated: false });
            throw new Error(userResponse.error || 'Failed to fetch user data');
          }
        } else {
          throw new Error(response.error || 'Login failed');
        }
      },

      register: async (email: string, password: string, firstName: string, lastName: string) => {
        const response = await authService.register({ email, password, firstName, lastName });
        if (response.success && response.data) {
          const token = response.data.tokens.accessToken;
          set({ token, isAuthenticated: true });
          const userResponse = await authService.getMe();
          if (userResponse.success && userResponse.data) {
            set({ user: userResponse.data });
          } else {
            set({ user: null, token: null, isAuthenticated: false });
            throw new Error(userResponse.error || 'Failed to fetch user data');
          }
        } else {
          throw new Error(response.error || 'Registration failed');
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const token = useAuthStore.getState().token;
        set({ isLoading: true });
        if (!token) {
          set({ isLoading: false });
          return;
        }
        try {
          const response = await authService.getMe();
          if (response.success && response.data) {
            set({ user: response.data, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
