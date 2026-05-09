import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventory.service'
import { productService } from '@/services/product.service'
import { supplierService } from '@/services/supplier.service'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adjustmentSchema } from '@/utils/validators'
import { formatDate, formatNumber } from '@/utils/formatters'
import toast from 'react-hot-toast'
import {
  Warehouse,
  ChevronLeft,
  ChevronRight,
  Scale,
} from 'lucide-react'
import type { z } from 'zod'
import type { Batch } from '@/types/inventory.types'

type AdjustmentFormData = z.infer<typeof adjustmentSchema>

export function BatchesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ productId: '', supplierId: '', expiryStatus: 'all' })
  const [adjustingBatch, setAdjustingBatch] = useState<Batch | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['batches', { page, ...filters }],
    queryFn: () =>
      inventoryService.getBatches({
        page,
        limit: 20,
        productId: filters.productId || undefined,
        supplierId: filters.supplierId || undefined,
        expiryStatus: filters.expiryStatus as 'all' | 'near' | 'expired',
      }),
  })

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => productService.getProducts({ limit: 100 }),
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => supplierService.getSuppliers({ limit: 100 }),
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
  })

  const adjustmentAmount = watch('adjustmentAmount')

  const adjustmentMutation = useMutation({
    mutationFn: inventoryService.adjustBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      toast.success('Adjustment applied')
      setAdjustingBatch(null)
      reset()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onAdjust = (data: AdjustmentFormData) => {
    adjustmentMutation.mutate(data)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return <Badge variant="danger">Expired</Badge>
      case 'near_expiry':
        return <Badge variant="warning">Near Expiry</Badge>
      case 'depleted':
        return <Badge variant="default">Depleted</Badge>
      default:
        return <Badge variant="success">Active</Badge>
    }
  }

  const batches = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Batches</h1>
        <p className="mt-1 text-sm text-gray-600">View and manage inventory batches</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          value={filters.productId}
          onChange={(e) => {
            setFilters({ ...filters, productId: e.target.value })
            setPage(1)
          }}
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All Products</option>
          {products?.data.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={filters.supplierId}
          onChange={(e) => {
            setFilters({ ...filters, supplierId: e.target.value })
            setPage(1)
          }}
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All Suppliers</option>
          {suppliers?.data.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={filters.expiryStatus}
          onChange={(e) => {
            setFilters({ ...filters, expiryStatus: e.target.value })
            setPage(1)
          }}
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="near">Near Expiry</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : batches.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Warehouse className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p>No batches found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Import Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {batch.batchCode}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {batch.productName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {batch.supplierName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {formatDate(batch.importDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {formatDate(batch.expiryDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {formatNumber(batch.remainingQuantity)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {getStatusBadge(batch.status)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustingBatch(batch)
                          reset({ batchId: batch.id, adjustmentAmount: 0, reason: '' })
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
                        title="Adjust Quantity"
                      >
                        <Scale className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Adjustment Modal */}
      <Modal
        isOpen={!!adjustingBatch}
        onClose={() => setAdjustingBatch(null)}
        title="Adjust Quantity"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAdjustingBatch(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="adjustment-form"
              isLoading={isSubmitting || adjustmentMutation.isPending}
            >
              Adjust
            </Button>
          </div>
        }
      >
        {adjustingBatch && (
          <form id="adjustment-form" onSubmit={handleSubmit(onAdjust)} className="space-y-4">
            <input type="hidden" {...register('batchId')} />
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                Current Quantity: <strong>{adjustingBatch.remainingQuantity}</strong>
              </p>
              {adjustmentAmount && (
                <p className="text-sm text-gray-600">
                  New Quantity:{' '}
                  <strong>
                    {adjustingBatch.remainingQuantity + Number(adjustmentAmount)}
                  </strong>
                </p>
              )}
            </div>
            <Input
              label="Adjustment Amount"
              type="number"
              step="0.01"
              placeholder="Use positive to add, negative to remove"
              error={errors.adjustmentAmount?.message}
              {...register('adjustmentAmount', { valueAsNumber: true })}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Reason <span className="text-danger-500">*</span>
              </label>
              <textarea
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                {...register('reason')}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-danger-600">{errors.reason.message}</p>
              )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
