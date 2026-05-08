# Frontend Task List - Smart Inventory Management System

## Task List for Frontend Implementation

### Phase 1: Project Setup and Foundation (Tasks 1-8)

**Task 1: Project Setup and Infrastructure**
- Initialize React + TypeScript + Vite project
- Configure Tailwind CSS with custom theme
- Install dependencies: React Router, Axios, React Query, Zustand, React Hook Form, Zod
- Setup project structure: components, pages, services, hooks, utils, types
- Configure ESLint and Prettier
- Create Dockerfile for production build

**Task 2: API Client Configuration**
- Create Axios instance with base URL configuration
- Implement request interceptor to attach JWT token from localStorage
- Implement response interceptor to handle 401 errors and redirect to login
- Create API service layer with typed endpoints matching backend API
- Implement error handling utilities for API responses

**Task 3: Authentication State Management**
- Create auth store using Zustand for user state and token management
- Implement login function (POST /api/auth/login)
- Implement logout function (POST /api/auth/logout, clear token)
- Implement token storage in localStorage
- Create ProtectedRoute component for authenticated routes
- Create useAuth hook for accessing auth state

**Task 4: Login Page - Email/Password**
- Create login page UI with email and password inputs
- Implement form validation using React Hook Form + Zod
- Connect login form to auth API (POST /api/auth/login)
- Display error messages for invalid credentials
- Redirect to dashboard on successful login
- Add "Remember me" checkbox for persistent session

**Task 5: Login Page - Google OAuth**
- Install and configure @react-oauth/google
- Add "Sign in with Google" button to login page
- Implement Google OAuth callback handler
- Send Google token to backend (POST /api/auth/google)
- Store JWT token on successful authentication
- Handle OAuth errors with user-friendly messages

**Task 6: Login Page - Telegram OAuth**
- Install and configure Telegram Login Widget
- Add "Sign in with Telegram" button to login page
- Implement Telegram OAuth callback handler
- Verify and send Telegram auth data to backend (POST /api/auth/telegram)
- Store JWT token on successful authentication
- Handle OAuth errors with user-friendly messages

**Task 7: Layout and Navigation**
- Create main layout component with header, sidebar, and content area
- Implement responsive navigation menu (desktop sidebar, mobile hamburger)
- Add navigation links: Dashboard, Products, Suppliers, Check-In, Check-Out, Inventory, Reports, Settings
- Create user menu dropdown with profile and logout options
- Display user name and authentication method in header
- Implement active route highlighting

**Task 8: Notification Bell Component**
- Create notification bell icon in header with unread count badge
- Implement notification panel dropdown
- Fetch notifications from API (GET /api/notifications)
- Display notification type, message, and timestamp
- Mark notifications as read on view (PUT /api/notifications/:id/read)
- Fetch unread count (GET /api/notifications/unread-count)
- Auto-refresh notifications every 30 seconds

### Phase 2: Dashboard (Tasks 9-12)

**Task 9: Dashboard Metrics Cards**
- Create dashboard page layout
- Fetch dashboard metrics from API (GET /api/dashboard/metrics)
- Display metric cards: Total Products, Low Stock Count, Near Expiry Count, Expired Count, Total Inventory Value
- Implement responsive grid layout for metric cards
- Add icons and color coding for each metric type
- Auto-refresh metrics when navigating back to dashboard

**Task 10: Dashboard Activity Feed**
- Create activity feed component showing recent transactions
- Display 10 most recent check-in and check-out transactions
- Show transaction type, product name, quantity, unit, user, and timestamp
- Add link to full transaction history page
- Implement real-time updates (refresh every 5 seconds or on transaction)
- Format timestamps as relative time (e.g., "2 hours ago")

**Task 11: Dashboard Charts**
- Install chart library (recharts or chart.js)
- Create inventory trend chart (quantity changes over 30 days)
- Create category distribution pie/bar chart
- Create expiry analytics chart (batches expiring in next 90 days)
- Create daily activity chart (check-in/check-out volumes)
- Implement responsive chart sizing
- Display "No data available" message when data is empty

**Task 12: Dashboard Low Stock Alerts**
- Fetch low stock products from API (GET /api/dashboard/low-stock)
- Create low stock alert section on dashboard
- Display product name, current quantity, threshold, and shortage amount
- Add visual indicators (red/orange colors)
- Add quick link to product detail or reorder action
- Sort by urgency (lowest quantity first)

### Phase 3: Product Management (Tasks 13-18)

