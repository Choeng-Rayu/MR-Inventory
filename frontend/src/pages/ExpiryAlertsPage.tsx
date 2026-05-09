import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventory.service'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { formatDate, formatNumber } from '@/utils/formatters'
import { differenceInDays, parseISO } from 'date-fns'
import { AlertTriangle, Clock, XCircle } from 'lucide-react'

export function ExpiryAlertsPage() {
  const [filter, setFilter] = useState<'all' | 'near' | 'expired'>('all')

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches-expiry', filter],
    queryFn: () =>
      inventoryService.getBatches({
        expiryStatus: filter === 'all' ? undefined : filter,
        limit: 100,
      }),
  })

  const allBatches = batches?.data ?? []

  const getUrgencyBadge = (expiryDate: string) => {
    const days = differenceInDays(parseISO(expiryDate), new Date())
    if (days < 0) return <Badge variant="danger">Expired</Badge>
    if (days < 7) return <Badge variant="danger">{days}d left</Badge>
    if (days < 30) return <Badge variant="warning">{days}d left</Badge>
    return <Badge variant="info">{days}d left</Badge>
  }

  const getUrgencyIcon = (expiryDate: string) => {
    const days = differenceInDays(parseISO(expiryDate), new Date())
    if (days < 0) return <XCircle className="h-5 w-5 text-danger-500" />
    if (days < 7) return <AlertTriangle className="h-5 w-5 text-danger-500" />
    if (days < 30) return <AlertTriangle className="h-5 w-5 text-warning-500" />
    return <Clock className="h-5 w-5 text-primary-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expiry Alerts</h1>
        <p className="mt-1 text-sm text-gray-600">Monitor products nearing or past expiry</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('near')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            filter === 'near'
              ? 'bg-warning-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Near Expiry
        </button>
        <button
          type="button"
          onClick={() => setFilter('expired')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            filter === 'expired'
              ? 'bg-danger-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Expired
        </button>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : allBatches.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <AlertTriangle className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p>No expiry alerts</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {allBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(batch.expiryDate)}
                        {getUrgencyBadge(batch.expiryDate)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {batch.batchCode}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {batch.productName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {formatDate(batch.expiryDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {formatNumber(batch.remainingQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
