import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventory.service'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { formatDateTime, formatNumber } from '@/utils/formatters'
import {
  History,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Download,
} from 'lucide-react'

export function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    type: '',
    from: '',
    to: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { page, ...filters }],
    queryFn: () =>
      inventoryService.getTransactions({
        page,
        limit: 50,
        type: filters.type || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      }),
  })

  const handleExport = () => {
    if (!data?.data.length) return

    const headers = ['Type', 'Product', 'Quantity', 'Unit', 'User', 'Timestamp', 'Notes']
    const rows = data.data.map((tx) => [
      tx.type,
      tx.productName,
      tx.quantity,
      tx.unit,
      tx.userName,
      tx.timestamp,
      tx.notes || '',
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const transactions = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'check_in':
        return <ArrowDownLeft className="h-4 w-4 text-success-600" />
      case 'check_out':
        return <ArrowUpRight className="h-4 w-4 text-danger-600" />
      case 'adjustment':
        return <Scale className="h-4 w-4 text-warning-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="mt-1 text-sm text-gray-600">View all inventory movements</p>
        </div>
        <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All Types</option>
          <option value="check_in">Check-In</option>
          <option value="check_out">Check-Out</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="rounded-md border-gray-300 py-2 pl-3 pr-3 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="From"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="rounded-md border-gray-300 py-2 pl-3 pr-3 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="To"
        />
        {(filters.type || filters.from || filters.to) && (
          <Button variant="ghost" onClick={() => setFilters({ type: '', from: '', to: '' })}>
            Clear filters
          </Button>
        )}
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <History className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="text-sm capitalize text-gray-900">
                          {tx.type.replace('_', '-')}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {tx.productName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {formatNumber(tx.quantity)} {tx.unit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {tx.userName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(tx.timestamp)}
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
    </div>
  )
}
