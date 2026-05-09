import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/services/report.service'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters'
import toast from 'react-hot-toast'
import {
  BarChart3,
  Download,
  Package,
  Clock,
  Truck,
} from 'lucide-react'

type ReportType = 'inventory' | 'expiry' | 'supplier' | 'movement'

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('inventory')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  const { data: inventoryReport } = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => reportService.getInventoryReport(),
    enabled: activeTab === 'inventory',
  })

  const { data: expiryReport } = useQuery({
    queryKey: ['report-expiry', dateRange],
    queryFn: () => reportService.getExpiryReport(dateRange),
    enabled: activeTab === 'expiry',
  })

  const { data: supplierReport } = useQuery({
    queryKey: ['report-supplier', dateRange],
    queryFn: () => reportService.getSupplierReport(dateRange),
    enabled: activeTab === 'supplier',
  })

  const { data: movementReport } = useQuery({
    queryKey: ['report-movement', dateRange],
    queryFn: () => reportService.getStockMovementReport(dateRange),
    enabled: activeTab === 'movement',
  })

  const tabs: { id: ReportType; label: string; icon: React.ReactNode }[] = [
    { id: 'inventory', label: 'Inventory Summary', icon: <Package className="h-4 w-4" /> },
    { id: 'expiry', label: 'Expiry Report', icon: <Clock className="h-4 w-4" /> },
    { id: 'supplier', label: 'Supplier Report', icon: <Truck className="h-4 w-4" /> },
    { id: 'movement', label: 'Stock Movement', icon: <BarChart3 className="h-4 w-4" /> },
  ]

  const handleExport = () => {
    toast.success('Export started')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">Generate and view inventory reports</p>
        </div>
        <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
          Export
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Range */}
      {activeTab !== 'inventory' && (
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="rounded-md border-gray-300 py-2 pl-3 pr-3 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="rounded-md border-gray-300 py-2 pl-3 pr-3 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      )}

      {/* Inventory Report */}
      {activeTab === 'inventory' && inventoryReport && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Inventory Summary</h3>
            <p className="text-sm text-gray-600">
              Total Value: <strong>{formatCurrency(inventoryReport.totalValue)}</strong>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Unit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {inventoryReport.data.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {formatNumber(item.totalQuantity)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {item.unit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Expiry Report */}
      {activeTab === 'expiry' && expiryReport && (
        <div className="space-y-4">
          {(['expired', 'nearExpiry7d', 'nearExpiry30d', 'nearExpiry90d'] as const).map((key) => {
            const items = expiryReport[key]
            if (!items?.length) return null
            return (
              <Card key={key}>
                <h3 className="mb-4 text-lg font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Batch</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Supplier</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{item.batchCode}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{item.productName}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{item.supplier}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                            {formatDate(item.expiryDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Supplier Report */}
      {activeTab === 'supplier' && supplierReport && (
        <Card>
          <h3 className="mb-4 text-lg font-medium text-gray-900">Supplier Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Batches</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Value</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {supplierReport.data.map((item) => (
                  <tr key={item.supplierId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {item.supplierName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {formatNumber(item.totalBatches)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {formatNumber(item.totalQuantity)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(item.totalValue)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {item.percentageOfTotal.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Movement Report */}
      {activeTab === 'movement' && movementReport && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Stock Movement</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-success-600">
                In: <strong>{formatNumber(movementReport.totalCheckIn)}</strong>
              </span>
              <span className="text-danger-600">
                Out: <strong>{formatNumber(movementReport.totalCheckOut)}</strong>
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Check-In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Check-Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Net Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {movementReport.data.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-success-600">
                      {formatNumber(item.checkInQuantity)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-danger-600">
                      {formatNumber(item.checkOutQuantity)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span
                        className={
                          item.netChange > 0
                            ? 'text-success-600'
                            : item.netChange < 0
                              ? 'text-danger-600'
                              : 'text-gray-600'
                        }
                      >
                        {item.netChange > 0 ? '+' : ''}
                        {formatNumber(item.netChange)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
