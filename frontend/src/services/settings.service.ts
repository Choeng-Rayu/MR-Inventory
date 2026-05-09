import { api, handleApiError } from './api'
import type { Settings } from '@/types/api.types'
import { AxiosError } from 'axios'

export const settingsService = {
  async getSettings(): Promise<Settings> {
    try {
      const response = await api.get<Settings>('/settings')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    try {
      const response = await api.put<Settings>('/settings', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async sendTestNotification(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/settings/test-notification')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },
}