**Task 13: Product List Page**
- Create product list page with table/grid view
- Fetch products from API (GET /api/products?page=1&limit=20)
- Display product name, category, barcode, image thumbnail, stock level
- Implement pagination controls
- Add "Add Product" button to navigate to create form
- Add actions column with edit and delete buttons
- Display low stock indicator badge on products

**Task 14: Product Search and Filters**
- Create search input with debounced API calls (300ms)
- Implement search by name, barcode, or SKU
- Create filter dropdowns for category, stock level, expiry status
- Update API call with search and filter parameters
- Display filtered result count
- Add "Clear filters" button to reset all filters

**Task 15: Product Create/Edit Form**
- Create product form with fields: name, category, barcode, description, base unit, low stock threshold
- Implement form validation (required fields, unique barcode)
- Add image upload with preview (max 5MB, JPEG/PNG/WebP)
- Upload image to API (POST /api/products/:id/image)
- Create product via API (POST /api/products)
- Update product via API (PUT /api/products/:id)
- Display success message and redirect to product list

**Task 16: Product Unit Configuration**
- Add unit configuration section to product form
- Display base unit (conversion rate = 1.0)
- Allow adding multiple units with conversion rates
- Validate conversion rates are positive numbers (up to 4 decimals)
- Display conversion relationship (e.g., "1 Box = 24 Cans")
- Prevent deletion of base unit
- Save units with product creation/update

**Task 17: Product Delete Confirmation**
- Create confirmation dialog component
- Show warning if product has associated batches
- Display product name and impact of deletion
- Implement delete API call (DELETE /api/products/:id)
- Remove product from list on successful deletion
- Display error if deletion fails (e.g., has batches)

**Task 18: Product Detail View**
- Create product detail page showing all product information
- Display product image, name, category, barcode, description
- Show all configured units with conversion rates
- Display current stock level across all batches
- Show batch list for this product
- Add edit and delete action buttons

### Phase 4: Category Management (Tasks 19-20)

**Task 19: Category Management Interface**
- Create category management page in settings
- Fetch categories from API (GET /api/categories)
- Display category list with name, description, product count
- Add "Add Category" button
- Implement create category form (POST /api/categories)
- Implement edit category form (PUT /api/categories/:id)
- Display categories alphabetically

**Task 20: Category Delete with Validation**
- Implement delete category with confirmation dialog
- Check if category has associated products
- Display warning if products exist in category
- Prevent deletion if products assigned (DELETE /api/categories/:id)
- Remove category from list on successful deletion

### Phase 5: Supplier Management (Tasks 21-23)

**Task 21: Supplier List and CRUD**
- Create supplier list page with table view
- Fetch suppliers from API (GET /api/suppliers?page=1&limit=20)
- Display supplier name, contact person, phone, email
- Implement pagination
- Create supplier form with validation (name required, email format)
- Implement create (POST /api/suppliers), update (PUT /api/suppliers/:id), delete (DELETE /api/suppliers/:id)
- Warn before deletion if supplier has batches

**Task 22: Supplier Detail View**
- Create supplier detail page
- Display supplier information (name, contact, phone, email, address)
- Add edit and delete action buttons
- Show inventory history section

**Task 23: Supplier Inventory History**
- Fetch supplier inventory from API (GET /api/suppliers/:id/inventory)
- Display all batches from supplier with product name, batch code, import date, expiry date, quantity
- Calculate and display total value of inventory from supplier
- Add date range filter
- Add product filter
- Implement sorting by date or value

### Phase 6: Barcode Scanner (Tasks 24-25)

**Task 24: Barcode Scanner Component**
- Install barcode scanning library (react-zxing or html5-qrcode)
- Create barcode scanner component with camera interface
- Request camera permission from browser
- Implement barcode detection and decoding (< 1 second)
- Display scanned barcode value
- Add manual barcode entry input as fallback
- Optimize for mobile devices

**Task 25: Barcode Product Lookup**
- Implement product lookup by barcode (GET /api/products/barcode/:barcode)
- Display product information when barcode found
- Show "Product not found" message if no match
- Add "Create new product" option when not found
- Integrate scanner into check-in and check-out flows

### Phase 7: Inventory Operations (Tasks 26-30)

**Task 26: Check-In Page**
- Create check-in page with barcode scanner integration
- Scan or manually enter product barcode
- Display product information after lookup
- Create check-in form: supplier dropdown, unit dropdown, quantity, expiry date, unit cost
- Populate unit dropdown from product configuration
- Validate all required fields and expiry > today
- Calculate quantity in base unit using conversion rate
- Submit check-in to API (POST /api/inventory/check-in)
- Display success message with batch code
- Reset form for next check-in

