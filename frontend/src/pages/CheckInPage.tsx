import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkInSchema } from '@/utils/validators'
import { productService } from '@/services/product.service'
import { supplierService } from '@/services/supplier.service'
import { inventoryService } from '@/services/inventory.service'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import toast from 'react-hot-toast'
import {
  Search,
  Package,
  ArrowDownLeft,
  X,
  Camera,
  Check,
  RotateCcw,
} from 'lucide-react'
import type { z } from 'zod'
import type { Product } from '@/types/product.types'

type CheckInFormData = z.infer<typeof checkInSchema>

export function CheckInPage() {
  const queryClient = useQueryClient()
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [successBatch, setSuccessBatch] = useState<string | null>(null)

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.getSuppliers({ limit: 100 }),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
  })

  const checkInMutation = useMutation({
    mutationFn: inventoryService.checkIn,
    onSuccess: (batch) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      toast.success(`Checked in successfully. Batch: ${batch.batchCode}`)
      setSuccessBatch(batch.batchCode)
      reset()
      setScannedProduct(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onSubmit = (data: CheckInFormData) => {
    checkInMutation.mutate(data)
  }

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return
    try {
      const product = await productService.getProductByBarcode(barcodeInput.trim())
      setScannedProduct(product)
      setValue('productId', product.id)
      setBarcodeInput('')
      setShowScanner(false)
    } catch {
      toast.error('Product not found')
    }
  }

  const { elementId, startScanning, stopScanning } = useBarcodeScanner({
    onScan: async (barcode) => {
      try {
        const product = await productService.getProductByBarcode(barcode)
        setScannedProduct(product)
        setValue('productId', product.id)
        setShowScanner(false)
        toast.success(`Scanned: ${product.name}`)
      } catch {
        toast.error('Product not found')
      }
    },
    onError: (error) => toast.error(error),
  })

  const handleStartScanner = async () => {
    setShowScanner(true)
    await startScanning()
  }

  const handleCloseScanner = async () => {
    await stopScanning()
    setShowScanner(false)
  }

  const resetForm = () => {
    reset()
    setScannedProduct(null)
    setSuccessBatch(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check-In</h1>
        <p className="mt-1 text-sm text-gray-600">Add new inventory to the system</p>
      </div>

      {/* Barcode Input / Scanner */}
      <Card>
        <h2 className="mb-4 text-lg font-medium text-gray-900">Scan or Enter Barcode</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter barcode..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
              className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleBarcodeSearch}>
            Search
          </Button>
          <Button
            type="button"
            variant="primary"
            leftIcon={<Camera className="h-4 w-4" />}
            onClick={handleStartScanner}
          >
            Scan
          </Button>
        </div>

        {showScanner && (
          <div className="relative mt-4">
            <div id={elementId} className="mx-auto max-w-md overflow-hidden rounded-lg" />
            <button
              type="button"
              onClick={handleCloseScanner}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </Card>

      {/* Product Info */}
      {scannedProduct && (
        <Card className="bg-primary-50">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="font-medium text-gray-900">{scannedProduct.name}</h3>
              <p className="text-sm text-gray-600">
                {scannedProduct.category} &middot; Barcode: {scannedProduct.barcode}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Check-In Form */}
      {scannedProduct && !successBatch && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('productId')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Supplier <span className="text-danger-500">*</span>
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  {...register('supplierId')}
                >
                  <option value="">Select supplier</option>
                  {suppliers?.data.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="mt-1 text-sm text-danger-600">{errors.supplierId.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Unit <span className="text-danger-500">*</span>
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  {...register('unit')}
                >
                  <option value={scannedProduct.baseUnit}>
                    {scannedProduct.baseUnit} (Base)
                  </option>
                  {scannedProduct.units?.map((u) => (
                    <option key={u.id || u.name} value={u.name}>
                      {u.name} ({u.conversionRate}x)
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-danger-600">{errors.unit.message}</p>
                )}
              </div>
              <Input
                label="Quantity"
                type="number"
                min="0.01"
                step="0.01"
                error={errors.quantity?.message}
                {...register('quantity', { valueAsNumber: true })}
              />
              <Input
                label="Expiry Date"
                type="date"
                error={errors.expiryDate?.message}
                {...register('expiryDate')}
              />
              <Input
                label="Unit Cost"
                type="number"
                min="0.01"
                step="0.01"
                error={errors.unitCost?.message}
                {...register('unitCost', { valueAsNumber: true })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<ArrowDownLeft className="h-4 w-4" />}
                isLoading={isSubmitting || checkInMutation.isPending}
              >
                Check In
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Success */}
      {successBatch && (
        <Card className="bg-success-50 text-center">
          <Check className="mx-auto mb-2 h-12 w-12 text-success-600" />
          <h3 className="text-lg font-medium text-success-900">Check-In Successful</h3>
          <p className="mt-1 text-sm text-success-700">Batch code: {successBatch}</p>
          <Button type="button" className="mt-4" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetForm}>
            Check In Another
          </Button>
        </Card>
      )}
    </div>
  )
}
