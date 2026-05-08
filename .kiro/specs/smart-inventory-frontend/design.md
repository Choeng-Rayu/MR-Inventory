# Design Document: Smart Inventory Management System Frontend

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (User Device)                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           React Application (SPA)                          │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Presentation Layer (Pages & Components)             │ │ │
│  │  │  - Dashboard, Products, Suppliers, Check-In/Out      │ │ │
│  │  │  - Inventory, Reports, Settings, Profile             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  State Management Layer                              │ │ │
│  │  │  - Auth Store (Zustand)                              │ │ │
│  │  │  - API Cache (React Query)                           │ │ │
│  │  │  - Form State (React Hook Form)                      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Service Layer                                       │ │ │
│  │  │  - API Client (Axios)                                │ │ │
│  │  │  - Barcode Scanner                                   │ │ │
│  │  │  - File Export                                       │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTPS/REST
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                         │
│  - Serves React static files                                    │
│  - Proxies /api/* to Backend                                    │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (NestJS)                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Deployment Architecture

**Single Docker Host Setup:**
- Frontend built as static files served by Nginx
- All API requests proxied through Nginx to backend
- Same-origin policy (no CORS issues)
- JWT token stored in browser localStorage
- Mobile-responsive design for all screen sizes

## 2. Technology Stack

### 2.1 Core Framework
- **React 18.x**: UI library with hooks and concurrent features
- **TypeScript 5.x**: Type-safe development
- **Vite 5.x**: Fast build tool and dev server

### 2.2 UI Framework
- **Tailwind CSS 3.x**: Utility-first CSS framework
- **Headless UI**: Unstyled accessible components
- **Heroicons**: Icon library
- **Recharts**: Chart library for analytics

### 2.3 State Management
- **Zustand**: Lightweight state management for auth
- **React Query (TanStack Query)**: Server state management and caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### 2.4 Routing
- **React Router v6**: Client-side routing

### 2.5 HTTP Client
- **Axios**: HTTP client with interceptors

### 2.6 Barcode Scanning
- **react-zxing** or **html5-qrcode**: Camera-based barcode scanning

### 2.7 OAuth Integration
- **@react-oauth/google**: Google OAuth integration
- **Telegram Login Widget**: Telegram OAuth integration

### 2.8 Utilities
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **react-hot-toast**: Toast notifications

### 2.9 Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Unit testing
- **React Testing Library**: Component testing

## 3. Application Structure

### 3.1 Directory Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   └── TelegramLoginButton.tsx
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── InventoryChart.tsx
│   │   │   └── LowStockAlert.tsx
│   │   ├── products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── UnitConfig.tsx
│   │   │   └── ProductFilters.tsx
│   │   ├── suppliers/
│   │   │   ├── SupplierList.tsx
│   │   │   ├── SupplierForm.tsx
│   │   │   └── SupplierHistory.tsx
│   │   ├── inventory/
│   │   │   ├── BarcodeScanner.tsx
│   │   │   ├── CheckInForm.tsx
│   │   │   ├── CheckOutForm.tsx
│   │   │   ├── BatchList.tsx
│   │   │   ├── FIFODisplay.tsx
│   │   │   └── AdjustmentForm.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── NotificationPanel.tsx
│   │   └── reports/
│   │       ├── InventoryReport.tsx
│   │       ├── ExpiryReport.tsx
│   │       └── SupplierReport.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── SuppliersPage.tsx
│   │   ├── CheckInPage.tsx
│   │   ├── CheckOutPage.tsx
│   │   ├── BatchesPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── ExpiryAlertsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ProfilePage.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── supplier.service.ts
│   │   ├── inventory.service.ts
│   │   ├── notification.service.ts
│   │   ├── report.service.ts
│   │   └── settings.service.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useSuppliers.ts
│   │   ├── useInventory.ts
│   │   ├── useNotifications.ts
│   │   └── useBarcodeScanner.ts
│   ├── store/
│   │   └── authStore.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── product.types.ts
│   │   ├── supplier.types.ts
│   │   ├── inventory.types.ts
│   │   ├── notification.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .env.example
```

## 4. Component Design

### 4.1 Authentication Components

#### LoginForm
- Email and password inputs with validation
- Submit button with loading state
- Error message display
- "Remember me" checkbox
- Links to OAuth options

#### GoogleLoginButton
- Google sign-in button with branding
- Handles OAuth flow with @react-oauth/google
- Sends token to backend API
- Displays loading and error states

#### TelegramLoginButton
- Telegram login widget integration
- Handles OAuth callback
- Sends auth data to backend API
- Displays loading and error states

### 4.2 Layout Components

#### Layout
- Main container with header, sidebar, and content area
- Responsive breakpoints (mobile < 768px, tablet < 1024px, desktop >= 1024px)
- Protected route wrapper

#### Header
- Logo and app title
- Search bar (global search)
- Notification bell with badge
- User menu dropdown (profile, settings, logout)

#### Sidebar
- Navigation menu with icons
- Active route highlighting
- Collapsible on mobile
- Links: Dashboard, Products, Suppliers, Check-In, Check-Out, Inventory, Reports, Settings

#### MobileNav
- Hamburger menu button
- Slide-out navigation drawer
- Overlay backdrop

### 4.3 Dashboard Components

#### MetricCard
- Icon, title, value, and trend indicator
- Color-coded by metric type
- Click to navigate to detail view
- Responsive sizing

#### ActivityFeed
- List of recent transactions
- Transaction type icon and color
- Product name, quantity, user, timestamp
- "View all" link

#### InventoryChart
- Line chart for inventory trends
- Bar chart for category distribution
- Area chart for expiry analytics
- Responsive and interactive

#### LowStockAlert
- List of low stock products
- Product name, current quantity, threshold
- Visual urgency indicator
- Quick action buttons

### 4.4 Product Components

#### ProductList
- Table view with columns: image, name, category, barcode, stock, actions
- Grid view option for mobile
- Pagination controls
- Search and filter integration

#### ProductForm
- Form fields: name, category, barcode, description, base unit, threshold
- Image upload with preview
- Unit configuration section
- Validation with error messages
- Submit and cancel buttons

#### ProductCard
- Product image
- Name, category, barcode
- Stock level with visual indicator
- Quick actions (edit, delete, view)

#### UnitConfig
- List of units with conversion rates
- Add unit button
- Edit/delete unit actions
- Conversion relationship display

#### ProductFilters
- Search input
- Category dropdown
- Stock level filter (all, low, out of stock)
- Expiry status filter
- Clear filters button

### 4.5 Supplier Components

#### SupplierList
- Table with columns: name, contact, phone, email, actions
- Pagination
- Add supplier button

#### SupplierForm
- Form fields: name, contact person, phone, email, address
- Validation
- Submit and cancel buttons

#### SupplierHistory
- List of batches from supplier
- Filters: date range, product
- Total value calculation
- Export button

### 4.6 Inventory Components

#### BarcodeScanner
- Camera view with scanning overlay
- Barcode detection indicator
- Manual entry fallback
- Close button
- Mobile-optimized

#### CheckInForm
- Product display (from barcode scan)
- Supplier dropdown
- Unit dropdown (from product config)
- Quantity input
- Expiry date picker
- Unit cost input
- Submit button with loading state

#### CheckOutForm
- Product display (from barcode scan)
- Available quantity display
- Unit dropdown
- Quantity input with validation
- Submit button with loading state

#### BatchList
- Table with columns: batch code, product, supplier, import date, expiry date, quantity, status
- Filters: product, supplier, expiry status
- Sorting
- Visual indicators for near-expiry and expired

#### FIFODisplay
- List of batches being deducted
- Batch code, import date, quantity deducted, remaining
- Highlight depleted batches
- Total deducted summary

#### AdjustmentForm
- Current quantity display
- Adjustment amount input (+/-)
- Reason textarea (required)
- New quantity preview
- Confirm button

### 4.7 Notification Components

#### NotificationBell
- Bell icon with unread count badge
- Click to open panel
- Animated badge on new notifications

#### NotificationPanel
- Dropdown panel
- List of notifications with type icons
- Mark as read on view
- "View all" link
- Empty state message

### 4.8 Report Components

#### InventoryReport
- Date range selector
- Category filter
- Table with product details
- Total value summary
- Export button (CSV/PDF)

#### ExpiryReport
- Date range selector
- Status filter (near expiry, expired)
- Grouped by expiry status
- Total value by group
- Export button

#### SupplierReport
- Date range selector
- Table with supplier performance metrics
- Drill-down to batches
- Export button

### 4.9 Common Components

#### Button
- Variants: primary, secondary, danger, ghost
- Sizes: sm, md, lg
- Loading state with spinner
- Disabled state
- Icon support

#### Input
- Text, number, email, password, date types
- Label and error message
- Validation state styling
- Icon support

#### Modal
- Overlay backdrop
- Close button
- Header, body, footer sections
- Responsive sizing
- Keyboard navigation (Escape to close)

#### Table
- Sortable columns
- Pagination
- Loading skeleton
- Empty state
- Mobile-responsive (horizontal scroll or stacked)

#### Card
- Container with padding and shadow
- Header and body sections
- Hover effects

#### Badge
- Color variants (success, warning, danger, info)
- Sizes (sm, md, lg)
- Rounded or square

#### Spinner
- Loading indicator
- Sizes (sm, md, lg)
- Color variants

#### Toast
- Success, error, warning, info types
- Auto-dismiss after 3 seconds
- Close button
- Position: top-right

## 5. State Management Design

### 5.1 Auth Store (Zustand)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  loginWithTelegram: (authData: TelegramAuthData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

**Responsibilities:**
- Store user and token
- Persist token to localStorage
- Provide login/logout functions
- Handle token refresh

### 5.2 React Query Cache

**Query Keys:**
- `['products', filters]`: Product list
- `['product', id]`: Product detail
- `['suppliers', filters]`: Supplier list
- `['batches', filters]`: Batch list
- `['transactions', filters]`: Transaction history
- `['notifications']`: Notifications
- `['dashboard-metrics']`: Dashboard metrics
- `['low-stock']`: Low stock products

**Mutations:**
- `createProduct`, `updateProduct`, `deleteProduct`
- `createSupplier`, `updateSupplier`, `deleteSupplier`
- `checkIn`, `checkOut`, `adjustBatch`
- `markNotificationRead`

**Cache Invalidation:**
- Invalidate related queries after mutations
- Auto-refetch on window focus
- Stale time: 5 minutes for most queries, 30 seconds for dashboard

### 5.3 Form State (React Hook Form)

- Form validation with Zod schemas
- Field-level error messages
- Dirty state tracking
- Submit handling with loading states

## 6. API Integration Design

### 6.1 Axios Configuration

```typescript
// Base configuration
const api = axios.create({
  baseURL: '/api', // Proxied by Nginx
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 6.2 API Service Layer

**auth.service.ts**
- `login(email, password)`: POST /api/auth/login
- `loginWithGoogle(token)`: POST /api/auth/google
- `loginWithTelegram(authData)`: POST /api/auth/telegram
- `logout()`: POST /api/auth/logout
- `getProfile()`: GET /api/auth/profile

**product.service.ts**
- `getProducts(params)`: GET /api/products
- `getProduct(id)`: GET /api/products/:id
- `getProductByBarcode(barcode)`: GET /api/products/barcode/:barcode
- `createProduct(data)`: POST /api/products
- `updateProduct(id, data)`: PUT /api/products/:id
- `deleteProduct(id)`: DELETE /api/products/:id
- `uploadImage(id, file)`: POST /api/products/:id/image

**supplier.service.ts**
- `getSuppliers(params)`: GET /api/suppliers
- `getSupplier(id)`: GET /api/suppliers/:id
- `getSupplierInventory(id, params)`: GET /api/suppliers/:id/inventory
- `createSupplier(data)`: POST /api/suppliers
- `updateSupplier(id, data)`: PUT /api/suppliers/:id
- `deleteSupplier(id)`: DELETE /api/suppliers/:id

**inventory.service.ts**
- `getBatches(params)`: GET /api/batches
- `getBatch(id)`: GET /api/batches/:id
- `checkIn(data)`: POST /api/inventory/check-in
- `checkOut(data)`: POST /api/inventory/check-out
- `adjustBatch(data)`: POST /api/inventory/adjust

**notification.service.ts**
- `getNotifications(params)`: GET /api/notifications
- `markAsRead(id)`: PUT /api/notifications/:id/read
- `getUnreadCount()`: GET /api/notifications/unread-count

**report.service.ts**
- `getInventoryReport(params)`: GET /api/reports/inventory
- `getExpiryReport(params)`: GET /api/reports/expiry
- `getSupplierReport(params)`: GET /api/reports/supplier

**settings.service.ts**
- `getSettings()`: GET /api/settings
- `updateSettings(data)`: PUT /api/settings

## 7. Routing Design

### 7.1 Route Structure

```typescript
// Public routes
/login

// Protected routes (require authentication)
/dashboard
/products
/products/:id
/suppliers
/suppliers/:id
/check-in
/check-out
/inventory/batches
/inventory/batches/:id
/transactions
/expiry-alerts
/reports/inventory
/reports/expiry
/reports/supplier
/settings
/profile
```

### 7.2 Route Guards

**ProtectedRoute Component:**
- Check if user is authenticated
- Redirect to /login if not authenticated
- Render children if authenticated

**Public Route:**
- Redirect to /dashboard if already authenticated

## 8. Responsive Design Strategy

### 8.1 Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1023px */
/* Desktop: >= 1024px */
```

### 8.2 Mobile Adaptations

**Navigation:**
- Desktop: Sidebar always visible
- Mobile: Hamburger menu with slide-out drawer

**Tables:**
- Desktop: Full table view
- Mobile: Horizontal scroll or stacked cards

**Forms:**
- Desktop: Multi-column layout
- Mobile: Single column, full width

**Modals:**
- Desktop: Centered with max-width
- Mobile: Full screen or bottom sheet

**Touch Targets:**
- Minimum 44x44px for all interactive elements

## 9. Barcode Scanner Integration

### 9.1 Scanner Implementation

**Library:** react-zxing or html5-qrcode

**Features:**
- Camera access with permission request
- Real-time barcode detection
- Support for multiple formats (EAN-13, UPC-A, Code-128, QR)
- Manual entry fallback
- Torch/flashlight control (if available)

**User Flow:**
1. User clicks "Scan Barcode" button
2. Camera permission requested
3. Camera view opens with scanning overlay
4. Barcode detected and decoded
5. Product lookup performed
6. Scanner closes, product info displayed

### 9.2 Mobile Optimization

- Use rear camera by default
- Optimize for various lighting conditions
- Provide visual feedback on scan success
- Handle camera errors gracefully

## 10. Performance Optimization

### 10.1 Code Splitting

- Route-based code splitting with React.lazy
- Component-level splitting for heavy components (charts, scanner)
- Vendor bundle separation

### 10.2 Image Optimization

- Lazy loading with Intersection Observer
- Responsive images with srcset
- WebP format with fallback
- Placeholder images

### 10.3 API Optimization

- React Query caching (5-minute stale time)
- Debounced search inputs (300ms)
- Pagination for large lists
- Optimistic updates for mutations

### 10.4 Bundle Optimization

- Tree shaking
- Minification
- Gzip compression (handled by Nginx)
- CSS purging with Tailwind

## 11. Accessibility Design

### 11.1 WCAG 2.1 AA Compliance

**Keyboard Navigation:**
- Tab order follows logical flow
- Focus indicators visible
- Keyboard shortcuts documented

**Screen Reader Support:**
- Semantic HTML elements
- ARIA labels for icon buttons
- Alt text for images
- Form labels associated with inputs

**Color Contrast:**
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Color not sole indicator of meaning

**Focus Management:**
- Focus trapped in modals
- Focus returned after modal close
- Skip to main content link

## 12. Error Handling Strategy

### 12.1 Error Types

**Network Errors:**
- Display: "Connection error. Please check your internet."
- Action: Retry button

**API Errors:**
- 400: Display field-specific validation errors
- 401: Redirect to login
- 403: Display "Access denied" message
- 404: Display "Resource not found"
- 500: Display "Server error. Please try again."

**Validation Errors:**
- Display inline below form fields
- Highlight invalid fields
- Prevent form submission

### 12.2 Error Boundaries

- Global error boundary for uncaught errors
- Component-level boundaries for isolated failures
- Fallback UI with error message and reload button

### 12.3 Toast Notifications

- Success: Green with checkmark icon (3s auto-dismiss)
- Error: Red with X icon (manual dismiss)
- Warning: Yellow with warning icon (5s auto-dismiss)
- Info: Blue with info icon (3s auto-dismiss)

## 13. Security Considerations

### 13.1 Authentication

- JWT token stored in localStorage (XSS risk mitigated by CSP)
- Token included in Authorization header
- Automatic logout on 401 response
- No sensitive data in token payload

### 13.2 Input Validation

- Client-side validation with Zod
- Sanitize user inputs
- Prevent XSS with React's built-in escaping
- Validate file uploads (type, size)

### 13.3 HTTPS

- All communication over HTTPS (enforced by Nginx)
- Secure cookies for session management (if used)

## 14. Testing Strategy

### 14.1 Unit Tests

- Utility functions (formatters, validators)
- Custom hooks
- State management (auth store)

### 14.2 Component Tests

- Form validation
- Button interactions
- Modal open/close
- Table sorting and pagination

### 14.3 Integration Tests

- API service layer
- Authentication flows
- CRUD operations

### 14.4 E2E Tests (Optional)

- Complete user flows (login → check-in → check-out)
- Critical paths

## 15. Build and Deployment

### 15.1 Development Build

```bash
npm run dev
# Vite dev server on port 5173
# Hot module replacement
# Source maps enabled
```

### 15.2 Production Build

```bash
npm run build
# Output to dist/
# Minified and optimized
# Source maps disabled
```

### 15.3 Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 15.4 Environment Variables

```env
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=<google_client_id>
VITE_TELEGRAM_BOT_NAME=<telegram_bot_name>
```

## 16. User Experience Enhancements

### 16.1 Loading States

- Skeleton loaders for content
- Spinner for buttons during submission
- Progress indicators for file uploads
- "Taking longer than expected" message after 10s

### 16.2 Empty States

- Friendly messages for empty lists
- Call-to-action buttons
- Illustrations or icons

### 16.3 Confirmation Dialogs

- Delete confirmations with impact warning
- Unsaved changes warning on navigation
- Batch operation confirmations

### 16.4 Keyboard Shortcuts

- `Ctrl+K`: Global search
- `Ctrl+I`: Check-in page
- `Ctrl+O`: Check-out page
- `Ctrl+?`: Help dialog
- `Escape`: Close modals

### 16.5 Offline Support

- Detect offline status
- Display offline banner
- Disable API-dependent actions
- Show cached data when available
- Retry failed requests on reconnection

## 17. Internationalization (Future)

- i18n library integration (react-i18next)
- Language selector in settings
- Date/time formatting based on locale
- Currency formatting

## 18. Analytics (Future)

- User behavior tracking
- Error tracking (Sentry)
- Performance monitoring
- Feature usage metrics

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-09  
**Status:** Ready for Implementation
