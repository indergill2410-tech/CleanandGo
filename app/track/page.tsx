'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PaymentForm from '@/components/PaymentForm'
import HomeLink from '@/components/HomeLink'

type Booking = {
  id: string
  service_type: string
  scheduled_date: string
  scheduled_time: string
  address: string
  suburb: string
  status: string
  price_cents: number
  customer_name: string | null
}

const SERVICE_LABEL: Record<string, string> = {
  endoflease: 'End of Lease Clean',
  recurring: 'Recurring Clean',
  oneoff: 'One-Off Clean',
}

// Booking status → ordered progress stages.
const STAGES = [
  { key: 'requested', icon: '📋', label: 'Quote Requested', sub: "We've got your details" },
  { key: 'confirmed', icon: '✅', label: 'Booking Confirmed', sub: 'Payment received, clean locked in' },
  { key: 'in_progress', icon: '🧹', label: 'Cleaning Now', sub: 'Your home is being cleaned' },
  { key: 'completed', icon: '✨', label: 'All Done', sub: 'Photos sent to your email' },
]

function stageIndex(status: string, paid: boolean): number {
  switch (status) {
    case 'completed': return 3
    case 'in_progress': return 2
    case 'confirmed': return paid ? 1 : 0
    default: return 0
  }
}

function Lookup() {
  const router = useRouter()
  const [ref, setRef] = useState('')
  return (
    <div className="glass-strong rounded-3xl p-8 w-full max-w-sm text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Track Your Clean</h1>
      <p className="text-white/50 text-sm mb-6">Enter the booking reference from your confirmation email.</p>
      <form
        onSubmit={e => { e.preventDefault(); if (ref.trim()) router.push(`/track?id=${ref.trim()}`) }}
        className="space-y-4"
      >
        <input
          value={ref}
          onChange={e => setRef(e.target.value)}
          placeholder="Booking reference"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm"
        />
        <button type="submit" className="w-full py-3.5 rounded-xl bg-white text-[#0B3558] font-bold hover:bg-white/90 transition">
          Track
        </button>
      </form>
    </div>
  )
}

function TrackInner() {
  const params = useSearchParams()
  const id = params.get('id')
  const justPaid = params.get('redirect_status') === 'succeeded'

  const [booking, setBooking] = useState<Booking | null>(null)
  const [paid, setPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Payment UI state
  const [clientSecret, setClientSecret] = useState('')
  const [payAmount, setPayAmount] = useState(0)
  const [startingPay, setStartingPay] = useState(false)
  const [payError, setPayError] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/track/${id}`)
      if (!res.ok) { setNotFound(true); return }
      const data = await res.json()
      setBooking(data.booking)
      setPaid(data.paid)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const startPayment = async () => {
    if (!id) return
    setStartingPay(true)
    setPayError('')
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      })
      const data = await res.json()
      if (!res.ok) { setPayError(data.error || 'Could not start payment'); return }
      setClientSecret(data.clientSecret)
      setPayAmount(data.amount)
    } catch {
      setPayError('Could not start payment')
    } finally {
      setStartingPay(false)
    }
  }

  if (!id) return <Lookup />
  if (loading) return <div className="text-white/60">Loading…</div>
  if (notFound || !booking) {
    return (
      <div className="glass-strong rounded-3xl p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🤔</div>
        <h1 className="text-xl font-bold text-white mb-2">Booking not found</h1>
        <p className="text-white/50 text-sm">Double-check the reference in your confirmation email.</p>
      </div>
    )
  }

  const current = stageIndex(booking.status, paid || justPaid)
  const isPaid = paid || justPaid
  const awaitingQuote = booking.status === 'pending' || booking.price_cents <= 0
  const awaitingPayment = !awaitingQuote && !isPaid && booking.status !== 'cancelled'
  const serviceLabel = SERVICE_LABEL[booking.service_type] || 'Clean'

  return (
    <div className="relative z-10 w-full max-w-sm">
      <div className="text-center mb-6">
        <div className="text-white/40 text-xs mb-1">Reference: {booking.id}</div>
        <h1 className="text-2xl font-bold text-white">Track Your Clean</h1>
      </div>

      {/* Booking summary */}
      <div className="glass-strong rounded-3xl p-6 mb-6">
        <div className="text-white font-bold text-lg">{serviceLabel}</div>
        <div className="text-white/60 text-sm mt-1">{booking.address}</div>
        <div className="text-white/40 text-xs mt-1">
          {booking.scheduled_date} · {String(booking.scheduled_time).slice(0, 5)}
        </div>
      </div>

      {/* Quote / payment */}
      {awaitingQuote && (
        <div className="glass rounded-3xl p-6 mb-6 text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-white font-semibold">Preparing your quote</div>
          <div className="text-white/50 text-sm mt-1">We usually send quotes within 60 minutes during business hours.</div>
        </div>
      )}

      {awaitingPayment && (
        <div className="glass rounded-3xl p-6 mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-white/60 text-sm">Your quote</span>
            <span className="text-white font-bold text-2xl">${(booking.price_cents / 100).toFixed(2)}</span>
          </div>
          {!clientSecret ? (
            <>
              <button
                onClick={startPayment}
                disabled={startingPay}
                className="w-full py-3.5 rounded-xl bg-white text-[#0B3558] font-bold hover:bg-white/90 transition disabled:opacity-50"
              >
                {startingPay ? 'Loading…' : 'Pay & Confirm Booking'}
              </button>
              {payError && <div className="text-red-300 text-sm mt-3 text-center">{payError}</div>}
            </>
          ) : (
            <PaymentForm clientSecret={clientSecret} amountCents={payAmount} returnPath={`/track?id=${booking.id}`} />
          )}
        </div>
      )}

      {isPaid && (
        <div className="glass rounded-3xl p-5 mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-green-400" /> Payment received
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="glass rounded-3xl p-6">
        {STAGES.map((stage, i) => {
          const isPast = i < current
          const isCurrent = i === current
          return (
            <div key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all duration-500 ${
                  isPast ? 'bg-green-500 shadow-lg shadow-green-500/30'
                  : isCurrent ? 'gradient-cta ring-4 ring-white/30 shadow-xl'
                  : 'bg-white/10'
                }`}>
                  {isPast ? '✓' : stage.icon}
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`w-0.5 h-8 my-1 transition-all duration-500 ${isPast ? 'bg-green-500' : 'bg-white/20'}`} />
                )}
              </div>
              <div className="pb-6">
                <div className={`font-semibold text-sm ${isCurrent ? 'text-white' : isPast ? 'text-white/70' : 'text-white/30'}`}>
                  {stage.label}
                </div>
                {(isCurrent || isPast) && <div className="text-xs mt-0.5 text-white/50">{stage.sub}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #0B3558 0%, #0B3558 100%)' }}>
      <HomeLink className="fixed top-6 left-6 z-20" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#7DD3FC' }} />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#1D7ED0' }} />
      </div>
      <Suspense fallback={<div className="text-white/60">Loading…</div>}>
        <TrackInner />
      </Suspense>
    </div>
  )
}
