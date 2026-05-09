export interface Batch {
  id: string
  batchCode: string
  productId: string
  productName: string
  supplierId: string
  supplierName: string
  importDate: string
  expiryDate: string
  unitCost: number
  quantity: number
  remainingQuantity: number
  unit: string
  status: 'active' | 'near_expiry' | 'expired' | 'depleted'
}

export interface Transaction {
  id: string
  type: 'check_in' | 'check_out' | 'adjustment'
  productId: string
  productName: string
  batchCode?: string
  quantity: number
  unit: string
  userId: string
  userName: string
  timestamp: string
  notes?: string
}

export interface CheckInData {
  productId: string
  supplierId: string
  quantity: number
  unit: string
  expiryDate: string
  unitCost: number
  batchCode?: string
}

export interface CheckOutData {
  productId: string
  quantity: number
  unit: string
}

export interface AdjustmentData {
  batchId: string
  adjustmentAmount: number
  reason: string
}

export interface FIFODeduction {
  batchId: string
  batchCode: string
  importDate: string
  quantityDeducted: number
  remainingQuantity: number
  fullyDepleted: boolean
}

export interface CheckOutResult {
  transaction: Transaction
  deductions: FIFODeduction[]
}

export interface BatchFilters {
  productId?: string
  supplierId?: string
  expiryStatus?: 'all' | 'near' | 'expired'
  page?: number
  limit?: number
}
