import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axiosConfig'
import CategorySidebar from '../../components/layout/admin/menu/CategorySidebar'
import ProductGrid from '../../components/layout/admin/menu/ProductGrid'
import ProductFormModal from '../../components/layout/admin/menu/ProductFormModal'

type Category = {
  id: number
  name: string
}

type Product = {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  available: boolean
  category: {
    id: number
    name: string
  } | null
}

function Menu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const loadCategories = async () => {
    const response = await api.get<Category[]>('http://localhost:8082/categories')
    setCategories(response.data)

    if (response.data.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(response.data[0].id)
    }
  }

  const loadProducts = async () => {
    const response = await api.get<Product[]>('http://localhost:8082/menu-items')
    setProducts(response.data)
  }

  const loadAll = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      await Promise.all([loadCategories(), loadProducts()])
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to load menu.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === null) {
      return []
    }

    return products.filter((product) => product.category?.id === selectedCategoryId)
  }, [products, selectedCategoryId])

  const handleCreateProduct = async (payload: {
    name: string
    description: string
    price: number
    imageUrl: string
    available: boolean
    categoryId: number
  }) => {
    try {
      await api.post('http://localhost:8082/menu-items', payload)
      await loadAll()
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to add product.')
      throw error
    }
  }

  const handleEditProduct = async (payload: {
    name: string
    description: string
    price: number
    imageUrl: string
    available: boolean
    categoryId: number
  }) => {
    if (!editingProduct) {
      return
    }

    try {
      await api.put(`http://localhost:8082/menu-items/${editingProduct.id}`, payload)
      await loadAll()
      setEditingProduct(null)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to update product.')
      throw error
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    try {
      await api.delete(`http://localhost:8082/menu-items/${productId}`)
      await loadAll()
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to delete product.')
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingProduct(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white pb-4">
        <h2 className="text-2xl font-semibold">Menu</h2>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="border border-white px-4 py-3 hover:bg-white hover:text-black"
        >
          Add product
        </button>
      </div>

      {errorMessage && (
        <div className="border border-white px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-[300px_1fr]">
        <CategorySidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {isLoading ? (
          <section className="border border-white p-4">Loading...</section>
        ) : (
          <ProductGrid
            products={filteredProducts}
            onEdit={openEditModal}
            onDelete={handleDeleteProduct}
          />
        )}
      </div>

      <ProductFormModal
        isOpen={isCreateModalOpen}
        mode="create"
        categories={categories}
        product={null}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProduct}
      />

      <ProductFormModal
        isOpen={isEditModalOpen}
        mode="edit"
        categories={categories}
        product={editingProduct}
        onClose={closeEditModal}
        onSubmit={handleEditProduct}
      />
    </div>
  )
}

export default Menu