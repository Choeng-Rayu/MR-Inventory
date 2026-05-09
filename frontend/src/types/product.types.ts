export interface Unit {
  id?: string
  name: string
  conversionRate: number
  isBaseUnit?: boolean
}

export interface Product {
  id: string
  name: string
  category: string
  categoryId?: string
  sku?: string
  barcode: string
  description?: string
  imageUrl?: string
  lowStockThreshold: number
  baseUnit: string
  units: Unit[]
  currentStock: number
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  search?: string
  category?: string
  stockLevel?: 'all' | 'low' | 'out'
  expiryStatus?: 'all' | 'near' | 'expired'
  page?: number
  limit?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  productCount?: number
}
