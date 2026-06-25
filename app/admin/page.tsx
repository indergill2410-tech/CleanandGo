'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
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
]

type Person = { name: string; email?: string | null; phone?: string | null; suburb?: string | null; role?: string | null; status?: string | null }
type Relation<T> = T | T[] | null
type Completion = { start_time: string | null; end_time: string | null; submitted_at: string | null; before_photos: string[] | null; after_photos: string[] | null; notes: string | null }
type Booking = {
  id: string
  customer_id: string
  service_type: string
  status: string
  scheduled_date: string
  scheduled_time: string
  address: string
  suburb: string
  state?: string | null
  postcode?: string | null
  bedrooms: number
  bathrooms: number
  extras: string[] | null
  photos?: string[] | null
  notes: string | null
  price_cents: number
  staff_id: string | null
  covered_by_backup?: boolean
  created_at: string
  updated_at?: string | null
  customers?: Relation<Person>
  staff?: Relation<Person>
  original_staff?: Relation<Person>
  job_completions?: Relation<Completion>
}

type Cleaner = { id: string; name: string; role: string; status?: string | null; suburb?: string | null; phone?: string | null; email?: string | null }
type Message = { id: string; sender_type: string; body: string; created_at: string }
type Conversation = {
  id: string
  subject: string | null
  booking_id: string | null
  customer_id: string | null
  last_message_at: string | null
  unread_admin_count: number
  last_message: Message | null
  messages: Message[]
}
type Metrics = { unreadNotifications: number; unreadMessages: number; openInvoiceCents: number; capturedPaymentCents: number }

const SERVICE_LABELS: Record<string, string> = {
  recurring: 'Recurring clean',
  oneoff: 'One-off clean',
  endoflease: 'End-of-lease clean',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  missed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
}

const STATUS_ACTIONS = ['pending', 'confirmed', 'in_progress', 'completed', 'missed', 'cancelled'] as const
const money = (cents?: number | null) => cents ? `$${(cents / 100).toFixed(2)}` : 'Not quoted'
const one = <T,>(value: Relation<T>) => Array.isArray(value) ? value[0] : value
const completion = (value: Booking['job_completions']) => one(value)
const timeLabel = (time?: string | null) => time ? time.slice(0, 5) : 'No time'
const dateLabel = (date?: string | null) => date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'No date'

