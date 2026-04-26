import ProductCard from './ProductCard'

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

type ProductGridProps = {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: number) => void
}

function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  return (
    <section className="flex min-h-0 flex-col border border-white p-4">
      <h3 className="mb-4 text-lg font-medium">Products</h3>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {products.length === 0 ? (
          <div className="border border-white p-4">No products loaded yet</div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductGrid