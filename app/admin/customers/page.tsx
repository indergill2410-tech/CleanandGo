'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
  stripe_customer_id: string | null
  bookings: number
  completed: number
  upcoming: number
  spentCents: number
  lastDate: string | null
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return customers
    return customers.filter(c => c.name?.toLowerCase().includes(t) || c.email?.toLowerCase().includes(t) || c.phone?.includes(t))
  }, [customers, q])

  const money = (cents: number) => `$${(cents / 100).toFixed(0)}`

  return (
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #0B3558 0%, #0B3558 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Customers</h1>
          <p className="text-white/50 mt-1">{customers.length} total · search by name, email or phone.</p>
        </div>

        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers…"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm mb-6" />

        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center text-white/40">No customers found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c.id} className="glass-strong rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">{c.name || '—'}</div>
                    <div className="text-white/60 text-sm">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
                    <div className="text-white/30 text-xs mt-1" suppressHydrationWarning>
                      Joined {new Date(c.created_at).toLocaleDateString()}{c.lastDate ? ` · last job ${c.lastDate}` : ''}
                    </div>
                  </div>
                  <div className="flex gap-5 text-center">
                    <div><div className="text-white font-bold">{c.bookings}</div><div className="text-white/40 text-xs">bookings</div></div>
                    <div><div className="text-blue-300 font-bold">{c.upcoming}</div><div className="text-white/40 text-xs">upcoming</div></div>
                    <div><div className="text-green-300 font-bold">{money(c.spentCents)}</div><div className="text-white/40 text-xs">spent</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
