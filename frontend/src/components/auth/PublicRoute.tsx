import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useHydrated } from '@/hooks/useHydrated'
import { Spinner } from '@/components/common/Spinner'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth()
  const hasHydrated = useHydrated()

  // Wait for Zustand persist hydration to complete before deciding auth state
  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
