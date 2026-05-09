import { api, handleApiError } from './api'
import type { Product } from '@/types/product.types'
import type {
  Batch,
  BatchFilters,
  CheckInData,
  CheckOutData,
  AdjustmentData,
  CheckOutResult,
  Transaction,
} from '@/types/inventory.types'
import type { PaginatedResponse, DashboardMetrics } from '@/types/api.types'
import { AxiosError } from 'axios'

export const inventoryService = {
  async getBatches(filters: BatchFilters = {}): Promise<PaginatedResponse<Batch>> {
    try {
      const response = await api.get<PaginatedResponse<Batch>>('/batches', { params: filters })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getBatch(id: string): Promise<Batch> {
    try {
      const response = await api.get<Batch>(`/batches/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async checkIn(data: CheckInData): Promise<Batch> {
    try {
      const response = await api.post<Batch>('/inventory/check-in', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async checkOut(data: CheckOutData): Promise<CheckOutResult> {
    try {
      const response = await api.post<CheckOutResult>('/inventory/check-out', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async adjustBatch(data: AdjustmentData): Promise<Batch> {
    try {
      const response = await api.post<Batch>('/inventory/adjust', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getTransactions(params: {
    page?: number
    limit?: number
    from?: string
    to?: string
    productId?: string
    type?: string
    userId?: string
  } = {}): Promise<PaginatedResponse<Transaction>> {
    try {
      const response = await api.get<PaginatedResponse<Transaction>>('/transactions', { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get<DashboardMetrics>('/dashboard/metrics')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getLowStockProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/dashboard/low-stock')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getRecentTransactions(limit = 10): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>('/transactions/recent', { params: { limit } })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },
}
