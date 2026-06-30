'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Payment = {
  id: string
  amount_cents: number
  status: string
  captured_at: string | null
  created_at: string
  stripe_payment_intent_id: string | null
  bookings: { service_type: string; scheduled_date: string; customers: { name: string; email: string } | null } | null
}

type Totals = { grossCents: number; monthCents: number; count: number }

const STATUS_STYLES: Record<string, string> = {
  succeeded: 'bg-green-500/20 text-green-300',
  pending: 'bg-amber-500/20 text-amber-300',
  failed: 'bg-red-500/20 text-red-300',
  refunded: 'bg-white/10 text-white/50',
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [totals, setTotals] = useState<Totals>({ grossCents: 0, monthCents: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payments').then(r => r.json()).then(d => {
      setPayments(d.payments || [])
      if (d.totals) setTotals(d.totals)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const money = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  return (
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #0B3558 0%, #0B3558 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Payments &amp; revenue</h1>
          <p className="text-white/50 mt-1">Captured Stripe payments across all bookings.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total revenue', value: money(totals.grossCents), color: 'text-green-300' },
            { label: 'This month', value: money(totals.monthCents), color: 'text-blue-300' },
            { label: 'Payments', value: String(totals.count), color: 'text-white' },
          ].map(s => (
            <div key={s.label} className="glass-strong rounded-2xl p-5">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-white/50 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : payments.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center text-white/40">No payments recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.id} className="glass-strong rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-white font-semibold">{p.bookings?.customers?.name || 'Customer'}</div>
                  <div className="text-white/50 text-sm">{p.bookings?.service_type || '—'}{p.bookings?.scheduled_date ? ` · ${p.bookings.scheduled_date}` : ''}</div>
                  <div className="text-white/30 text-xs mt-1" suppressHydrationWarning>{new Date(p.captured_at || p.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{money(p.amount_cents)}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] || 'bg-white/10 text-white/50'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
