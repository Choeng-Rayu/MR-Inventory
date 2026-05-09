import { useQuery } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventory.service'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { formatNumber, formatCurrency, formatRelativeTime } from '@/utils/formatters'
import {
  Package,
  AlertTriangle,
  Clock,
  XCircle,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  History,
} from 'lucide-react'
import { DASHBOARD_REFRESH_INTERVAL, ACTIVITY_FEED_REFRESH_INTERVAL } from '@/utils/constants'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => inventoryService.getDashboardMetrics(),
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
  })

  const { data: lowStockProducts } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryService.getLowStockProducts(),
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
  })

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => inventoryService.getRecentTransactions(10),
    refetchInterval: ACTIVITY_FEED_REFRESH_INTERVAL,
  })

  const metricCards = [
    {
      title: 'Total Products',
      value: metrics?.totalUniqueProducts ?? 0,
      icon: <Package className="h-6 w-6 text-primary-600" />,
      color: 'bg-primary-50',
    },
    {
      title: 'Low Stock',
      value: metrics?.lowStockCount ?? 0,
      icon: <AlertTriangle className="h-6 w-6 text-warning-600" />,
      color: 'bg-warning-50',
    },
    {
      title: 'Near Expiry',
      value: metrics?.nearExpiryCount ?? 0,
      icon: <Clock className="h-6 w-6 text-warning-600" />,
      color: 'bg-warning-50',
    },
    {
      title: 'Expired',
      value: metrics?.expiredCount ?? 0,
      icon: <XCircle className="h-6 w-6 text-danger-600" />,
      color: 'bg-danger-50',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(metrics?.totalInventoryValue ?? 0),
      icon: <DollarSign className="h-6 w-6 text-success-600" />,
      color: 'bg-success-50',
      isCurrency: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Overview of your inventory</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {card.isCurrency ? card.value : formatNumber(Number(card.value))}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <Link
                to="/transactions"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>
            </div>
          }
        >
          <div className="space-y-3">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        tx.type === 'check_in'
                          ? 'bg-success-100 text-success-600'
                          : 'bg-danger-100 text-danger-600'
                      }`}
                    >
                      {tx.type === 'check_in' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.productName}</p>
                      <p className="text-xs text-gray-500">
                        {tx.quantity} {tx.unit} by {tx.userName}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatRelativeTime(tx.timestamp)}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                <History className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                No recent activity
              </div>
            )}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Low Stock Alerts</h2>
              <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700">
                View products
              </Link>
            </div>
          }
        >
          <div className="space-y-3">
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((product: { id: string; name: string; currentStock: number; lowStockThreshold: number }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {product.currentStock} / Threshold: {product.lowStockThreshold}
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">
                    Low
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                No low stock items
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
