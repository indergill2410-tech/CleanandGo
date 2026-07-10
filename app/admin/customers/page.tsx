'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, DollarSign, Mail, Phone, Search, Sparkles, UserRoundCheck } from 'lucide-react'

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

const money = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/customers')
      .then((response) => response.json())
      .then((data) => setCustomers(data.customers || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((customer) => [customer.name, customer.email, customer.phone].filter(Boolean).some((value) => String(value).toLowerCase().includes(term)))
  }, [customers, query])

  const totals = useMemo(() => ({
    customers: customers.length,
    upcoming: customers.reduce((sum, customer) => sum + customer.upcoming, 0),
    bookings: customers.reduce((sum, customer) => sum + customer.bookings, 0),
    spent: customers.reduce((sum, customer) => sum + customer.spentCents, 0),
  }), [customers])

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="rounded-[8px] border border-[#D4E1E8] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1670A8]">Customer hub</p>
            <h1 className="mt-2 text-3xl font-black text-[#102D42]">Every customer relationship in one ledger</h1>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#5C7180]">Search, scan value, see upcoming work, and keep customer operations attached to the same command layer.</p>
          </div>
          <label className="flex min-h-11 items-center gap-2 rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] px-3 text-sm text-[#5C7180] xl:w-[360px]">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone" className="w-full bg-transparent outline-none" />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Customers" value={String(totals.customers)} icon={UserRoundCheck} />
          <Stat label="Upcoming jobs" value={String(totals.upcoming)} icon={CalendarDays} />
          <Stat label="Total bookings" value={String(totals.bookings)} icon={Sparkles} />
          <Stat label="Lifetime spend" value={money(totals.spent)} icon={DollarSign} />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[8px] border border-[#D4E1E8] bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-sm font-bold text-[#5C7180]">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-[#5C7180]">No customers found.</div>
        ) : filtered.map((customer) => (
          <article key={customer.id} className="grid gap-4 border-b border-[#D4E1E8] p-4 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-[#102D42]">{customer.name || 'Customer'}</h2>
                {customer.stripe_customer_id && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-900">billing linked</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-[#5C7180]">
                <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{customer.email}</span>
                {customer.phone && <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{customer.phone}</span>}
              </div>
              <p className="mt-2 text-xs font-black text-[#8AA0AC]">
                Joined {new Date(customer.created_at).toLocaleDateString()}{customer.lastDate ? ` - last job ${customer.lastDate}` : ''}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[340px]">
              <Fact label="Bookings" value={String(customer.bookings)} />
              <Fact label="Upcoming" value={String(customer.upcoming)} />
              <Fact label="Spent" value={money(customer.spentCents)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof UserRoundCheck }) {
  return (
    <section className="rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] p-4">
      <Icon className="h-5 w-5 text-[#1670A8]" />
      <div className="mt-3 text-2xl font-black text-[#102D42]">{value}</div>
      <div className="text-xs font-bold text-[#5C7180]">{label}</div>
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-[#F7FAFC] px-3 py-2">
      <div className="text-sm font-black text-[#102D42]">{value}</div>
      <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8AA0AC]">{label}</div>
    </div>
  )
}
