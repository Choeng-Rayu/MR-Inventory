export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DashboardMetrics {
  totalProducts: number
  totalUniqueProducts: number
  lowStockCount: number
  nearExpiryCount: number
  expiredCount: number
  totalInventoryValue: number
}

export interface Settings {
  nearExpiryDays: number
  defaultLowStockThreshold: number
  telegramEnabled: boolean
  telegramBotToken?: string
  telegramChatId?: string
  notificationPreferences: {
    lowStock: boolean
    nearExpiry: boolean
    expired: boolean
  }
}
