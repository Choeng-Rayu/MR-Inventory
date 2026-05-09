import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Full name is required').max(255, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(4, 'OTP is required').max(10, 'Invalid OTP'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  description: z.string().optional(),
  lowStockThreshold: z.number().min(0, 'Threshold must be non-negative'),
  baseUnit: z.string().min(1, 'Base unit is required'),
  units: z
    .array(
      z.object({
        name: z.string().min(1, 'Unit name is required'),
        conversionRate: z.number().positive('Conversion rate must be positive'),
      })
    )
    .optional(),
})

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
})

export const checkInSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  expiryDate: z.string().refine((val) => {
    const date = new Date(val)
    return date > new Date()
  }, 'Expiry date must be in the future'),
  unitCost: z.number().positive('Unit cost must be positive'),
})

export const checkOutSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
})

export const adjustmentSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  adjustmentAmount: z.number().refine((val) => val !== 0, 'Adjustment amount cannot be zero'),
  reason: z.string().min(1, 'Reason is required'),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
})

export const settingsSchema = z.object({
  nearExpiryDays: z.number().min(1).max(365),
  defaultLowStockThreshold: z.number().min(0),
  telegramEnabled: z.boolean(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  notificationPreferences: z.object({
    lowStock: z.boolean(),
    nearExpiry: z.boolean(),
    expired: z.boolean(),
  }),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
