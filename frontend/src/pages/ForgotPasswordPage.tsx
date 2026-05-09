import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '@/utils/validators'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Package, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import type { z } from 'zod'

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSendError(null)
    try {
      await authService.forgotPassword(data)
      setIsSent(true)
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Failed to send reset email')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you an OTP to reset your password
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          {isSent ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">OTP Sent!</h3>
              <p className="mt-2 text-sm text-gray-600">
                Check your email for the OTP code. Then return to{' '}
                <Link to="/reset-password" className="font-medium text-primary-600 hover:text-primary-500">
                  reset your password
                </Link>
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                {sendError && (
                  <div className="flex items-center gap-2 rounded-md bg-danger-50 p-3 text-sm text-danger-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {sendError}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Send OTP
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
