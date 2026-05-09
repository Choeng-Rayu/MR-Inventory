import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supplierService } from '@/services/supplier.service'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { Modal } from '@/components/common/Modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema } from '@/utils/validators'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Truck, ChevronLeft, ChevronRight } from 'lucide-react'
import type { z } from 'zod'
import type { Supplier } from '@/types/supplier.types'

type SupplierFormData = z.infer<typeof supplierSchema>

export function SuppliersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', { page }],
    queryFn: () => supplierService.getSuppliers({ page, limit: 20 }),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<SupplierFormData>) => supplierService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Supplier created')
      setEditingSupplier(null)
      reset()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SupplierFormData>) =>
      supplierService.updateSupplier(editingSupplier!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Supplier updated')
      setEditingSupplier(null)
      reset()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Supplier deleted')
      setDeleteSupplier(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onSubmit = (data: SupplierFormData) => {
    if (editingSupplier?.id === 'new') {
      createMutation.mutate(data)
    } else {
      updateMutation.mutate(data)
    }
  }

  const openEditModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setValue('name', supplier.name)
      setValue('contactPerson', supplier.contactPerson || '')
      setValue('phone', supplier.phone || '')
      setValue('email', supplier.email || '')
      setValue('address', supplier.address || '')
    } else {
      setEditingSupplier({ id: 'new' } as Supplier)
      reset()
    }
  }

  const suppliers = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your suppliers</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openEditModal()}>
          Add Supplier
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Truck className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p>No suppliers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/suppliers/${supplier.id}`)}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {supplier.name}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {supplier.contactPerson || '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {supplier.phone || '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {supplier.email || '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(supplier)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteSupplier(supplier)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-danger-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        title={editingSupplier?.id === 'new' ? 'Add Supplier' : 'Edit Supplier'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditingSupplier(null)}>
              Cancel
            </Button>
            <Button type="submit" form="supplier-form" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        }
      >
        <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input
            label="Contact Person"
            error={errors.contactPerson?.message}
            {...register('contactPerson')}
          />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              {...register('address')}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteSupplier}
        onClose={() => setDeleteSupplier(null)}
        title="Delete Supplier"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteSupplier(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteSupplier && deleteMutation.mutate(deleteSupplier.id)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong>{deleteSupplier?.name}</strong>?
        </p>
      </Modal>
    </div>
  )
}
