import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import api from '../../api/axiosConfig'

type ReservationItem = {
  id: number
  customerAlias: string
  phoneNumber: string
  reservationTime: string
  peopleCount: number
  status: string
  table: {
    id: number
    tableNumber: number
    capacity: number
    status: string
    accessCode: string
  } | null
}

type TableItem = {
  id: number
  tableNumber: number
  capacity: number
  status: string
  accessCode: string
}

function Reservation() {
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationItem | null>(null)
  const [availableTables, setAvailableTables] = useState<TableItem[]>([])
  const [approveTableId, setApproveTableId] = useState('')

  const [customerAlias, setCustomerAlias] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [reservationTime, setReservationTime] = useState('')
  const [peopleCount, setPeopleCount] = useState('')

  const fetchReservations = async () => {
    const response = await api.get<ReservationItem[]>(
      'http://localhost:8084/reservations',
    )
    setReservations(response.data)
  }

  const loadReservations = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      await fetchReservations()
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || 'Failed to load reservations.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const resetCreateForm = () => {
    setCustomerAlias('')
    setPhoneNumber('')
    setReservationTime('')
    setPeopleCount('')
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    resetCreateForm()
  }

  const closeApproveModal = () => {
    setIsApproveModalOpen(false)
    setSelectedReservation(null)
    setAvailableTables([])
    setApproveTableId('')
  }

  const handleCreateReservation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await api.post('http://localhost:8084/reservations', {
        customerAlias,
        phoneNumber,
        reservationTime,
        peopleCount: Number(peopleCount),
      })

      closeCreateModal()
      await loadReservations()
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || 'Failed to create reservation.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReservation = async (id: number) => {
    try {
      await api.delete(`http://localhost:8084/reservations/${id}`)
      await loadReservations()
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || 'Failed to delete reservation.',
      )
    }
  }

  const openApproveModal = async (reservation: ReservationItem) => {
    setErrorMessage('')
    setSelectedReservation(reservation)
    setApproveTableId('')
    setAvailableTables([])
    setIsApproveModalOpen(true)

    try {
      const response = await api.get<TableItem[]>(
        `http://localhost:8084/reservations/${reservation.id}/available-tables`,
      )
      setAvailableTables(response.data)
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          'Failed to load available tables for approval.',
      )
    }
  }

  const handleApproveReservation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedReservation) {
      return
    }

    try {
      await api.put(
        `http://localhost:8084/reservations/${selectedReservation.id}/approve`,
        {
          tableId: Number(approveTableId),
        },
      )

      closeApproveModal()
      await loadReservations()
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || 'Failed to approve reservation.',
      )
    }
  }

  const getStatusClassName = (status: string) => {
    const normalizedStatus = status?.toUpperCase()

    if (normalizedStatus === 'APPROVED' || normalizedStatus === 'COMPLETED') {
      return 'text-green-400'
    }

    if (normalizedStatus === 'FAILED' || normalizedStatus === 'REJECTED') {
      return 'text-red-400'
    }

    return 'text-white'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white pb-4">
        <h2 className="text-2xl font-semibold">Reservations</h2>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex h-12 w-12 items-center justify-center border border-white text-2xl hover:bg-white hover:text-black"
          title="Add reservation"
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
              <th className="px-5 py-4">Alias</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">People</th>
              <th className="px-5 py-4">Table</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-5 py-4" colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td className="px-5 py-4">No reservations yet</td>
                <td className="px-5 py-4">-</td>
                <td className="px-5 py-4">-</td>
                <td className="px-5 py-4">-</td>
                <td className="px-5 py-4">-</td>
                <td className="px-5 py-4">-</td>
                <td className="px-5 py-4 text-right">-</td>
              </tr>
            ) : (
              reservations.map((reservation, index) => (
                <tr
                  key={reservation.id}
                  className={
                    index !== reservations.length - 1
                      ? 'border-b border-white'
                      : ''
                  }
                >
                  <td className="px-5 py-4">{reservation.customerAlias}</td>
                  <td className="px-5 py-4">{reservation.phoneNumber}</td>
                  <td className="px-5 py-4">
                    {new Date(reservation.reservationTime).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">{reservation.peopleCount}</td>
                  <td className="px-5 py-4">
                    {reservation.table?.tableNumber ?? '-'}
                  </td>
                  <td
                    className={`px-5 py-4 font-medium ${getStatusClassName(
                      reservation.status,
                    )}`}
                  >
                    {reservation.status}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {reservation.status?.toUpperCase() === 'PENDING' && (
                        <button
                          onClick={() => openApproveModal(reservation)}
                          className="border border-white px-3 py-2 hover:bg-white hover:text-black"
                          title="Approve reservation"
                        >
                          ✓
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="border border-white px-3 py-2 hover:bg-white hover:text-black"
                        title="Delete reservation"
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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-xl border border-white bg-black p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
              <h3 className="text-xl font-semibold">Add Reservation</h3>
              <button
                onClick={closeCreateModal}
                className="border border-white px-3 py-2 hover:bg-white hover:text-black"
              >
                X
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateReservation}>
              <input
                type="text"
                placeholder="Alias"
                value={customerAlias}
                onChange={(event) => setCustomerAlias(event.target.value)}
                className="w-full border border-white bg-black px-4 py-3 text-white"
                required
              />

              <input
                type="text"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full border border-white bg-black px-4 py-3 text-white"
                required
              />

              <input
                type="datetime-local"
                value={reservationTime}
                onChange={(event) => setReservationTime(event.target.value)}
                className="w-full border border-white bg-black px-4 py-3 text-white"
                required
              />

              <input
                type="number"
                min="1"
                placeholder="People count"
                value={peopleCount}
                onChange={(event) => setPeopleCount(event.target.value)}
                className="w-full border border-white bg-black px-4 py-3 text-white"
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="border border-white px-4 py-3 hover:bg-white hover:text-black disabled:opacity-60"
              >
                {isSubmitting ? 'Creating...' : 'Create reservation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isApproveModalOpen && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-xl border border-white bg-black p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white pb-4">
              <h3 className="text-xl font-semibold">Approve Reservation</h3>
              <button
                onClick={closeApproveModal}
                className="border border-white px-3 py-2 hover:bg-white hover:text-black"
              >
                X
              </button>
            </div>

            <div className="mb-4 border border-white p-4">
              <p>
                <span className="font-medium">Alias:</span>{' '}
                {selectedReservation.customerAlias}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{' '}
                {selectedReservation.phoneNumber}
              </p>
              <p>
                <span className="font-medium">Date:</span>{' '}
                {new Date(selectedReservation.reservationTime).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">People:</span>{' '}
                {selectedReservation.peopleCount}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleApproveReservation}>
              <select
                value={approveTableId}
                onChange={(event) => setApproveTableId(event.target.value)}
                className="w-full border border-white bg-black px-4 py-3 text-white"
                required
              >
                <option value="">Select a table</option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.tableNumber} - capacity {table.capacity}
                  </option>
                ))}
              </select>

              {availableTables.length === 0 && (
                <div className="border border-white px-4 py-3 text-sm">
                  No valid table is available for this reservation.
                </div>
              )}

              <button
                type="submit"
                disabled={!approveTableId}
                className="border border-white px-4 py-3 hover:bg-white hover:text-black disabled:opacity-60"
              >
                Approve reservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reservation