**Task 27: Check-Out Page**
- Create check-out page with barcode scanner integration
- Scan or manually enter product barcode
- Display product information and available quantity
- Create check-out form: unit dropdown, quantity
- Validate quantity does not exceed available stock
- Calculate quantity in base unit using conversion rate
- Submit check-out to API (POST /api/inventory/check-out)
- Display success message with FIFO deduction details
- Show error if insufficient stock

**Task 28: FIFO Deduction Display**
- Create component to display batch deductions after check-out
- Show list of batches deducted (ordered by import date)
- Display quantity deducted from each batch
- Display remaining quantity for each batch
- Highlight batches that are fully depleted
- Show total quantity deducted

**Task 29: Batch List View**
- Create batch inventory page
- Fetch batches from API (GET /api/batches)
- Display batch code, product name, supplier, import date, expiry date, remaining quantity
- Add filters: product, supplier, expiry status
- Implement sorting by any column
- Add visual indicators for near-expiry and expired batches
- Implement pagination

**Task 30: Batch Detail and Adjustment**
- Create batch detail page
- Display all batch information
- Show transaction history for this batch
- Add "Adjust Quantity" button
- Create adjustment form: adjustment amount (+/-), reason (required)
- Display current and new quantity before confirmation
- Submit adjustment to API (POST /api/inventory/adjustment)
- Update displayed quantity on success
- Record adjustment in transaction history

### Phase 8: Transaction History (Tasks 31-32)

**Task 31: Transaction History Page**
- Create transaction history page
- Fetch transactions from API (GET /api/transactions?page=1&limit=50)
- Display transaction type, product name, quantity, unit, user, timestamp
- Implement pagination (50 per page)
- Add filters: date range, product, transaction type, user
- Implement column sorting
- Display in reverse chronological order

**Task 32: Transaction Export**
- Add export button to transaction history
- Implement CSV export functionality
- Fetch export data from API (GET /api/transactions with all filters)
- Generate CSV file client-side or download from API
- Trigger file download to user's device
- Include all visible columns in export

### Phase 9: Expiry Management (Tasks 33-35)

**Task 33: Near Expiry Alerts**
- Create near expiry alerts page
- Fetch near-expiry batches from API (filter by expiry date)
- Display batch code, product name, expiry date, days until expiry, quantity
- Sort by expiry date (soonest first)
- Add visual urgency indicators (red < 7 days, orange < 30 days)
- Display count on dashboard
- Allow configuring Near_Expiry_Days threshold

**Task 34: Expired Products View**
- Create expired products page
- Fetch expired batches from API (expiry date < today)
- Display batch code, product name, expiry date, days since expiry, quantity
- Add action buttons: mark as disposed, adjust quantity
- Display count on dashboard
- Add filter to show/hide disposed batches

**Task 35: Expiry Report**
- Create expiry report page
- Add date range selector
- Fetch expiry report from API (GET /api/reports/expiry?from=&to=&format=json)
- Display batches grouped by status: expired, <7d, <30d, <90d
- Show batch code, product, supplier, quantity, expiry date for each
- Calculate total value by status group
- Add export to CSV/PDF button

### Phase 10: Reports (Tasks 36-38)

**Task 36: Inventory Summary Report**
- Create inventory summary report page
- Fetch inventory report from API (GET /api/reports/inventory?format=json)
- Display product name, category, total quantity, unit, value
- Group products by category with subtotals
- Calculate and display total inventory value
- Add category filter
- Add export to CSV/Excel button

**Task 37: Supplier Performance Report**
- Create supplier report page
- Add date range selector
- Fetch supplier report from API (GET /api/reports/supplier?from=&to=&format=json)
- Display supplier name, total batches, total quantity, total value
- Calculate percentage of total inventory per supplier
- Sort by total value (highest first)
- Allow drill-down to individual batches
- Add export button

**Task 38: Stock Movement Report**
- Create stock movement report page
- Add date range selector
- Fetch transaction data grouped by product
- Display product name, check-in quantity, check-out quantity, net change
- Calculate totals across all products
- Highlight products with highest turnover
- Show products with no movement
- Add export button

### Phase 11: Settings and Configuration (Tasks 39-41)

