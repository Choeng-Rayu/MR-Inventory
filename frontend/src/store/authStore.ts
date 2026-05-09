import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth.types'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  register: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  loginWithGoogle: (token: string) => Promise<void>
  loginWithTelegram: (authData: Record<string, unknown>) => Promise<void>
  logout: () => Promise<void>
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register({ email, password, name })
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          localStorage.setItem('token', response.token)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login({ email, password, rememberMe })
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          localStorage.setItem('token', response.token)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      loginWithGoogle: async (token) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.loginWithGoogle(token)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          localStorage.setItem('token', response.token)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Google login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      loginWithTelegram: async (authData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.loginWithTelegram(authData)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
          localStorage.setItem('token', response.token)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Telegram login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch {
          // ignore logout errors
        }
        localStorage.removeItem('token')
        localStorage.removeItem('auth-storage')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token, isAuthenticated: true }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
