import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { productService } from '@/services/product.service'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Modal } from '@/components/common/Modal'
import { useDebounce } from '@/hooks/useDebounce'
import { formatNumber } from '@/utils/formatters'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import type { Product } from '@/types/product.types'

export function ProductsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search: debouncedSearch, category, page }],
    queryFn: () =>
      productService.getProducts({
        search: debouncedSearch || undefined,
        category: category || undefined,
        page,
        limit: 20,
      }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully')
      setDeleteProduct(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const products = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your products</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/products/new')}>
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, barcode, or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className="rounded-md border-gray-300 py-2 pl-3 pr-10 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {(search || category) && (
          <Button variant="ghost" onClick={() => { setSearch(''); setCategory(''); setPage(1) }}>
            Clear filters
          </Button>
        )}
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Package className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Barcode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {product.barcode}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {formatNumber(product.currentStock)} {product.baseUnit}
                        </span>
                        {product.currentStock <= product.lowStockThreshold && (
                          <AlertTriangle className="h-4 w-4 text-warning-500" />
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteProduct(product)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-danger-600"
                          aria-label="Delete"
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

        {/* Pagination */}
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

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="Delete Product"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteProduct(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong>{deleteProduct?.name}</strong>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
