import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils/helpers'
import { NAV_ITEMS } from '@/utils/constants'
import {
  LayoutDashboard,
  Package,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  Warehouse,
  History,
  AlertTriangle,
  BarChart3,
  Settings,
} from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
  Truck: <Truck className="h-5 w-5" />,
  ArrowDownLeft: <ArrowDownLeft className="h-5 w-5" />,
  ArrowUpRight: <ArrowUpRight className="h-5 w-5" />,
  Warehouse: <Warehouse className="h-5 w-5" />,
  History: <History className="h-5 w-5" />,
  AlertTriangle: <AlertTriangle className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-gray-200 px-6">
            <span className="text-xl font-bold text-primary-600">Smart Inventory</span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {iconMap[item.icon]}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
            <p> Smart Inventory</p>
          </div>
        </div>
      </aside>
    </>
  )
}
