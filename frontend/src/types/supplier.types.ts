export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface SupplierFilters {
  search?: string
  page?: number
  limit?: number
}
