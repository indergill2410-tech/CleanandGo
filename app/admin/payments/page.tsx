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
  succeeded: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-slate-100 text-slate-700',
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
    <div className="min-h-screen bg-[#EFF7FC] px-4 py-5 text-[#0B3558] sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">Back to overview</Link>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-[#0B3558]">Payments and revenue</h1>
          <p className="mt-1 text-sm font-bold text-[#60798F]">Captured Stripe payments across customer bookings.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total revenue', value: money(totals.grossCents), color: 'text-emerald-700' },
            { label: 'This month', value: money(totals.monthCents), color: 'text-[#1D7ED0]' },
            { label: 'Payments', value: String(totals.count), color: 'text-[#0B3558]' },
          ].map(s => (
            <div key={s.label} className="rounded-[8px] border border-[#CFE0ED] bg-white p-5 shadow-sm">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="mt-1 text-sm font-bold text-[#60798F]">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-[#60798F]">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="rounded-[8px] border border-[#CFE0ED] bg-white p-12 text-center text-[#60798F] shadow-sm">No payments recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-[8px] border border-[#CFE0ED] bg-white p-4 shadow-sm">
                <div>
                  <div className="font-black text-[#0B3558]">{p.bookings?.customers?.name || 'Customer'}</div>
                  <div className="text-sm font-bold text-[#60798F]">{p.bookings?.service_type || '-'}{p.bookings?.scheduled_date ? ` · ${p.bookings.scheduled_date}` : ''}</div>
                  <div className="mt-1 text-xs text-[#8AA0AC]" suppressHydrationWarning>{new Date(p.captured_at || p.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-[#0B3558]">{money(p.amount_cents)}</div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-black ${STATUS_STYLES[p.status] || 'bg-slate-100 text-slate-700'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
