import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema } from '@/utils/validators'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Package, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import type { z } from 'zod'

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [isSuccess, setIsSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setResetError(null)
    try {
      await authService.resetPassword(data)
      setIsSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Failed to reset password')
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
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the OTP from your email and create a new password
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          {isSuccess ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Password Reset!</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="OTP Code"
                  placeholder="Enter the code from your email"
                  error={errors.otp?.message}
                  {...register('otp')}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat your new password"
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                {resetError && (
                  <div className="flex items-center gap-2 rounded-md bg-danger-50 p-3 text-sm text-danger-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {resetError}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Reset Password
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between text-sm">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-medium text-primary-600 hover:text-primary-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Resend OTP
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
