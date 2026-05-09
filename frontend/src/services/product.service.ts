import { api, handleApiError } from './api'
import type { Product, ProductFilters, Category } from '@/types/product.types'
import type { PaginatedResponse } from '@/types/api.types'
import { AxiosError } from 'axios'

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get<PaginatedResponse<Product>>('/products', { params: filters })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getProductByBarcode(barcode: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products/barcode/${barcode}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    try {
      const response = await api.post<Product>('/products', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    try {
      const response = await api.put<Product>(`/products/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async uploadImage(id: string, file: File): Promise<Product> {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await api.post<Product>(`/products/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>('/categories')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    try {
      const response = await api.post<Category>('/categories', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    try {
      const response = await api.put<Category>(`/categories/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError))
    }
  },
}
