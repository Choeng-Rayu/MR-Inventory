import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/utils/validators'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import type { z } from 'zod'

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, error, clearError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    try {
      await login(data.email, data.password, data.rememberMe)
      onSuccess()
    } catch {
      // Error handled by store
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          {...register('rememberMe')}
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
          Remember me
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-danger-50 p-3 text-sm text-danger-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full">
        Sign In
      </Button>
    </form>
  )
}
