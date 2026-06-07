'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/subscriptions', label: 'Recurring plans' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/applications', label: 'Applications' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/timesheets', label: 'Timesheets' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/account', label: 'Account' },
]

type Booking = {
  id: string
  service_type: string
  status: string
  scheduled_date: string
  scheduled_time: string
  address: string
  suburb: string
  bedrooms: number
  bathrooms: number
  extras: string[]
  notes: string
  price_cents: number
  staff_id: string | null
  created_at: string
  customers?: { name: string; email: string; phone: string }
}

const SERVICE_LABELS: Record<string, string> = {
  recurring: 'Recurring Clean',
  oneoff: 'One-Off Clean',
  endoflease: 'End of Lease',
}

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-amber-500/20 text-amber-300 border-amber-400/30',
  confirmed:   'bg-blue-500/20 text-blue-300 border-blue-400/30',
  in_progress: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  completed:   'bg-green-500/20 text-green-300 border-green-400/30',
  cancelled:   'bg-red-500/20 text-red-300 border-red-400/30',
}

export default function AdminDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteNote, setQuoteNote] = useState('')
  const [quoting, setQuoting] = useState(false)
  const [quoteSent, setQuoteSent] = useState(false)
  const [filter, setFilter] = useState('all')
  const [unread, setUnread] = useState(0)
  const [apps, setApps] = useState<{ id: string; name: string; suburbs: string | null; status: string; created_at: string }[]>([])
  const [cleaners, setCleaners] = useState<{ id: string; name: string; role: string }[]>([])
  const [savingBooking, setSavingBooking] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messageStatus, setMessageStatus] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      const list = data.bookings || []
      setBookings(list)
      setUnread(list.filter((b: Booking) => b.status === 'pending').length)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const data = await fetch('/api/careers/apply').then(r => r.json())
      setApps(data.applications || [])
    } catch (e) { console.error(e) }
  }

  const fetchCleaners = async () => {
    try {
      const data = await fetch('/api/staff').then(r => r.json())
      setCleaners((data.staff || []).filter((s: { role: string }) => s.role === 'cleaner'))
    } catch (e) { console.error(e) }
  }

  useEffect(() => { fetchBookings(); fetchApplications(); fetchCleaners() }, [])

  const newApps = apps.filter(a => a.status === 'new').length

  // Update a booking (assign cleaner / change status) and keep the panel in sync.
  const patchBooking = async (updates: Record<string, string>) => {
    if (!selected) return
    setSavingBooking(true)
    try {
      const res = await fetch(`/api/bookings/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Update failed'); return }
      setSelected(s => (s ? { ...s, ...updates } as Booking : s))
      await fetchBookings()
    } catch {
      alert('Network error')
    } finally {
      setSavingBooking(false)
    }
  }

  const sendQuote = async () => {
    if (!selected || !quotePrice) return
    setQuoting(true)
    try {
      await fetch(`/api/bookings/${selected.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(quotePrice), note: quoteNote }),
      })
      setQuoteSent(true)
      await fetchBookings()
      setTimeout(() => {
        setSelected(null)
        setQuotePrice('')
        setQuoteNote('')
        setQuoteSent(false)
      }, 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setQuoting(false)
    }
  }

  const sendCustomerMessage = async () => {
    if (!selected || !messageText.trim()) return
    setSendingMessage(true)
    setMessageStatus('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selected.id, body: messageText }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessageStatus(data.error || 'Message failed')
        return
      }
      setMessageText('')
      setMessageStatus('Message sent and customer notified by email.')
    } catch {
      setMessageStatus('Network error')
    } finally {
      setSendingMessage(false)
    }
  }

  const signOut = async () => {
    try {
      await createClient().auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      router.push('/login?tab=staff')
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: '#7BA7C7' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <Link href="/" className="text-white/40 text-xs hover:text-white/80 transition-colors">← cleanngo home</Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Admin Dashboard</h1>
            <p className="text-white/50 mt-1">Manage quote requests &amp; jobs</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <button type="button" onClick={signOut}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <span aria-hidden="true">⎋</span> Sign out
            </button>
            {unread > 0 && (
              <div className="flex items-center gap-3 bg-amber-500/20 border border-amber-400/30 rounded-2xl px-5 py-3">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 font-semibold">{unread} new request{unread > 1 ? 's' : ''} awaiting quote</span>
              </div>
            )}
            {newApps > 0 && (
              <Link href="/admin/applications" className="flex items-center gap-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl px-5 py-3 hover:bg-emerald-500/30 transition-colors">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-semibold">{newApps} new application{newApps > 1 ? 's' : ''} →</span>
              </Link>
            )}
          </div>
        </div>

        {/* Section nav */}
        <nav className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="shrink-0 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Quotes', value: bookings.filter(b => b.status === 'pending').length, color: 'text-amber-300' },
            { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-blue-300' },
            { label: 'In Progress', value: bookings.filter(b => b.status === 'in_progress').length, color: 'text-purple-300' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'text-green-300' },
          ].map(stat => (
            <div key={stat.label} className="glass-strong rounded-2xl p-4 sm:p-5">
              <div className={`text-2xl font-bold sm:text-3xl ${stat.color}`}>{stat.value}</div>
              <div className="text-white/50 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent applications */}
        {apps.length > 0 && (
          <div className="glass-strong rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Cleaner applications</h2>
              <Link href="/admin/applications" className="text-sm text-[#7BA7C7] hover:text-white">View all →</Link>
            </div>
            <div className="space-y-2">
              {apps.slice(0, 4).map(a => (
                <Link key={a.id} href="/admin/applications" className="flex flex-col gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2.5 transition-colors min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
                  <span className="text-white/90 text-sm">{a.name} <span className="text-white/40">· {a.suburbs || 'area not set'}</span></span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'new' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/50'}`}>{a.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','pending','confirmed','in_progress','completed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === f
                  ? 'bg-white text-[#2C4A6E] border-white'
                  : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20'
              }`}>
              {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              {f === 'pending' && unread > 0 && (
                <span className="ml-2 bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking list */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="text-center py-20 text-white/40">Loading bookings...</div>
            ) : filtered.length === 0 ? (
              <div className="glass-strong rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <div className="text-white/40">No {filter === 'all' ? '' : filter} bookings yet</div>
              </div>
            ) : filtered.map(b => (
              <button key={b.id} onClick={() => { setSelected(b); setQuoteSent(false); setQuotePrice(b.price_cents > 0 ? String(b.price_cents / 100) : ''); setMessageText(''); setMessageStatus('') }}
                className={`w-full glass-strong rounded-2xl p-5 text-left transition-all hover:bg-white/20 border-2 ${
                  selected?.id === b.id ? 'border-white/50' : 'border-transparent'
                } ${b.status === 'pending' ? 'ring-1 ring-amber-400/30' : ''}`}>
                <div className="flex flex-col gap-3 mb-3 min-[520px]:flex-row min-[520px]:items-start min-[520px]:justify-between">
                  <div>
                    <div className="text-white font-semibold">{b.customers?.name || 'Customer'}</div>
                    <div className="text-white/50 text-sm">{SERVICE_LABELS[b.service_type] || b.service_type}</div>
                  </div>
                  <span className={`w-fit text-xs font-medium px-3 py-1 rounded-full border ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                    {b.status === 'pending' ? '⏳ Awaiting Quote' : b.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/40 text-xs">
                  <span>📅 {b.scheduled_date}</span>
                  <span>🛏 {b.bedrooms}bed · {b.bathrooms}bath</span>
                  <span>📍 {b.suburb || b.address?.split(',').pop()?.trim()}</span>
                  {b.price_cents > 0 && <span className="text-green-300 font-semibold">${(b.price_cents / 100).toFixed(0)} quoted</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Job detail + quote panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="glass-strong rounded-2xl p-5 sm:p-6 lg:sticky lg:top-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-bold text-lg">Job Detail</h3>
                  <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-xl">✕</button>
                </div>

                {/* Customer */}
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Customer</div>
                  <div className="text-white font-semibold">{selected.customers?.name}</div>
                  <div className="text-white/60 text-sm">{selected.customers?.email}</div>
                  <div className="text-white/60 text-sm">{selected.customers?.phone}</div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Message customer</div>
                  <textarea
                    rows={3}
                    placeholder="Write a message for the customer..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/30 text-sm resize-none"
                  />
                  {messageStatus && <div className="text-white/50 text-xs mt-2">{messageStatus}</div>}
                  <button
                    type="button"
                    onClick={sendCustomerMessage}
                    disabled={sendingMessage || !messageText.trim()}
                    className="w-full mt-3 py-2.5 rounded-xl bg-white text-[#2C4A6E] text-sm font-bold hover:bg-white/90 transition disabled:opacity-40"
                  >
                    {sendingMessage ? 'Sending...' : 'Send message + email'}
                  </button>
                </div>

                {/* Job info */}
                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Service', value: SERVICE_LABELS[selected.service_type] },
                    { label: 'Size', value: `${selected.bedrooms} bed · ${selected.bathrooms} bath` },
                    { label: 'Date', value: selected.scheduled_date },
                    { label: 'Time', value: selected.scheduled_time },
                    { label: 'Address', value: selected.address },
                  ].map(row => (
                    <div key={row.label} className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
                      <span className="text-white/40">{row.label}</span>
                      <span className="text-white font-medium sm:max-w-[160px] sm:text-right">{row.value}</span>
                    </div>
                  ))}
                  {selected.extras?.length > 0 && (
                    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
                      <span className="text-white/40">Extras</span>
                      <span className="text-white font-medium sm:max-w-[160px] sm:text-right">{selected.extras.join(', ')}</span>
                    </div>
                  )}
                  {selected.notes && (
                    <div className="mt-3 bg-white/5 rounded-xl p-3">
                      <div className="text-white/40 text-xs mb-1">Customer notes</div>
                      <div className="text-white/70 text-sm">{selected.notes}</div>
                    </div>
                  )}
                </div>

                {/* Quote panel */}
                {selected.status === 'pending' && !quoteSent && (
                  <div className="border-t border-white/20 pt-4">
                    <div className="text-white/70 font-semibold text-sm mb-3">💰 Send Quote to Customer</div>
                    <div className="mb-3">
                      <label className="text-white/50 text-xs mb-1 block">Quote price ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-semibold">$</span>
                        <input
                          type="number"
                          placeholder="e.g. 350"
                          value={quotePrice}
                          onChange={e => setQuotePrice(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl pl-7 pr-4 py-3 text-white placeholder-white/30 text-lg font-bold"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-white/50 text-xs mb-1 block">Note to customer (optional)</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. price includes oven & fridge clean"
                        value={quoteNote}
                        onChange={e => setQuoteNote(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={sendQuote}
                      disabled={quoting || !quotePrice}
                      className="w-full py-3 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition disabled:opacity-40"
                    >
                      {quoting ? 'Sending...' : `Send $${quotePrice || '—'} Quote →`}
                    </button>
                  </div>
                )}

                {quoteSent && (
                  <div className="border-t border-white/20 pt-4 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <div className="text-green-300 font-semibold">Quote sent!</div>
                    <div className="text-white/50 text-sm">Customer has been notified</div>
                  </div>
                )}

                {selected.status !== 'pending' && selected.price_cents > 0 && (
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">Quoted price</span>
                      <span className="text-2xl font-bold text-green-300">${(selected.price_cents / 100).toFixed(0)}</span>
                    </div>
                  </div>
                )}

                {/* Job management */}
                {selected.status !== 'pending' && selected.status !== 'cancelled' && (
                  <div className="border-t border-white/20 pt-4 mt-4 space-y-4">
                    <div>
                      <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">Assigned cleaner</label>
                      <select
                        value={selected.staff_id || ''}
                        disabled={savingBooking}
                        onChange={e => patchBooking({ staff_id: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm">
                        <option value="" className="text-black">— Unassigned —</option>
                        {cleaners.map(c => <option key={c.id} value={c.id} className="text-black">{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {(['confirmed', 'in_progress', 'completed', 'missed', 'cancelled'] as const).map(st => (
                          <button key={st} disabled={savingBooking || selected.status === st}
                            onClick={() => {
                              if (st === 'missed' && !confirm('Mark this visit as missed? This issues an account credit to the customer.')) return
                              patchBooking({ status: st })
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
                              selected.status === st ? 'bg-white text-[#2C4A6E] border-white' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                            }`}>
                            {st.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                      <p className="text-white/30 text-xs mt-2">Marking “missed” auto-credits the customer (reliability guarantee).</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-strong rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">👆</div>
                <div className="text-white/40 text-sm">Select a booking to view details and send a quote</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
