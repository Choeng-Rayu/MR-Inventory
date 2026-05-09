import { useNavigate, Link } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { TelegramLoginButton } from '@/components/auth/TelegramLoginButton'
import { Package } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Smart Inventory
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your inventory
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          <LoginForm onSuccess={() => navigate('/dashboard')} />

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </Link>
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Create an account
            </Link>
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or login / register with</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <GoogleLoginButton onSuccess={() => navigate('/dashboard')} />
            <TelegramLoginButton onSuccess={() => navigate('/dashboard')} />
          </div>
        </div>
      </div>
    </div>
  )
}
