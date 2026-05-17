import { useEffect, useMemo, useState, useRef } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import Navbar from '../../components/layout/client/Navbar'
import Footer from '../../components/layout/client/Footer'

const BASE = 'http://localhost:8000'

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  available: boolean
  viewCount: number
  category: { id: number; name: string } | null
}

type Category = {
  id: number
  name: string
}

type CartItem = {
  menuItemId: number
  productName: string
  unitPrice: number
  quantity: number
}

function OrderPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [tableId, setTableId] = useState('')
  const [tableStatus, setTableStatus] = useState<string | null>(null)
  const [isCheckingTable, setIsCheckingTable] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [reservationAlias, setReservationAlias] = useState('')
  const [reservationPhone, setReservationPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const orderSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          axios.get<MenuItem[]>(`${BASE}/menu-items`),
          axios.get<Category[]>(`${BASE}/categories`)
        ])
        setMenuItems(itemsRes.data.filter((i) => i.available))
        setCategories(catsRes.data)
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }
    loadMenu()
  }, [])

  useEffect(() => {
    document.body.style.overflow = selectedItem ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedItem])

  const itemsByCategory = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        items: menuItems.filter((item) => item.category?.id === cat.id),
      }))
      .filter((group) => group.items.length > 0)
  }, [menuItems, categories])

  const getQty = (id: number) => cart.find((c) => c.menuItemId === id)?.quantity || 0

  const changeQty = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id)
      if (!existing && delta < 0) return prev
      if (!existing && delta > 0) {
        return [...prev, { menuItemId: item.id, productName: item.name, unitPrice: Number(item.price), quantity: 1 }]
      }
      return prev
        .map((c) => c.menuItemId === item.id ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    })
  }

  const openModal = async (item: MenuItem) => {
    setSelectedItem(item)
    try {
      const res = await axios.post<number>(`${BASE}/menu-items/${item.id}/view`)
      const updated = { ...item, viewCount: res.data }
      setMenuItems((prev) => prev.map((i) => i.id === item.id ? updated : i))
      setSelectedItem(updated)
    } catch {
      // silent
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const scrollToOrder = () => orderSectionRef.current?.scrollIntoView({ behavior: 'smooth' })

  const checkTable = async () => {
    if (!tableId) { setErrorMessage('Enter a table number first.'); return }
    setErrorMessage('')
    setTableStatus(null)
    setAccessCode('')
    setReservationAlias('')
    setReservationPhone('')
    setIsCheckingTable(true)
    try {
      const res = await axios.get(`${BASE}/tables/${tableId}`)
      setTableStatus(res.data.status?.toUpperCase() ?? 'AVAILABLE')
    } catch {
      setErrorMessage('Table not found. Check the table number and try again.')
    } finally {
      setIsCheckingTable(false)
    }
  }

  const handleOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    if (cart.length === 0) { setErrorMessage('Your cart is empty. Add at least one item before placing an order.'); return }
    setIsSubmitting(true)
    try {
      const payload: any = {
        tableId: Number(tableId),
        accessCode,
        items: cart,
      }
      if (tableStatus === 'RESERVED') {
        payload.reservationAlias = reservationAlias
        payload.reservationPhoneNumber = reservationPhone
      }
      await axios.post(`${BASE}/orders`, payload)
      setShowSuccessPopup(true)
      setCart([])
      setTableId('')
      setAccessCode('')
      setReservationAlias('')
      setReservationPhone('')
      setTableStatus(null)
    } catch (error: any) {
      setErrorMessage(error?.response?.data || error?.response?.data?.message || 'Failed to place order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .bebas { font-family: 'Bebas Neue', sans-serif; }
        .page-glow { background: radial-gradient(ellipse at 70% 0%, rgba(249,115,22,0.12) 0%, transparent 60%); }
        .item-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .item-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(249,115,22,0.15); }
        .modal-overlay { animation: fadeIn 0.2s ease; }
        .modal-card { animation: scaleIn 0.22s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .divider { border: none; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent); }
        .cart-btn { animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <Navbar />

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center"
            style={{ animation: 'scaleIn 0.25s ease' }}
          >
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 text-4xl">
                🎉
              </div>
            </div>
            <h2 className="bebas mb-2 text-3xl text-white">Order Placed!</h2>
            <p className="mb-1 text-sm text-white/60">Your order has been sent to the kitchen.</p>
            <p className="mb-6 text-sm text-white/40">Sit back and enjoy — we'll bring it right to you.</p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 mb-6">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ animation: 'progress 4s linear forwards' }}
                onAnimationEnd={() => setShowSuccessPopup(false)}
              />
            </div>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400 transition-all"
            >
              Got it →
            </button>
          </div>
        </div>
      )}

      {/* ── ITEM MODAL ── */}
      {selectedItem && (
        <div
          className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="modal-card relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 flex"
            style={{ height: '85vh', maxWidth: '1000px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 bg-zinc-900">
              {selectedItem.imageUrl ? (
                <img src={selectedItem.imageUrl} alt={selectedItem.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-8xl">🍽️</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs backdrop-blur-sm text-white/70">
                <span>👁</span>
                <span>{selectedItem.viewCount ?? 0} views</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                {selectedItem.category && (
                  <span className="mb-2 inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-orange-400">
                    {selectedItem.category.name}
                  </span>
                )}
                <h2 className="bebas mb-1 text-4xl text-white leading-none">{selectedItem.name}</h2>
                <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
                  {selectedItem.description || 'One of our most viral dishes. Crafted to impress, made to be shared.'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-400">{Number(selectedItem.price).toFixed(2)} lei</span>
                  <div className="flex items-center gap-2">
                    {getQty(selectedItem.id) > 0 && (
                      <>
                        <button
                          onClick={() => changeQty(selectedItem, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm backdrop-blur-sm hover:border-orange-500 hover:text-orange-500"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-white">{getQty(selectedItem.id)}</span>
                      </>
                    )}
                    <button
                      onClick={() => changeQty(selectedItem, 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold hover:bg-orange-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-72 flex-shrink-0 flex-col border-l border-white/10 bg-zinc-950 justify-between">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h3 className="bebas text-xl text-white">Your Cart</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/20">
                    <span className="mb-2 text-4xl">🛒</span>
                    <span className="text-sm">Cart is empty</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((cartItem) => (
                      <div key={cartItem.menuItemId} className="flex items-start justify-between gap-2 border-b border-white/5 pb-3 last:border-0">
                        <p className="text-sm text-white/80 leading-tight flex-1">{cartItem.productName}</p>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xs text-white/40">x{cartItem.quantity}</span>
                          <span className="text-sm font-semibold text-orange-400">
                            {(cartItem.unitPrice * cartItem.quantity).toFixed(2)} lei
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-white/10 px-5 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className="text-base font-bold text-orange-400">{cartTotal.toFixed(2)} lei</span>
                  </div>
                  <button
                    onClick={() => { setSelectedItem(null); scrollToOrder() }}
                    className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 transition-all"
                  >
                    View Order →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING CART BUTTON ── */}
      {cartCount > 0 && (
        <button
          onClick={scrollToOrder}
          className="cart-btn fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-400 transition-all hover:scale-105"
        >
          <span>🛒</span>
          <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          <span className="text-orange-200">·</span>
          <span>{cartTotal.toFixed(2)} lei</span>
          <span className="ml-1">↓</span>
        </button>
      )}

      <div className="page-glow mx-auto max-w-7xl px-6 pt-28 pb-20">

        {/* ── MENU HEADER ── */}
        <div className="mb-10">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-500">Viral Picks</p>
          <h1 className="bebas text-6xl text-white md:text-7xl">Our Menu</h1>
          <p className="mt-3 text-base text-white/50">Click any dish to explore it. Add to cart and place your order below.</p>
        </div>

        {/* ── MENU SECTIONS ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-white/30">Loading menu...</div>
        ) : itemsByCategory.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-white/30">No items available.</div>
        ) : (
          <div className="flex flex-col gap-12">
            {itemsByCategory.map((group, groupIndex) => (
              <div key={group.category.id}>
                <div className="mb-5">
                  <h2 className="bebas text-4xl text-white">{group.category.name}</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="item-card overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      onClick={() => openModal(item)}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs backdrop-blur-sm text-white/60">
                          <span>👁</span>
                          <span>{item.viewCount ?? 0}</span>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="font-semibold text-sm text-white truncate">{item.name}</p>
                        <p className="mt-0.5 text-xs text-white/40 line-clamp-2">{item.description}</p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-orange-400 font-semibold text-sm">{Number(item.price).toFixed(2)} lei</span>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {getQty(item.id) > 0 && (
                              <>
                                <button
                                  onClick={() => changeQty(item, -1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-sm hover:border-orange-500 hover:text-orange-500"
                                >
                                  −
                                </button>
                                <span className="w-4 text-center text-sm">{getQty(item.id)}</span>
                              </>
                            )}
                            <button
                              onClick={() => changeQty(item, 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm font-bold hover:bg-orange-400"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {groupIndex < itemsByCategory.length - 1 && <hr className="divider mt-12" />}
              </div>
            ))}
          </div>
        )}

        {/* ── ORDER SECTION ── */}
        <div ref={orderSectionRef} className="mt-20">
          <hr className="divider mb-16" />
          <div className="mb-10">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-500">Ready to eat?</p>
            <h2 className="bebas text-6xl text-white md:text-7xl">Your Order</h2>
            <p className="mt-3 text-base text-white/50">Review your cart and enter your table number to place the order.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 self-start w-full">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[168px] text-white/20">
                  <span className="mb-2 text-3xl">🛒</span>
                  <span className="text-sm">Your cart is empty</span>
                  <p className="mt-1 text-xs">Go back up and add some items</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.productName}</p>
                        <p className="text-xs text-white/40">{Number(item.unitPrice).toFixed(2)} lei / buc</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => { const m = menuItems.find(mi => mi.id === item.menuItemId); if (m) changeQty(m, -1) }}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-sm hover:border-orange-500 hover:text-orange-500"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => { const m = menuItems.find(mi => mi.id === item.menuItemId); if (m) changeQty(m, 1) }}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm font-bold hover:bg-orange-400"
                        >
                          +
                        </button>
                        <span className="text-sm font-semibold text-orange-400 w-20 text-right">
                          {(item.unitPrice * item.quantity).toFixed(2)} lei
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="font-semibold text-white">Total</span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCart([])}
                        className="text-xs text-white/30 hover:text-red-400 transition-colors"
                      >
                        Clear all
                      </button>
                      <span className="text-xl font-bold text-orange-400">{cartTotal.toFixed(2)} lei</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 self-start">
              <h3 className="bebas mb-5 text-2xl text-white">Place Order</h3>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Table Number</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter your table number"
                      value={tableId}
                      onChange={(e) => { setTableId(e.target.value); setTableStatus(null); setErrorMessage('') }}
                      className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-orange-500"
                    />
                    <button
                      onClick={checkTable}
                      disabled={isCheckingTable || !tableId}
                      className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:border-orange-500 hover:text-orange-500 transition-all disabled:opacity-40"
                    >
                      {isCheckingTable ? '...' : 'Check'}
                    </button>
                  </div>
                </div>

                {tableStatus && (
                  <div className={`rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-widest ${
                    tableStatus === 'AVAILABLE' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                    tableStatus === 'RESERVED' ? 'border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#38bdf8]' :
                    tableStatus === 'OCCUPIED' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' :
                    'border-white/10 bg-white/5 text-white/40'
                  }`}>
                    Table {tableId} — {tableStatus}
                  </div>
                )}

                {tableStatus && (
                  <form onSubmit={handleOrder} className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Access Code</label>
                      <input
                        type="text"
                        placeholder="e.g. VF-T1-4821"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-orange-500"
                        required
                      />
                    </div>

                    {tableStatus === 'RESERVED' && (
                      <>
                        <p className="text-xs text-white/40">This table is reserved. Confirm your identity:</p>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Name / Alias</label>
                          <input
                            type="text"
                            placeholder="Name used for reservation"
                            value={reservationAlias}
                            onChange={(e) => setReservationAlias(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-[#38bdf8]"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Phone Number</label>
                          <input
                            type="text"
                            placeholder="Phone used for reservation"
                            value={reservationPhone}
                            onChange={(e) => setReservationPhone(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-[#38bdf8]"
                          />
                        </div>
                      </>
                    )}

                    {errorMessage && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {errorMessage}
                      </div>
                    )}
                    {successMessage && (
                      <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                        {successMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || cart.length === 0}
                      className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition-all hover:bg-orange-400 hover:scale-[1.01] disabled:opacity-60"
                    >
                      {isSubmitting ? 'Placing order...' : 'Place Order'}
                    </button>
                  </form>
                )}

                {!tableStatus && !errorMessage && (
                  <p className="text-xs text-white/30">Enter your table number and press Check to continue.</p>
                )}

                {errorMessage && !tableStatus && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}

export default OrderPage