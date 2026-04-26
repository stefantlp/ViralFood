import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import api from '../../api/axiosConfig'
import CategorySidebar from '../../components/layout/admin/menu/CategorySidebar'
import OrderProductGrid from '../../components/layout/admin/menu/OrderProductGrid'

type OrderItem = {
  id: number
  orderId: number
  menuItemId: number
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

type Order = {
  id: number
  tableId: number
  status: string
  totalPrice: number
  createdAt: string
  items: OrderItem[]
}

type TableResponse = {
  id: number
  tableNumber: number
  capacity: number
  status: string
  accessCode: string
}

type Category = {
  id: number
  name: string
}

type MenuItem = {
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

type DraftItem = {
  menuItemId: number
  productName: string
  unitPrice: number
  quantity: number
}

function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [isStartModalOpen, setIsStartModalOpen] = useState(false)
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null)

  const [tableIdInput, setTableIdInput] = useState('')
  const [tableLookupDone, setTableLookupDone] = useState(false)
  const [tableLookupLoading, setTableLookupLoading] = useState(false)

  const [identifyBy, setIdentifyBy] = useState<'alias' | 'phone'>('alias')
  const [reservationAlias, setReservationAlias] = useState('')
  const [reservationPhoneNumber, setReservationPhoneNumber] = useState('')
  const [accessCode, setAccessCode] = useState('')

  const [draftItems, setDraftItems] = useState<DraftItem[]>([])
  const [flowMode, setFlowMode] = useState<'start' | 'add'>('start')

  const loadOrders = async () => {
    const response = await api.get<Order[]>('http://localhost:8083/orders')
    setOrders(response.data)
  }

  const loadCategories = async () => {
    const response = await api.get<Category[]>('http://localhost:8082/categories')
    setCategories(response.data)

    if (response.data.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(response.data[0].id)
    }
  }

  const loadMenuItems = async () => {
    const response = await api.get<MenuItem[]>('http://localhost:8082/menu-items')
    setMenuItems(response.data)
  }

  const loadAll = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      await Promise.all([loadOrders(), loadCategories(), loadMenuItems()])
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to load orders.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const filteredMenuItems = useMemo(() => {
    if (selectedCategoryId === null) {
      return []
    }

    return menuItems.filter(
      (item) => item.available && item.category?.id === selectedCategoryId,
    )
  }, [menuItems, selectedCategoryId])

  const draftTotal = useMemo(() => {
    return draftItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    )
  }, [draftItems])

  const resetStartState = () => {
    setTableIdInput('')
    setSelectedTable(null)
    setTableLookupDone(false)
    setIdentifyBy('alias')
    setReservationAlias('')
    setReservationPhoneNumber('')
    setAccessCode('')
  }

  const resetDraftState = () => {
    setDraftItems([])
  }

  const getDraftQuantity = (menuItemId: number) => {
    return draftItems.find((item) => item.menuItemId === menuItemId)?.quantity || 0
  }

  const changeDraftQuantity = (product: MenuItem, delta: number) => {
    setDraftItems((previous) => {
      const existing = previous.find((item) => item.menuItemId === product.id)

      if (!existing && delta < 0) {
        return previous
      }

      if (!existing && delta > 0) {
        return [
          ...previous,
          {
            menuItemId: product.id,
            productName: product.name,
            unitPrice: Number(product.price),
            quantity: 1,
          },
        ]
      }

      return previous
        .map((item) =>
          item.menuItemId === product.id
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0)
    })
  }

  const openStartModal = () => {
    setFlowMode('start')
    setSelectedOrder(null)
    resetStartState()
    resetDraftState()
    setIsStartModalOpen(true)
  }

  const openAddItemsModal = async (order: Order) => {
    setFlowMode('add')
    setSelectedOrder(order)
    resetDraftState()
    resetStartState()
    setTableIdInput(String(order.tableId))
    setIsStartModalOpen(true)

    try {
      const response = await api.get<TableResponse>(
        `http://localhost:8084/tables/${order.tableId}`,
      )
      setSelectedTable(response.data)
      setTableLookupDone(true)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to load table.')
    }
  }

  const handleLookupTable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setTableLookupLoading(true)

    try {
      const response = await api.get<TableResponse>(
        `http://localhost:8084/tables/${Number(tableIdInput)}`,
      )
      setSelectedTable(response.data)
      setTableLookupDone(true)
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to load table.')
    } finally {
      setTableLookupLoading(false)
    }
  }

  const continueToMenu = () => {
    if (!selectedTable) {
      setErrorMessage('Select a table first.')
      return
    }

    const status = selectedTable.status?.toUpperCase()

    if (flowMode === 'start' && status === 'OCCUPIED') {
      setErrorMessage(
        'This table already has an active order. Use the + button on that row.',
      )
      return
    }

    if (status === 'RESERVED') {
      if (identifyBy === 'alias' && !reservationAlias.trim()) {
        setErrorMessage('Reservation alias is required.')
        return
      }

      if (identifyBy === 'phone' && !reservationPhoneNumber.trim()) {
        setErrorMessage('Reservation phone number is required.')
        return
      }
    }

    if (!accessCode.trim()) {
      setErrorMessage('Access code is required.')
      return
    }

    setErrorMessage('')
    setIsStartModalOpen(false)
    setIsMenuModalOpen(true)
  }

  const submitOrder = async () => {
    const tableId = selectedOrder?.tableId || selectedTable?.id

    if (!tableId) {
      setErrorMessage('No table selected.')
      return
    }

    if (draftItems.length === 0) {
      setErrorMessage('Add at least one item.')
      return
    }

    try {
      await api.post('http://localhost:8083/orders', {
        tableId,
        accessCode,
        reservationAlias: reservationAlias.trim() || null,
        reservationPhoneNumber: reservationPhoneNumber.trim() || null,
        items: draftItems.map((item) => ({
          menuItemId: item.menuItemId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      })

      setIsReviewModalOpen(false)
      setIsMenuModalOpen(false)
      resetDraftState()
      resetStartState()
      setSelectedOrder(null)
      await loadOrders()
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to place order.')
    }
  }

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsModalOpen(true)
  }

  const openCloseModal = (order: Order) => {
    setSelectedOrder(order)
    setIsCloseModalOpen(true)
  }

  const closeOrder = async () => {
    if (!selectedOrder) {
      return
    }

    try {
      await api.put(`http://localhost:8083/orders/${selectedOrder.id}/status`, {
        status: 'COMPLETED',
      })

      setIsCloseModalOpen(false)
      setSelectedOrder(null)
      await loadOrders()
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to close order.')
    }
  }

  const deleteOrder = async (orderId: number) => {
    try {
      await api.delete(`http://localhost:8083/orders/${orderId}`)
      await loadOrders()
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to delete order.')
    }
  }

  const getStatusClassName = (status: string) => {
    const normalized = status?.toUpperCase()

    if (normalized === 'OPEN' || normalized === 'PLACED') {
      return 'text-green-400'
    }

    if (normalized === 'CANCELLED') {
      return 'text-red-400'
    }

    return 'text-white'
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-6">
      <div className="flex items-center justify-between border-b border-white pb-4">
        <h2 className="text-2xl font-semibold">Orders</h2>

        <button
          onClick={openStartModal}
          className="flex h-12 w-12 items-center justify-center border border-white text-2xl hover:bg-white hover:text-black"
          title="Start order"
        >
          +
        </button>
      </div>

      {errorMessage && (
        <div className="border border-white px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden border border-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white">
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Table</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-5 py-4" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="px-5 py-4">No data yet</td>
                <td className="px-5 py-4">-</td>
                <td className="px-5 py-4">-</td>
                <td className="px-5 py-4">-</td>
                <td className="px-5 py-4 text-right">-</td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={
                    index !== orders.length - 1 ? 'border-b border-white' : ''
                  }
                >
                  <td className="px-5 py-4">#{order.id}</td>
                  <td className="px-5 py-4">{order.tableId}</td>
                  <td
                    className={`px-5 py-4 font-medium ${getStatusClassName(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </td>
                  <td className="px-5 py-4">
                    {Number(order.totalPrice).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {(order.status?.toUpperCase() === 'OPEN' ||
                        order.status?.toUpperCase() === 'PLACED') && (
                        <button
                          onClick={() => openAddItemsModal(order)}
                          className="border border-white px-3 py-2 hover:bg-white hover:text-black"
                          title="Add items"
                        >
                          +
                        </button>
                      )}

                      <button
                        onClick={() => openDetailsModal(order)}
                        className="border border-white px-3 py-2 hover:bg-white hover:text-black"
                        title="View order"
                      >
                        ?
                      </button>

                      {(order.status?.toUpperCase() === 'OPEN' ||
                        order.status?.toUpperCase() === 'PLACED') && (
                        <button
                          onClick={() => openCloseModal(order)}
                          className="border border-white px-3 py-2 hover:bg-white hover:text-black"
                          title="Close order"
                        >
                          $
                        </button>
                      )}

                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="border border-white px-3 py-2 hover:bg-white hover:text-black"
                        title="Delete order"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-xl border border-white bg-black p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
              <h3 className="text-xl font-semibold">
                {flowMode === 'start' ? 'Start Order' : 'Access Order'}
              </h3>

              <button
                onClick={() => {
                  setIsStartModalOpen(false)
                  resetStartState()
                  setSelectedOrder(null)
                }}
                className="border border-white px-3 py-2 hover:bg-white hover:text-black"
              >
                X
              </button>
            </div>

            {flowMode === 'start' && (
              <form className="space-y-4" onSubmit={handleLookupTable}>
                <input
                  type="number"
                  min="1"
                  placeholder="Table ID"
                  value={tableIdInput}
                  onChange={(event) => setTableIdInput(event.target.value)}
                  className="w-full border border-white bg-black px-4 py-3 text-white"
                  required
                />

                <button
                  type="submit"
                  disabled={tableLookupLoading}
                  className="border border-white px-4 py-3 hover:bg-white hover:text-black disabled:opacity-60"
                >
                  {tableLookupLoading ? 'Checking...' : 'Check table'}
                </button>
              </form>
            )}

            {flowMode === 'add' && selectedOrder && (
              <div className="mb-4 border border-white p-4">
                <p>
                  <span className="font-medium">Order:</span> #{selectedOrder.id}
                </p>
                <p>
                  <span className="font-medium">Table:</span> {selectedOrder.tableId}
                </p>
              </div>
            )}

            {tableLookupDone && selectedTable && (
              <div className="mt-6 space-y-4 border-t border-white pt-6">
                <div className="border border-white p-4">
                  <p>
                    <span className="font-medium">Table:</span>{' '}
                    {selectedTable.tableNumber}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {selectedTable.status}
                  </p>
                  <p>
                    <span className="font-medium">Capacity:</span>{' '}
                    {selectedTable.capacity}
                  </p>
                </div>

                {selectedTable.status?.toUpperCase() === 'RESERVED' &&
                  flowMode === 'start' && (
                    <>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIdentifyBy('alias')}
                          className={`border px-4 py-3 ${
                            identifyBy === 'alias'
                              ? 'border-white bg-white text-black'
                              : 'border-white text-white'
                          }`}
                        >
                          Alias
                        </button>

                        <button
                          type="button"
                          onClick={() => setIdentifyBy('phone')}
                          className={`border px-4 py-3 ${
                            identifyBy === 'phone'
                              ? 'border-white bg-white text-black'
                              : 'border-white text-white'
                          }`}
                        >
                          Phone number
                        </button>
                      </div>

                      {identifyBy === 'alias' ? (
                        <input
                          type="text"
                          placeholder="Reservation alias"
                          value={reservationAlias}
                          onChange={(event) =>
                            setReservationAlias(event.target.value)
                          }
                          className="w-full border border-white bg-black px-4 py-3 text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="Reservation phone number"
                          value={reservationPhoneNumber}
                          onChange={(event) =>
                            setReservationPhoneNumber(event.target.value)
                          }
                          className="w-full border border-white bg-black px-4 py-3 text-white"
                        />
                      )}
                    </>
                  )}

                <input
                  type="text"
                  placeholder="Access code"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value)}
                  className="w-full border border-white bg-black px-4 py-3 text-white"
                />

                <button
                  type="button"
                  onClick={continueToMenu}
                  className="border border-white px-4 py-3 hover:bg-white hover:text-black"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black p-4">
          <div className="flex h-full min-h-0 border border-white">
            <div className="w-72 border-r border-white p-4">
              <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
                <h3 className="text-xl font-semibold">Categories</h3>

                <button
                  onClick={() => {
                    setIsMenuModalOpen(false)
                    resetDraftState()
                  }}
                  className="border border-white px-3 py-2 hover:bg-white hover:text-black"
                >
                  X
                </button>
              </div>

              <CategorySidebar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
              />
            </div>

            <div className="min-w-0 flex-1 p-6">
              <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
                <h3 className="text-xl font-semibold">Products</h3>

                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="border border-white px-4 py-3 hover:bg-white hover:text-black"
                >
                  Review order
                </button>
              </div>

              <div className="h-[calc(100vh-12rem)] min-h-0">
                <OrderProductGrid
                  products={filteredMenuItems}
                  getQuantity={getDraftQuantity}
                  onDecrease={(product) => changeDraftQuantity(product, -1)}
                  onIncrease={(product) => changeDraftQuantity(product, 1)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-2xl border border-white bg-black p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
              <h3 className="text-xl font-semibold">Review Order</h3>

              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="border border-white px-3 py-2 hover:bg-white hover:text-black"
              >
                X
              </button>
            </div>

            <div className="space-y-3">
              {draftItems.length === 0 ? (
                <div className="border border-white p-4">No items selected.</div>
              ) : (
                draftItems.map((item) => (
                  <div key={item.menuItemId} className="border border-white p-4">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm">
                      {item.quantity} x {Number(item.unitPrice).toFixed(2)}
                    </div>
                    <div className="mt-1 text-sm">
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 border-t border-white pt-4">
              <div className="mb-4 text-lg font-semibold">
                Total: {draftTotal.toFixed(2)}
              </div>

              <button
                onClick={submitOrder}
                className="border border-white px-4 py-3 hover:bg-white hover:text-black"
              >
                Place order
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-3xl border border-white bg-black p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
              <h3 className="text-xl font-semibold">Order Details</h3>

              <button
                onClick={() => {
                  setIsDetailsModalOpen(false)
                  setSelectedOrder(null)
                }}
                className="border border-white px-3 py-2 hover:bg-white hover:text-black"
              >
                X
              </button>
            </div>

            <div className="mb-6 border border-white p-4">
              <p>
                <span className="font-medium">Order:</span> #{selectedOrder.id}
              </p>
              <p>
                <span className="font-medium">Table:</span> {selectedOrder.tableId}
              </p>
              <p>
                <span className="font-medium">Status:</span> {selectedOrder.status}
              </p>
              <p>
                <span className="font-medium">Total:</span>{' '}
                {Number(selectedOrder.totalPrice).toFixed(2)}
              </p>
            </div>

            <div className="space-y-3">
              {selectedOrder.items.length === 0 ? (
                <div className="border border-white p-4">No items.</div>
              ) : (
                selectedOrder.items.map((item) => (
                  <div key={item.id} className="border border-white p-4">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm">
                      {item.quantity} x {Number(item.unitPrice).toFixed(2)}
                    </div>
                    <div className="mt-1 text-sm">
                      {Number(item.lineTotal).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isCloseModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-xl border border-white bg-black p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
              <h3 className="text-xl font-semibold">Close Order</h3>

              <button
                onClick={() => {
                  setIsCloseModalOpen(false)
                  setSelectedOrder(null)
                }}
                className="border border-white px-3 py-2 hover:bg-white hover:text-black"
              >
                X
              </button>
            </div>

            <div className="mb-6 border border-white p-4">
              <p>
                <span className="font-medium">Order:</span> #{selectedOrder.id}
              </p>
              <p>
                <span className="font-medium">Table:</span> {selectedOrder.tableId}
              </p>
              <p>
                <span className="font-medium">Amount to pay:</span>{' '}
                {Number(selectedOrder.totalPrice).toFixed(2)}
              </p>
            </div>

            <button
              onClick={closeOrder}
              className="border border-white px-4 py-3 hover:bg-white hover:text-black"
            >
              Close order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderPage