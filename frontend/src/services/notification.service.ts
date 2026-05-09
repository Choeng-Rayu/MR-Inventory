import { api, handleApiError } from './api'
import type { Notification, NotificationFilters } from '@/types/notification.types'
import type { PaginatedResponse } from '@/types/api.types'
import { AxiosError } from 'axios'

export const notificationService = {
  async getNotifications(
    filters: NotificationFilters = {}
  ): Promise<PaginatedResponse<Notification>> {
    try {
      const response = await api.get<PaginatedResponse<Notification>>('/notifications', {
        params: filters,
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await api.put<Notification>(`/notifications/${id}/read`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count')
      return response.data.count
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },
}