**Task 39: Settings Page**
- Create settings page with tabbed interface
- Add General Settings tab: Near_Expiry_Days, default Low_Stock_Threshold
- Add Notification Preferences tab: enable/disable notification types
- Add Telegram Integration tab: bot token, chat ID, enable/disable
- Fetch current settings from API (GET /api/settings)
- Implement save settings (PUT /api/settings)
- Validate all inputs before submission
- Display success message on save

**Task 40: User Profile Page**
- Create user profile page
- Fetch user profile from API (GET /api/auth/profile)
- Display user name, email, authentication method (email/Google/Telegram)
- Add edit form for name and email
- Add change password form (current password, new password, confirm)
- Validate password match
- Submit profile update to API
- Display success message

**Task 41: Telegram Notification Test**
- Add "Send Test Notification" button in Telegram settings
- Validate bot token and chat ID are configured
- Send test notification request to API
- Display success or error message
- Show sample notification format

### Phase 12: UI/UX Enhancements (Tasks 42-47)

**Task 42: Loading States and Skeletons**
- Create loading spinner component
- Create skeleton loaders for tables, cards, and forms
- Implement loading states for all API calls
- Display "This is taking longer than expected" after 10 seconds
- Add loading overlay for form submissions

**Task 43: Error Handling and Feedback**
- Create toast notification component for success/error messages
- Implement global error boundary
- Display user-friendly error messages for API errors
- Show network error with retry button
- Display field-specific validation errors
- Auto-dismiss success messages after 3 seconds

**Task 44: Mobile Responsive Design**
- Ensure all pages work on screens 320px and wider
- Implement mobile navigation (hamburger menu)
- Make all tables scrollable or stack on mobile
- Optimize forms for touch input
- Ensure buttons are touch-friendly (min 44x44px)
- Test barcode scanner on mobile devices
- Optimize image display for mobile

**Task 45: Keyboard Navigation and Shortcuts**
- Implement Tab navigation through all interactive elements
- Add Enter key to submit forms
- Add Escape key to close modals
- Implement keyboard shortcuts: Ctrl+K (search), Ctrl+I (check-in), Ctrl+O (check-out), Ctrl+? (help)
- Create help dialog showing all shortcuts
- Add visible focus indicators

**Task 46: Accessibility Compliance**
- Add alt text to all images
- Use semantic HTML elements
- Add labels to all form inputs
- Ensure color contrast ratio ≥ 4.5:1
- Add ARIA labels to icon buttons
- Test with screen reader
- Ensure keyboard-only navigation works

**Task 47: Offline Indicator**
- Detect network connectivity status
- Display offline banner when connection lost
- Disable API-dependent actions while offline
- Remove banner when connection restored
- Retry failed requests on reconnection
- Show cached data when available offline

### Phase 13: Performance and Optimization (Tasks 48-50)

**Task 48: Performance Optimization**
- Implement code splitting with React.lazy
- Add lazy loading for images
- Implement React Query for API caching
- Optimize bundle size (analyze with webpack-bundle-analyzer)
- Implement pagination for large lists
- Debounce search inputs (300ms)
- Memoize expensive computations

**Task 49: Image Optimization**
- Implement image compression before upload
- Add image preview before upload
- Display placeholder images for missing product images
- Lazy load images in product lists
- Optimize image sizes for different screen sizes

**Task 50: Production Build and Docker**
- Configure Vite for production build
- Optimize build output (minification, tree shaking)
- Create production Dockerfile (multi-stage build)
- Copy build output to Nginx-compatible directory
- Test production build locally
- Verify all environment variables work in production

### Phase 14: Testing and Documentation (Tasks 51-52)

**Task 51: Component Testing**
- Setup Vitest and React Testing Library
- Write unit tests for utility functions
- Write component tests for forms and validation
- Write integration tests for API service layer
- Test authentication flows
- Test FIFO calculation display
- Achieve >80% code coverage

**Task 52: Documentation**
- Create README.md with setup instructions
- Document environment variables
- Document API integration points
- Create user guide for key features
- Document component architecture
- Add inline code comments for complex logic
- Create deployment guide

---

**Total Tasks: 52**

**Estimated Timeline:**
- Phase 1-2: 1-2 weeks (Foundation)
- Phase 3-5: 2-3 weeks (Core Features)
- Phase 6-8: 2 weeks (Operations)
- Phase 9-10: 1-2 weeks (Reports)
- Phase 11-13: 1-2 weeks (Settings & Polish)
- Phase 14: 1 week (Testing & Docs)

**Total: 8-12 weeks**
