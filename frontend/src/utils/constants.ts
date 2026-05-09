export const APP_NAME = 'Smart Inventory'

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  SUPPLIERS: '/suppliers',
  SUPPLIER_DETAIL: '/suppliers/:id',
  CHECK_IN: '/check-in',
  CHECK_OUT: '/check-out',
  BATCHES: '/inventory/batches',
  BATCH_DETAIL: '/inventory/batches/:id',
  TRANSACTIONS: '/transactions',
  EXPIRY_ALERTS: '/expiry-alerts',
  REPORTS_INVENTORY: '/reports/inventory',
  REPORTS_EXPIRY: '/reports/expiry',
  REPORTS_SUPPLIER: '/reports/supplier',
  REPORTS_MOVEMENT: '/reports/movement',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.PRODUCTS, label: 'Products', icon: 'Package' },
  { path: ROUTES.SUPPLIERS, label: 'Suppliers', icon: 'Truck' },
  { path: ROUTES.CHECK_IN, label: 'Check-In', icon: 'ArrowDownLeft' },
  { path: ROUTES.CHECK_OUT, label: 'Check-Out', icon: 'ArrowUpRight' },
  { path: ROUTES.BATCHES, label: 'Inventory', icon: 'Warehouse' },
  { path: ROUTES.TRANSACTIONS, label: 'Transactions', icon: 'History' },
  { path: ROUTES.EXPIRY_ALERTS, label: 'Expiry Alerts', icon: 'AlertTriangle' },
  { path: ROUTES.REPORTS_INVENTORY, label: 'Reports', icon: 'BarChart3' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
]

export const DEBOUNCE_DELAY = 300

export const NOTIFICATION_REFRESH_INTERVAL = 30000

export const DASHBOARD_REFRESH_INTERVAL = 30000

export const ACTIVITY_FEED_REFRESH_INTERVAL = 5000

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
