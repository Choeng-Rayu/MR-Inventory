import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema } from '@/utils/validators'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import toast from 'react-hot-toast'
import { User, Mail, Shield, Key } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  })

  const changePassword = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed')
      reset()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onPasswordSubmit = (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    changePassword.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your account</p>
      </div>

      {/* User Info */}
      <Card className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">{user?.name}</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">{user?.email}</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Auth Method</label>
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm capitalize text-gray-900">{user?.authMethod}</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm capitalize text-gray-900">{user?.role}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      {user?.authMethod === 'email' && (
        <Card className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              label="New Password"
              type="password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirm Password"
              type="password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                leftIcon={<Key className="h-4 w-4" />}
                isLoading={isSubmitting || changePassword.isPending}
              >
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
