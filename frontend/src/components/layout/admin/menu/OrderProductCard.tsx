import QuantitySelector from './QuantitySelector'

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

type OrderProductCardProps = {
  product: Product
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
}

function OrderProductCard({
  product,
  quantity,
  onDecrease,
  onIncrease,
}: OrderProductCardProps) {
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

      <QuantitySelector
        quantity={quantity}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
      />
    </div>
  )
}

export default OrderProductCard