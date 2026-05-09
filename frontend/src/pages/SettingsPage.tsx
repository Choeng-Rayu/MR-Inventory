import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsSchema, categorySchema } from '@/utils/validators'
import { settingsService } from '@/services/settings.service'
import { productService } from '@/services/product.service'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { Modal } from '@/components/common/Modal'
import toast from 'react-hot-toast'
import { Settings, Bell, Send, Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { useState } from 'react'
import type { z } from 'zod'
import type { Category } from '@/types/product.types'

type SettingsFormData = z.infer<typeof settingsSchema>
type CategoryFormData = z.infer<typeof categorySchema>

export function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'telegram' | 'categories'>('general')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      nearExpiryDays: settingsData?.nearExpiryDays ?? 30,
      defaultLowStockThreshold: settingsData?.defaultLowStockThreshold ?? 10,
      telegramEnabled: settingsData?.telegramEnabled ?? false,
      telegramBotToken: settingsData?.telegramBotToken ?? '',
      telegramChatId: settingsData?.telegramChatId ?? '',
      notificationPreferences: {
        lowStock: settingsData?.notificationPreferences?.lowStock ?? true,
        nearExpiry: settingsData?.notificationPreferences?.nearExpiry ?? true,
        expired: settingsData?.notificationPreferences?.expired ?? true,
      },
    },
  })

  const telegramEnabled = watch('telegramEnabled')

  const updateSettings = useMutation({
    mutationFn: (data: Partial<SettingsFormData>) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onSubmit = (data: SettingsFormData) => {
    updateSettings.mutate(data)
  }

  const testNotification = useMutation({
    mutationFn: () => settingsService.sendTestNotification(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const {
    register: registerCat,
    handleSubmit: handleSubmitCat,
    reset: resetCat,
    setValue: setValueCat,
    formState: { errors: catErrors, isSubmitting: isCatSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  const createCategory = useMutation({
    mutationFn: (data: CategoryFormData) => productService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created')
      setEditingCategory(null)
      resetCat()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateCategory = useMutation({
    mutationFn: (data: CategoryFormData) =>
      productService.updateCategory(editingCategory!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated')
      setEditingCategory(null)
      resetCat()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteCategory = useMutation({
    mutationFn: (id: string) => productService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory?.id === 'new') {
      createCategory.mutate(data)
    } else {
      updateCategory.mutate(data)
    }
  }

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setValueCat('name', category.name)
      setValueCat('description', category.description || '')
    } else {
      setEditingCategory({ id: 'new' } as Category)
      resetCat()
    }
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: <Settings className="h-4 w-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'telegram' as const, label: 'Telegram', icon: <Send className="h-4 w-4" /> },
    { id: 'categories' as const, label: 'Categories', icon: <Tag className="h-4 w-4" /> },
  ]

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Configure application settings</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <Card className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
            <Input
              label="Near Expiry Days"
              type="number"
              min={1}
              max={365}
              error={errors.nearExpiryDays?.message}
              {...register('nearExpiryDays', { valueAsNumber: true })}
            />
            <Input
              label="Default Low Stock Threshold"
              type="number"
              min={0}
              error={errors.defaultLowStockThreshold?.message}
              {...register('defaultLowStockThreshold', { valueAsNumber: true })}
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting || updateSettings.isPending}>
                Save Settings
              </Button>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('notificationPreferences.lowStock')}
                />
                <span className="text-sm text-gray-700">Low stock alerts</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('notificationPreferences.nearExpiry')}
                />
                <span className="text-sm text-gray-700">Near expiry alerts</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('notificationPreferences.expired')}
                />
                <span className="text-sm text-gray-700">Expired product alerts</span>
              </label>
            </div>
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting || updateSettings.isPending}>
                Save Settings
              </Button>
            </div>
          </Card>
        )}

        {/* Telegram Settings */}
        {activeTab === 'telegram' && (
          <Card className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Telegram Integration</h2>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('telegramEnabled')}
              />
              <span className="text-sm text-gray-700">Enable Telegram notifications</span>
            </label>
            {telegramEnabled && (
              <>
                <Input
                  label="Bot Token"
                  type="password"
                  placeholder="Enter your Telegram bot token"
                  {...register('telegramBotToken')}
                />
                <Input
                  label="Chat ID"
                  placeholder="Enter your Telegram chat ID"
                  {...register('telegramChatId')}
                />
              </>
            )}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                leftIcon={<Send className="h-4 w-4" />}
                isLoading={testNotification.isPending}
                onClick={() => testNotification.mutate()}
              >
                Test Notification
              </Button>
              <Button type="submit" isLoading={isSubmitting || updateSettings.isPending}>
                Save Settings
              </Button>
            </div>
          </Card>
        )}
      </form>

      {/* Categories */}
      {activeTab === 'categories' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Categories</h2>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => openCategoryModal()}>
              Add Category
            </Button>
          </div>
          <div className="space-y-2">
            {categories?.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-gray-500">{category.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openCategoryModal(category)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory.mutate(category.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title={editingCategory?.id === 'new' ? 'Add Category' : 'Edit Category'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="category-form"
              isLoading={isCatSubmitting || createCategory.isPending || updateCategory.isPending}
            >
              Save
            </Button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmitCat(onCategorySubmit)} className="space-y-4">
          <Input label="Name" error={catErrors.name?.message} {...registerCat('name')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              {...registerCat('description')}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
