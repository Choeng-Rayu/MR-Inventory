import { api, handleApiError } from './api'
import { AxiosError } from 'axios'

export interface InventoryReportItem {
  productId: string
  productName: string
  category: string
  totalQuantity: number
  unit: string
  value: number
}

export interface ExpiryReportItem {
  batchCode: string
  productName: string
  supplier: string
  quantity: number
  expiryDate: string
  daysUntilExpiry: number
}

export interface SupplierReportItem {
  supplierId: string
  supplierName: string
  totalBatches: number
  totalQuantity: number
  totalValue: number
  percentageOfTotal: number
}

export interface StockMovementItem {
  productId: string
  productName: string
  checkInQuantity: number
  checkOutQuantity: number
  netChange: number
}

export const reportService = {
  async getInventoryReport(params: { category?: string; format?: string } = {}): Promise<{
    data: InventoryReportItem[]
    totalValue: number
  }> {
    try {
      const response = await api.get('/reports/inventory', { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getExpiryReport(params: { from?: string; to?: string; format?: string } = {}): Promise<{
    expired: ExpiryReportItem[]
    nearExpiry7d: ExpiryReportItem[]
    nearExpiry30d: ExpiryReportItem[]
    nearExpiry90d: ExpiryReportItem[]
    totalValue: number
  }> {
    try {
      const response = await api.get('/reports/expiry', { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getSupplierReport(params: { from?: string; to?: string; format?: string } = {}): Promise<{
    data: SupplierReportItem[]
  }> {
    try {
      const response = await api.get('/reports/supplier', { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getStockMovementReport(params: { from?: string; to?: string } = {}): Promise<{
    data: StockMovementItem[]
    totalCheckIn: number
    totalCheckOut: number
  }> {
    try {
      const response = await api.get('/reports/movement', { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },
}
