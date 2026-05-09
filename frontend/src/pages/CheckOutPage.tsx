import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkOutSchema } from '@/utils/validators'
import { productService } from '@/services/product.service'
import { inventoryService } from '@/services/inventory.service'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import toast from 'react-hot-toast'
import {
  Search,
  Package,
  ArrowUpRight,
  X,
  Camera,
  Check,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'
import type { z } from 'zod'
import type { Product } from '@/types/product.types'
import type { CheckOutResult } from '@/types/inventory.types'

type CheckOutFormData = z.infer<typeof checkOutSchema>

export function CheckOutPage() {
  const queryClient = useQueryClient()
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [checkOutResult, setCheckOutResult] = useState<CheckOutResult | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckOutFormData>({
    resolver: zodResolver(checkOutSchema),
  })

  const checkOutMutation = useMutation({
    mutationFn: inventoryService.checkOut,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      toast.success('Check-out successful')
      setCheckOutResult(result)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onSubmit = (data: CheckOutFormData) => {
    checkOutMutation.mutate(data)
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
    setCheckOutResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check-Out</h1>
        <p className="mt-1 text-sm text-gray-600">Remove inventory from the system</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">{scannedProduct.name}</h3>
                <p className="text-sm text-gray-600">
                  Available: {scannedProduct.currentStock} {scannedProduct.baseUnit}
                </p>
              </div>
            </div>
            {scannedProduct.currentStock <= scannedProduct.lowStockThreshold && (
              <div className="flex items-center gap-1 text-warning-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">Low Stock</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Check-Out Form */}
      {scannedProduct && !checkOutResult && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('productId')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<ArrowUpRight className="h-4 w-4" />}
                isLoading={isSubmitting || checkOutMutation.isPending}
              >
                Check Out
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* FIFO Deduction Display */}
      {checkOutResult && (
        <Card className="bg-success-50">
          <div className="mb-4 text-center">
            <Check className="mx-auto mb-2 h-12 w-12 text-success-600" />
            <h3 className="text-lg font-medium text-success-900">Check-Out Successful</h3>
            <p className="text-sm text-success-700">
              Total deducted: {checkOutResult.transaction.quantity} {checkOutResult.transaction.unit}
            </p>
          </div>

          <h4 className="mb-2 text-sm font-medium text-gray-900">FIFO Deductions:</h4>
          <div className="space-y-2">
            {checkOutResult.deductions.map((d) => (
              <div
                key={d.batchId}
                className={`rounded-lg border p-3 ${
                  d.fullyDepleted ? 'border-success-300 bg-success-100' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.batchCode}</p>
                    <p className="text-xs text-gray-500">Imported: {d.importDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      -{d.quantityDeducted}
                    </p>
                    <p className="text-xs text-gray-500">
                      Remaining: {d.remainingQuantity}
                    </p>
                  </div>
                </div>
                {d.fullyDepleted && (
                  <Badge variant="success" size="sm">
                    Fully Depleted
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button leftIcon={<RotateCcw className="h-4 w-4" />} onClick={resetForm}>
              Check Out Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
