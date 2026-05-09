import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastProvider } from '@/components/common/Toast'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { SuppliersPage } from '@/pages/SuppliersPage'
import { CheckInPage } from '@/pages/CheckInPage'
import { CheckOutPage } from '@/pages/CheckOutPage'
import { BatchesPage } from '@/pages/BatchesPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { ExpiryAlertsPage } from '@/pages/ExpiryAlertsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/suppliers/:id" element={<SuppliersPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/check-out" element={<CheckOutPage />} />
          <Route path="/inventory/batches" element={<BatchesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/expiry-alerts" element={<ExpiryAlertsPage />} />
          <Route path="/reports/inventory" element={<ReportsPage />} />
          <Route path="/reports/expiry" element={<ReportsPage />} />
          <Route path="/reports/supplier" element={<ReportsPage />} />
          <Route path="/reports/movement" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AppRoutes />
        </GoogleOAuthProvider>
      ) : (
        <AppRoutes />
      )}
    </QueryClientProvider>
  )
}

export default App
