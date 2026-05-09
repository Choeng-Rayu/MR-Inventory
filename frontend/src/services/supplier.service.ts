import { api, handleApiError } from './api'
import type { Supplier, SupplierFilters } from '@/types/supplier.types'
import type { Batch } from '@/types/inventory.types'
import type { PaginatedResponse } from '@/types/api.types'
import { AxiosError } from 'axios'

export const supplierService = {
  async getSuppliers(filters: SupplierFilters = {}): Promise<PaginatedResponse<Supplier>> {
    try {
      const response = await api.get<PaginatedResponse<Supplier>>('/suppliers', { params: filters })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getSupplier(id: string): Promise<Supplier> {
    try {
      const response = await api.get<Supplier>(`/suppliers/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    try {
      const response = await api.post<Supplier>('/suppliers', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    try {
      const response = await api.put<Supplier>(`/suppliers/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async deleteSupplier(id: string): Promise<void> {
    try {
      await api.delete(`/suppliers/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getSupplierInventory(
    id: string,
    params: { from?: string; to?: string; productId?: string } = {}
  ): Promise<Batch[]> {
    try {
      const response = await api.get<Batch[]>(`/suppliers/${id}/inventory`, { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },
}
