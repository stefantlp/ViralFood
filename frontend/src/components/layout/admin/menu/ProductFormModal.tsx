import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

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

type ProductFormModalProps = {
  isOpen: boolean
  mode: 'create' | 'edit'
  categories: Category[]
  product: Product | null
  onClose: () => void
  onSubmit: (payload: {
    name: string
    description: string
    price: number
    imageUrl: string
    available: boolean
    categoryId: number
  }) => Promise<void>
}

function ProductFormModal({
  isOpen,
  mode,
  categories,
  product,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [available, setAvailable] = useState(true)
  const [categoryId, setCategoryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name || '')
      setDescription(product.description || '')
      setPrice(String(product.price ?? ''))
      setImageUrl(product.imageUrl || '')
      setAvailable(product.available ?? true)
      setCategoryId(product.category?.id ? String(product.category.id) : '')
      return
    }

    if (mode === 'create') {
      setName('')
      setDescription('')
      setPrice('')
      setImageUrl('')
      setAvailable(true)
      setCategoryId(categories.length > 0 ? String(categories[0].id) : '')
    }
  }, [mode, product, categories])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        name,
        description,
        price: Number(price),
        imageUrl,
        available,
        categoryId: Number(categoryId),
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-2xl border border-white bg-black p-6">
        <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
          <h3 className="text-xl font-semibold">
            {mode === 'create' ? 'Add Product' : 'Edit Product'}
          </h3>

          <button
            onClick={onClose}
            className="border border-white px-3 py-2 hover:bg-white hover:text-black"
          >
            X
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full border border-white bg-black px-4 py-3 text-white"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full border border-white bg-black px-4 py-3 text-white"
          />

          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-full border border-white bg-black px-4 py-3 text-white"
            required
          />

          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="w-full border border-white bg-black px-4 py-3 text-white"
          />

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full border border-white bg-black px-4 py-3 text-white"
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={available}
              onChange={(event) => setAvailable(event.target.checked)}
            />
            <span>Available</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="border border-white px-4 py-3 hover:bg-white hover:text-black disabled:opacity-60"
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Adding...'
                : 'Saving...'
              : mode === 'create'
                ? 'Add product'
                : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProductFormModal