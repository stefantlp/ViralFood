import OrderProductCard from './OrderProductCard'

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

type OrderProductGridProps = {
  products: Product[]
  getQuantity: (menuItemId: number) => number
  onDecrease: (product: Product) => void
  onIncrease: (product: Product) => void
}

function OrderProductGrid({
  products,
  getQuantity,
  onDecrease,
  onIncrease,
}: OrderProductGridProps) {
  return (
    <section className="flex min-h-0 flex-col border border-white p-4">
      <h3 className="mb-4 text-lg font-medium">Products</h3>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {products.length === 0 ? (
          <div className="border border-white p-4">No products loaded yet</div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <OrderProductCard
                key={product.id}
                product={product}
                quantity={getQuantity(product.id)}
                onDecrease={() => onDecrease(product)}
                onIncrease={() => onIncrease(product)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default OrderProductGrid