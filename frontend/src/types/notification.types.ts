export interface Notification {
  id: string
  type: 'low_stock' | 'near_expiry' | 'expired'
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, unknown>
}

export interface NotificationFilters {
  page?: number
  limit?: number
  unreadOnly?: boolean
}
