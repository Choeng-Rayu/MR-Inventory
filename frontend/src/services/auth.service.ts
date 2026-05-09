import { api, handleApiError } from './api'
import type { LoginCredentials, AuthResponse, User } from '@/types/auth.types'
import { AxiosError } from 'axios'

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  email: string
  otp: string
  newPassword: string
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async loginWithGoogle(token: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/google', { token })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async loginWithTelegram(authData: Record<string, unknown>): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/telegram', authData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/profile')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>('/auth/profile', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    try {
      await api.post('/auth/change-password', data)
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string; otpSent: boolean }> {
    try {
      const response = await api.post<{ message: string; otpSent: boolean }>('/auth/forgot-password', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },
}
