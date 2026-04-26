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

type ProductCardProps = {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: number) => void
}

function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="border border-white p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold">{product.name}</h4>
          <p className="mt-1 text-sm text-zinc-300">
            {product.description || 'No description'}
          </p>
        </div>

        <div className="text-right">
          {Number(product.price).toFixed(2)}
        </div>
      </div>

      <div className="mb-4 text-sm">
        <span className="font-medium">Available:</span>{' '}
        {product.available ? 'Yes' : 'No'}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(product)}
          className="border border-white px-4 py-2 hover:bg-white hover:text-black"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(product.id)}
          className="border border-white px-4 py-2 hover:bg-white hover:text-black"
          title="Delete product"
        >
          🗑
        </button>
      </div>
    </div>
  )
}

export default ProductCard