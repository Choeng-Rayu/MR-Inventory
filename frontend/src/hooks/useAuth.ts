import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const store = useAuthStore()

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    register: store.register,
    login: store.login,
    loginWithGoogle: store.loginWithGoogle,
    loginWithTelegram: store.loginWithTelegram,
    logout: store.logout,
    clearError: store.clearError,
  }
}