export default function AdminDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [apps, setApps] = useState<{ id: string; name: string; suburbs: string | null; status: string }[]>([])
  const [cleaners, setCleaners] = useState<Cleaner[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [metrics, setMetrics] = useState<Metrics>({ unreadNotifications: 0, unreadMessages: 0, openInvoiceCents: 0, capturedPaymentCents: 0 })
  const [saving, setSaving] = useState(false)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteNote, setQuoteNote] = useState('')
  const [messageText, setMessageText] = useState('')
  const [messageStatus, setMessageStatus] = useState('')
  const [opsDraft, setOpsDraft] = useState({ scheduled_date: '', scheduled_time: '', address: '', suburb: '', notes: '' })

  const selected = useMemo(() => bookings.find((booking) => booking.id === selectedId) || bookings[0] || null, [bookings, selectedId])
  const filtered = useMemo(() => filter === 'all' ? bookings : bookings.filter((booking) => booking.status === filter), [bookings, filter])

  const fetchBookings = useCallback(async (keepSelected = true) => {
    const res = await fetch('/api/admin/operations')
    const data = await res.json()
    const list = data.bookings || []
    setBookings(list)
    setCleaners((data.staff || []).filter((staff: Cleaner) => staff.role === 'cleaner' && staff.status === 'active'))
    setApps(data.applications || [])
    setConversations(data.conversations || [])
    setMetrics(data.metrics || { unreadNotifications: 0, unreadMessages: 0, openInvoiceCents: 0, capturedPaymentCents: 0 })
    setLoading(false)
    if (!keepSelected || !selectedId) setSelectedId(list.find((b: Booking) => b.status === filter)?.id || list[0]?.id || '')
  }, [filter, selectedId])

  useEffect(() => {
    fetchBookings(false)
    const timer = window.setInterval(() => fetchBookings(true), 30000)
    return () => window.clearInterval(timer)
  }, [fetchBookings])

  useEffect(() => {
    if (!selected) return
    setOpsDraft({
      scheduled_date: selected.scheduled_date || '',
      scheduled_time: timeLabel(selected.scheduled_time),
      address: selected.address || '',
      suburb: selected.suburb || '',
      notes: selected.notes || '',
    })
    setQuotePrice(selected.price_cents > 0 ? String(selected.price_cents / 100) : '')
    setQuoteNote('')
    setMessageText('')
    setMessageStatus('')
  }, [selected])

  const counts = useMemo(() => ({
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    missed: bookings.filter(b => b.status === 'missed').length,
  }), [bookings])

  const newApps = apps.filter(app => app.status === 'new').length

  const patchBooking = async (updates: Record<string, string | null>) => {
    if (!selected) return
    if (updates.status === 'missed' && !confirm('Mark this job as missed? This can issue an account credit to the customer.')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/bookings/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Update failed'); return }
      await fetchBookings(true)
    } catch {
      alert('Network error')
    } finally {
      setSaving(false)
    }
  }

  const sendQuote = async () => {
    if (!selected || !quotePrice) return
    setSaving(true)
    try {
      const res = await fetch(`/api/bookings/${selected.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(quotePrice), note: quoteNote }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { alert(data.error || 'Quote failed'); return }
      await fetchBookings(true)
    } finally {
      setSaving(false)
    }
  }

  const sendCustomerMessage = async () => {
    if (!selected || !messageText.trim()) return
    setSaving(true)
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
      setMessageStatus('Message sent to the customer and saved in their app.')
      await fetchBookings(true)
    } catch {
      setMessageStatus('Network error')
    } finally {
      setSaving(false)
    }
  }

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/login?tab=staff')
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-[#172434]">
      <header className="border-b border-[#DCE5ED] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/" className="text-sm font-bold text-[#2F7D6B]">cleanngo home</Link>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Operations control centre</h1>
              <p className="mt-1 text-[#657380]">Quote, assign, message, schedule, and recover every job from one screen.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {counts.pending > 0 && <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-100 px-5 text-sm font-black text-amber-800"><AlertTriangle className="h-4 w-4" />{counts.pending} quote{counts.pending === 1 ? '' : 's'} waiting</span>}
              {metrics.unreadMessages > 0 && <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-100 px-5 text-sm font-black text-blue-800"><MessageCircle className="h-4 w-4" />{metrics.unreadMessages} customer message{metrics.unreadMessages === 1 ? '' : 's'}</span>}
              {newApps > 0 && <Link href="/admin/applications" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-100 px-5 text-sm font-black text-emerald-800">{newApps} new applicant{newApps === 1 ? '' : 's'}</Link>}
              <button onClick={signOut} className="min-h-11 rounded-full border border-[#DCE5ED] px-5 text-sm font-bold text-[#657380]">Sign out</button>
            </div>
          </div>
          <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {NAV.map(item => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-[#DCE5ED] bg-white px-4 py-2 text-sm font-black text-[#172434] hover:border-[#2F7D6B]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="grid gap-4 md:grid-cols-5">
          {[
            { label: 'Awaiting quote', value: counts.pending, icon: CreditCard, color: 'text-amber-600' },
            { label: 'Confirmed', value: counts.confirmed, icon: CalendarDays, color: 'text-blue-600' },
            { label: 'In progress', value: counts.in_progress, icon: Clock, color: 'text-amber-600' },
            { label: 'Completed', value: counts.completed, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'Needs recovery', value: counts.missed, icon: ShieldCheck, color: 'text-red-600' },
          ].map((item) => (
            <button key={item.label} onClick={() => setFilter(item.label === 'Awaiting quote' ? 'pending' : item.label === 'Needs recovery' ? 'missed' : item.label.toLowerCase().replace(' ', '_'))} className="rounded-[8px] border border-[#DCE5ED] bg-white p-4 text-left shadow-sm">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <div className="mt-4 text-3xl font-black">{item.value}</div>
              <div className="text-sm font-semibold text-[#657380]">{item.label}</div>
            </button>
          ))}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[8px] border border-[#DCE5ED] bg-white p-4 shadow-sm">
            <Bell className="h-5 w-5 text-[#2F7D6B]" />
            <div className="mt-3 text-2xl font-black">{metrics.unreadNotifications}</div>
            <div className="text-sm font-semibold text-[#657380]">Unread admin alerts</div>
          </div>
          <div className="rounded-[8px] border border-[#DCE5ED] bg-white p-4 shadow-sm">
            <MessageCircle className="h-5 w-5 text-[#2F7D6B]" />
            <div className="mt-3 text-2xl font-black">{metrics.unreadMessages}</div>
            <div className="text-sm font-semibold text-[#657380]">Unread customer messages</div>
          </div>
          <div className="rounded-[8px] border border-[#DCE5ED] bg-white p-4 shadow-sm">
            <CreditCard className="h-5 w-5 text-[#2F7D6B]" />
            <div className="mt-3 text-2xl font-black">{money(metrics.openInvoiceCents)}</div>
            <div className="text-sm font-semibold text-[#657380]">Open invoices</div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[8px] border border-[#DCE5ED] bg-white shadow-sm">
            <div className="border-b border-[#DCE5ED] p-4">
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'missed', 'cancelled'].map((status) => (
                  <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-black ${filter === status ? 'bg-[#172434] text-white' : 'bg-[#F4F7FA] text-[#657380]'}`}>
                    {status === 'all' ? 'All jobs' : status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[calc(100vh-22rem)] overflow-y-auto p-3">
              {loading ? (
                <div className="p-10 text-center text-[#657380]">Loading jobs...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-[#657380]">No jobs in this view.</div>
              ) : filtered.map((booking) => {
                const customer = one(booking.customers)
                const staff = one(booking.staff)
                return (
                  <button key={booking.id} onClick={() => setSelectedId(booking.id)} className={`mb-3 w-full rounded-[8px] border p-4 text-left transition ${selected?.id === booking.id ? 'border-[#172434] bg-[#EEF5FA]' : 'border-[#E4EAF0] bg-white hover:border-[#9DB6CA]'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black">{customer?.name || 'Customer'} · {SERVICE_LABELS[booking.service_type] || booking.service_type}</div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#657380]">
                          <span>{dateLabel(booking.scheduled_date)} {timeLabel(booking.scheduled_time)}</span>
                          <span>{booking.suburb || booking.address}</span>
                          <span>{money(booking.price_cents)}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>{booking.status.replace('_', ' ')}</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                      <span className="rounded bg-[#F4F7FA] px-2 py-1 font-bold text-[#657380]">{booking.bedrooms} bed / {booking.bathrooms} bath</span>
                      <span className="rounded bg-[#F4F7FA] px-2 py-1 font-bold text-[#657380]">{staff?.name || 'Cleaner unassigned'}</span>
                      <span className="rounded bg-[#F4F7FA] px-2 py-1 font-bold text-[#657380]">{(booking.extras || []).length} extras</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[8px] border border-[#DCE5ED] bg-white shadow-sm">
            {selected ? (
              <JobInspector
                booking={selected}
                cleaners={cleaners}
                opsDraft={opsDraft}
                setOpsDraft={setOpsDraft}
                saving={saving}
                quotePrice={quotePrice}
                quoteNote={quoteNote}
                setQuotePrice={setQuotePrice}
                setQuoteNote={setQuoteNote}
                messageText={messageText}
                setMessageText={setMessageText}
                messageStatus={messageStatus}
                conversations={conversations.filter((conversation) => conversation.booking_id === selected.id)}
                onPatch={patchBooking}
                onQuote={sendQuote}
                onMessage={sendCustomerMessage}
              />
            ) : (
              <div className="p-10 text-center text-[#657380]">Select a job to see full controls.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function JobInspector({
  booking,
  cleaners,
  opsDraft,
  setOpsDraft,
  saving,
  quotePrice,
  quoteNote,
  setQuotePrice,
  setQuoteNote,
  messageText,
  setMessageText,
  messageStatus,
  conversations,
  onPatch,
  onQuote,
  onMessage,
}: {
  booking: Booking
  cleaners: Cleaner[]
  opsDraft: { scheduled_date: string; scheduled_time: string; address: string; suburb: string; notes: string }
  setOpsDraft: (draft: { scheduled_date: string; scheduled_time: string; address: string; suburb: string; notes: string }) => void
  saving: boolean
  quotePrice: string
  quoteNote: string
  setQuotePrice: (value: string) => void
  setQuoteNote: (value: string) => void
  messageText: string
  setMessageText: (value: string) => void
  messageStatus: string
  conversations: Conversation[]
  onPatch: (updates: Record<string, string | null>) => Promise<void>
  onQuote: () => Promise<void>
  onMessage: () => Promise<void>
}) {
  const customer = one(booking.customers)
  const staff = one(booking.staff)
  const done = completion(booking.job_completions)
  const customerPhotos = booking.photos || []
  const beforePhotos = done?.before_photos || []
  const afterPhotos = done?.after_photos || []
  const photoCount = customerPhotos.length + beforePhotos.length + afterPhotos.length
  const thread = conversations[0]

  return (
    <div>
      <div className="border-b border-[#DCE5ED] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2F7D6B]">Job control</p>
            <h2 className="mt-1 text-2xl font-black">{SERVICE_LABELS[booking.service_type] || booking.service_type}</h2>
            <p className="mt-1 text-sm text-[#657380]">Ref {booking.id.slice(0, 8)} · created {new Date(booking.created_at).toLocaleDateString()}</p>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>{booking.status.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-2">
        <section className="rounded-[8px] bg-[#F4F7FA] p-4">
          <h3 className="flex items-center gap-2 font-black"><UserRound className="h-5 w-5 text-[#2F7D6B]" />Customer</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="font-black">{customer?.name || 'Customer'}</div>
            <div className="flex items-center gap-2 text-[#657380]"><Mail className="h-4 w-4" />{customer?.email || 'No email'}</div>
            <div className="flex items-center gap-2 text-[#657380]"><Phone className="h-4 w-4" />{customer?.phone || 'No phone'}</div>
          </div>
        </section>

        <section className="rounded-[8px] bg-[#F4F7FA] p-4">
          <h3 className="flex items-center gap-2 font-black"><Home className="h-5 w-5 text-[#2F7D6B]" />Job detail</h3>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-[#657380]"><MapPin className="h-4 w-4" />{booking.address}</div>
            <div className="flex items-center gap-2 text-[#657380]"><CalendarDays className="h-4 w-4" />{dateLabel(booking.scheduled_date)} at {timeLabel(booking.scheduled_time)}</div>
            <div className="font-bold">{booking.bedrooms} bedrooms · {booking.bathrooms} bathrooms · {money(booking.price_cents)}</div>
            {(booking.extras || []).length > 0 && <div className="text-[#657380]">Extras: {(booking.extras || []).join(', ')}</div>}
            {booking.notes && <div className="rounded bg-white p-3 text-[#657380]">{booking.notes}</div>}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4">
          <h3 className="font-black">Quote and payment</h3>
          <p className="mt-1 text-sm text-[#657380]">Send a clear customer quote and move the job toward confirmation.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr]">
            <input type="number" placeholder="Price" value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
            <input placeholder="Customer note, optional" value={quoteNote} onChange={(e) => setQuoteNote(e.target.value)} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
          </div>
          <button onClick={onQuote} disabled={saving || !quotePrice} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#172434] px-5 text-sm font-black text-white disabled:opacity-50">
            <CreditCard className="h-4 w-4" />
            Send quote
          </button>
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4">
          <h3 className="font-black">Cleaner assignment</h3>
          <p className="mt-1 text-sm text-[#657380]">Current cleaner: <span className="font-bold text-[#172434]">{staff?.name || 'Unassigned'}</span></p>
          <select value={booking.staff_id || ''} disabled={saving} onChange={(e) => onPatch({ staff_id: e.target.value || null })} className="mt-4 w-full rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm">
            <option value="">Unassigned</option>
            {cleaners.map((cleaner) => <option key={cleaner.id} value={cleaner.id}>{cleaner.name}{cleaner.suburb ? ` · ${cleaner.suburb}` : ''}</option>)}
          </select>
          {booking.covered_by_backup && <p className="mt-2 text-sm font-bold text-amber-700">Backup coverage is active for this job.</p>}
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4 xl:col-span-2">
          <h3 className="font-black">Schedule and service notes</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <input type="date" value={opsDraft.scheduled_date} onChange={(e) => setOpsDraft({ ...opsDraft, scheduled_date: e.target.value })} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
            <input type="time" value={opsDraft.scheduled_time} onChange={(e) => setOpsDraft({ ...opsDraft, scheduled_time: e.target.value })} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
            <input value={opsDraft.address} onChange={(e) => setOpsDraft({ ...opsDraft, address: e.target.value })} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm md:col-span-2" placeholder="Address" />
            <input value={opsDraft.suburb} onChange={(e) => setOpsDraft({ ...opsDraft, suburb: e.target.value })} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" placeholder="Suburb" />
          </div>
          <textarea rows={3} value={opsDraft.notes} onChange={(e) => setOpsDraft({ ...opsDraft, notes: e.target.value })} className="mt-3 w-full rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" placeholder="Internal job notes and customer preferences" />
          <button disabled={saving} onClick={() => onPatch(opsDraft)} className="mt-3 rounded-full border border-[#172434] px-5 py-3 text-sm font-black text-[#172434] disabled:opacity-50">Save schedule and notes</button>
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4">
          <h3 className="font-black">Status controls</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUS_ACTIONS.map((status) => (
              <button key={status} disabled={saving || booking.status === status} onClick={() => onPatch({ status })} className={`rounded-full border px-4 py-2 text-sm font-black disabled:opacity-40 ${booking.status === status ? 'bg-[#172434] text-white' : 'border-[#DCE5ED] text-[#172434]'}`}>
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4">
          <h3 className="font-black">Proof and completion</h3>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded bg-[#F4F7FA] p-3"><div className="font-black">{photoCount}</div><div className="text-[#657380]">photos</div></div>
            <div className="rounded bg-[#F4F7FA] p-3"><div className="font-black">{done?.start_time ? 'Yes' : 'No'}</div><div className="text-[#657380]">started</div></div>
            <div className="rounded bg-[#F4F7FA] p-3"><div className="font-black">{done?.submitted_at ? 'Yes' : 'No'}</div><div className="text-[#657380]">submitted</div></div>
          </div>
          {done?.notes && <p className="mt-3 rounded bg-[#F4F7FA] p-3 text-sm text-[#657380]">{done.notes}</p>}
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4 xl:col-span-2">
          <h3 className="flex items-center gap-2 font-black"><Camera className="h-5 w-5 text-[#2F7D6B]" />Job photos</h3>
          <p className="mt-1 text-sm text-[#657380]">Customer-uploaded photos and cleaner proof photos stay visible here for admin review.</p>
          <PhotoStrip title="Customer request photos" photos={customerPhotos} />
          <PhotoStrip title="Cleaner before photos" photos={beforePhotos} />
          <PhotoStrip title="Cleaner after photos" photos={afterPhotos} />
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4 xl:col-span-2">
          <h3 className="flex items-center gap-2 font-black"><MessageCircle className="h-5 w-5 text-[#2F7D6B]" />Message customer in-app</h3>
          <p className="mt-1 text-sm text-[#657380]">Use clear, reassuring customer language. This appears in their Cleanngo account and sends an email notification.</p>
          <textarea rows={4} value={messageText} onChange={(e) => setMessageText(e.target.value)} className="mt-4 w-full rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" placeholder="Example: Hi Jane, your quote is ready. We included the oven reset you requested and can confirm Tuesday at 9:00." />
          {messageStatus && <p className="mt-2 text-sm font-bold text-[#172434]">{messageStatus}</p>}
          <button onClick={onMessage} disabled={saving || !messageText.trim()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#172434] px-5 text-sm font-black text-white disabled:opacity-50">
            <Send className="h-4 w-4" />
            Send message
          </button>
          {thread && (
            <div className="mt-5 rounded-[8px] bg-[#F4F7FA] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-black">Conversation history</h4>
                {thread.unread_admin_count > 0 && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">{thread.unread_admin_count} unread</span>}
              </div>
              <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
                {thread.messages.length === 0 ? (
                  <div className="text-sm text-[#657380]">No messages yet.</div>
                ) : thread.messages.map((message) => (
                  <div key={message.id} className={`rounded-[8px] p-3 text-sm ${message.sender_type === 'admin' ? 'bg-white text-[#172434]' : 'bg-[#172434] text-white'}`}>
                    <div className="whitespace-pre-wrap">{message.body}</div>
                    <div className={`mt-2 text-xs ${message.sender_type === 'admin' ? 'text-[#657380]' : 'text-white/55'}`}>
                      {message.sender_type === 'admin' ? 'Admin' : 'Customer'} · {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function PhotoStrip({ title, photos }: { title: string; photos: string[] }) {
  return (
    <div className="mt-4">
      <div className="text-xs font-black uppercase tracking-[0.14em] text-[#657380]">{title}</div>
      {photos.length === 0 ? (
        <div className="mt-2 rounded-[8px] bg-[#F4F7FA] p-4 text-sm text-[#657380]">No photos uploaded.</div>
      ) : (
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((src, index) => (
            <a key={`${src}-${index}`} href={src} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[8px] border border-[#DCE5ED] bg-[#F4F7FA]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${title} ${index + 1}`} className="aspect-video w-full object-cover transition group-hover:scale-[1.02]" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
