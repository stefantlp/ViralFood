import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import Navbar from '../../components/layout/client/Navbar'
import Footer from '../../components/layout/client/Footer'

const BASE = 'http://localhost:8000'

function Reservations() {
  const [customerAlias, setCustomerAlias] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [reservationTime, setReservationTime] = useState('')
  const [peopleCount, setPeopleCount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await axios.post(`${BASE}/reservations`, {
        customerAlias,
        phoneNumber,
        reservationTime,
        peopleCount: Number(peopleCount),
      })

      setSuccessMessage('Reservation submitted! We will confirm shortly.')
      setCustomerAlias('')
      setPhoneNumber('')
      setReservationTime('')
      setPeopleCount('')
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || 'Failed to submit reservation.',
      )
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
        .page-glow {
          background: radial-gradient(ellipse at 30% 0%, rgba(56,189,248,0.12) 0%, transparent 60%);
        }
      `}</style>

      <Navbar />

      <div className="page-glow mx-auto max-w-7xl px-6 pt-28 pb-20">
        <div className="mb-12">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">No account needed</p>
          <h1 className="bebas text-6xl text-white md:text-7xl">Book a Table</h1>
          <p className="mt-3 max-w-lg text-base text-white/50 leading-relaxed">
            Simple, fast reservation. Just your alias and phone number — we'll take care of the rest.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            {successMessage && (
              <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Alias</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={customerAlias}
                  onChange={(e) => setCustomerAlias(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-[#38bdf8]"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Phone Number</label>
                <input
                  type="text"
                  placeholder="+40 7XX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-[#38bdf8]"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Date & Time</label>
                <input
                  type="datetime-local"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition-colors focus:border-[#38bdf8]"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Number of People</label>
                <input
                  type="number"
                  min="1"
                  placeholder="2"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-[#38bdf8]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition-all hover:bg-orange-400 hover:scale-[1.01] disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Reserve My Table'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {[
              { icon: '📋', title: 'No Account Required', desc: 'Just your name and number. No sign-up, no passwords.' },
              { icon: '⚡', title: 'Instant Confirmation', desc: 'We confirm your reservation as fast as possible.' },
              { icon: '🪑', title: 'Best Seats Reserved', desc: 'Tell us how many and we will find the perfect table.' },
              { icon: '📱', title: 'Post & Get 15% Off', desc: 'Tag @ViralFood in your story and show staff for a discount on your next order.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 text-sm text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Reservations
