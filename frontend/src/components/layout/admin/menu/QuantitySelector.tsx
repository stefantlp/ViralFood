type QuantitySelectorProps = {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
}

function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
}: QuantitySelectorProps) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        onClick={onDecrease}
        className="border border-white px-3 py-2 hover:bg-white hover:text-black"
      >
        -
      </button>

      <div className="min-w-10 text-center">{quantity}</div>

      <button
        onClick={onIncrease}
        className="border border-white px-3 py-2 hover:bg-white hover:text-black"
      >
        +
      </button>
    </div>
  )
}

export default QuantitySelector