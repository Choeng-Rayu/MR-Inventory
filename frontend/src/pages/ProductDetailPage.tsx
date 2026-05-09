import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '@/utils/validators'
import { productService } from '@/services/product.service'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { Modal } from '@/components/common/Modal'
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/utils/constants'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  AlertTriangle,
  ImageIcon,
} from 'lucide-react'
import type { z } from 'zod'
import type { Unit } from '@/types/product.types'

type ProductFormData = z.infer<typeof productSchema>

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'new'
  const [units, setUnits] = useState<Unit[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id!),
    enabled: !isNew && !!id,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      lowStockThreshold: 10,
      units: [],
    },
  })

  // Set form values when product loads
  useEffect(() => {
    if (product) {
      setValue('name', product.name)
      setValue('categoryId', product.categoryId || '')
      setValue('barcode', product.barcode)
      setValue('description', product.description || '')
      setValue('lowStockThreshold', product.lowStockThreshold)
      setValue('baseUnit', product.baseUnit)
      setUnits(product.units || [])
      if (product.imageUrl) setImagePreview(product.imageUrl)
    }
  }, [product, setValue])

  const createMutation = useMutation({
    mutationFn: (data: Partial<ProductFormData>) => productService.createProduct(data),
    onSuccess: async (newProduct) => {
      if (imageFile) {
        await productService.uploadImage(newProduct.id, imageFile)
      }
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
      navigate('/products')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ProductFormData>) => productService.updateProduct(id!, data),
    onSuccess: async () => {
      if (imageFile && id) {
        await productService.uploadImage(id, imageFile)
      }
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully')
      navigate('/products')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productService.deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
      navigate('/products')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onSubmit = (data: ProductFormData) => {
    const payload = { ...data, units }
    if (isNew) {
      createMutation.mutate(payload)
    } else {
      updateMutation.mutate(payload)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addUnit = () => {
    setUnits([...units, { name: '', conversionRate: 1 }])
  }

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index))
  }

  const updateUnit = (index: number, field: keyof Unit, value: string | number) => {
    const updated = [...units]
    updated[index] = { ...updated[index], [field]: value }
    setUnits(updated)
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Add Product' : product?.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
            <Input
              label="Product Name"
              placeholder="Enter product name"
              error={errors.name?.message}
              {...register('name')}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category <span className="text-danger-500">*</span>
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                {...register('categoryId')}
              >
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-danger-600">{errors.categoryId.message}</p>
              )}
            </div>
            <Input
              label="Barcode"
              placeholder="Enter barcode"
              error={errors.barcode?.message}
              {...register('barcode')}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                {...register('description')}
              />
            </div>
          </Card>

          {/* Image & Settings */}
          <Card className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Image & Settings</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Product Image</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                  <Button type="button" variant="secondary" leftIcon={<Upload className="h-4 w-4" />}>
                    Upload Image
                  </Button>
                </label>
              </div>
            </div>
            <Input
              label="Base Unit"
              placeholder="e.g., piece, can, bottle"
              error={errors.baseUnit?.message}
              {...register('baseUnit')}
            />
            <Input
              label="Low Stock Threshold"
              type="number"
              error={errors.lowStockThreshold?.message}
              {...register('lowStockThreshold', { valueAsNumber: true })}
            />
          </Card>
        </div>

        {/* Units */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Unit Configuration</h2>
            <Button type="button" variant="secondary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={addUnit}>
              Add Unit
            </Button>
          </div>
          <div className="space-y-3">
            {units.map((unit, index) => (
              <div key={index} className="flex items-end gap-4 rounded-lg border border-gray-200 p-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Unit Name</label>
                  <input
                    type="text"
                    value={unit.name}
                    onChange={(e) => updateUnit(index, 'name', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="e.g., Box, Carton"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Conversion Rate
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={unit.conversionRate}
                    onChange={(e) => updateUnit(index, 'conversionRate', parseFloat(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="e.g., 24"
                  />
                </div>
                <div className="pb-2 text-sm text-gray-600">
                  1 {unit.name || 'Unit'} = {unit.conversionRate || 1} {product?.baseUnit || 'base'}
                </div>
                <button
                  type="button"
                  onClick={() => removeUnit(index)}
                  className="rounded p-2 text-danger-500 hover:bg-danger-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {units.length === 0 && (
              <p className="text-sm text-gray-500">No additional units configured.</p>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          {!isNew && (
            <Button
              type="button"
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
          >
            {isNew ? 'Create Product' : 'Update Product'}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning-500" />
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{product?.name}</strong>? This action cannot be
            undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}
