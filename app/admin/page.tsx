'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Filter,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRound,
  UsersRound,
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

const STATUS_ACTIONS = ['pending', 'confirmed', 'in_progress', 'completed', 'missed', 'cancelled'] as const
const FILTERS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'missed', 'cancelled'] as const

type Person = { name: string; email?: string | null; phone?: string | null; suburb?: string | null; role?: string | null; status?: string | null }
type Relation<T> = T | T[] | null
type Completion = { start_time: string | null; end_time: string | null; submitted_at: string | null; before_photos: string[] | null; after_photos: string[] | null; notes: string | null }
type Booking = {
  id: string
  customer_id: string
  service_type: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
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
type AdminNotification = { id: string; type: string; title: string; message: string; booking_id: string | null; customer_email?: string | null; read: boolean; created_at: string }
type Metrics = { unreadNotifications: number; unreadMessages: number; openInvoiceCents: number; capturedPaymentCents: number }
type OpsDraft = { scheduled_date: string; scheduled_time: string; address: string; suburb: string; notes: string }

const SERVICE_LABELS: Record<string, string> = {
  recurring: 'Recurring clean',
  oneoff: 'One-off clean',
  endoflease: 'End-of-lease clean',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-100 text-amber-800',
  confirmed: 'border-blue-200 bg-blue-100 text-blue-800',
  in_progress: 'border-sky-200 bg-sky-100 text-sky-800',
  completed: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  missed: 'border-red-200 bg-red-100 text-red-800',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-700',
}

const money = (cents?: number | null) => cents ? `$${(cents / 100).toFixed(2)}` : 'Not quoted'
const one = <T,>(value: Relation<T>) => Array.isArray(value) ? value[0] : value
const completion = (value: Booking['job_completions']) => one(value)
const timeLabel = (time?: string | null) => time ? time.slice(0, 5) : 'No time'
const dateLabel = (date?: string | null) => date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'No date'
const shortDateTime = (value?: string | null) => value ? new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Now'
const quoteAgeMinutes = (booking: Booking) => Math.max(0, Math.round((Date.now() - new Date(booking.created_at).getTime()) / 60000))
const statusLabel = (status: string) => status === 'all' ? 'All jobs' : status.replace('_', ' ')

const urgencyFor = (booking: Booking, unreadAlerts: number) => {
  if (booking.status === 'missed') return { label: 'Recovery', className: 'border-red-200 bg-red-50 text-red-700' }
  if (unreadAlerts > 0) return { label: 'New alert', className: 'border-blue-200 bg-blue-50 text-blue-700' }
  if (booking.status === 'pending' && quoteAgeMinutes(booking) >= 60) return { label: 'Quote due', className: 'border-amber-200 bg-amber-50 text-amber-700' }
  if (!booking.staff_id && ['pending', 'confirmed'].includes(booking.status)) return { label: 'Assign', className: 'border-sky-200 bg-sky-50 text-sky-700' }
  return { label: 'Normal', className: 'border-slate-200 bg-slate-50 text-slate-600' }
}

const priorityScore = (booking: Booking, unreadAlerts: number) => {
  if (booking.status === 'missed') return 90
  if (unreadAlerts > 0) return 80
  if (booking.status === 'pending' && quoteAgeMinutes(booking) >= 60) return 70
  if (!booking.staff_id && ['pending', 'confirmed'].includes(booking.status)) return 60
  if (booking.status === 'in_progress') return 40
  return 10
}

export default function AdminDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [query, setQuery] = useState('')
  const [apps, setApps] = useState<{ id: string; name: string; suburbs: string | null; status: string }[]>([])
  const [cleaners, setCleaners] = useState<Cleaner[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [metrics, setMetrics] = useState<Metrics>({ unreadNotifications: 0, unreadMessages: 0, openInvoiceCents: 0, capturedPaymentCents: 0 })
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteNote, setQuoteNote] = useState('')
  const [messageText, setMessageText] = useState('')
  const [messageStatus, setMessageStatus] = useState('')
  const [opsDraft, setOpsDraft] = useState<OpsDraft>({ scheduled_date: '', scheduled_time: '', address: '', suburb: '', notes: '' })

  const notificationCountByBooking = useMemo(() => {
    const counts = new Map<string, number>()
    for (const notification of notifications) {
      if (notification.booking_id && !notification.read) counts.set(notification.booking_id, (counts.get(notification.booking_id) || 0) + 1)
    }
    return counts
  }, [notifications])
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return bookings
      .filter((booking) => filter === 'all' || booking.status === filter)
      .filter((booking) => {
        if (!term) return true
        const customer = one(booking.customers)
        return [
          customer?.name,
          customer?.email,
          customer?.phone,
          booking.address,
          booking.suburb,
          booking.service_type,
          booking.id,
        ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term))
      })
      .sort((a, b) => {
        const priorityDiff = priorityScore(b, notificationCountByBooking.get(b.id) || 0) - priorityScore(a, notificationCountByBooking.get(a.id) || 0)
        if (priorityDiff !== 0) return priorityDiff
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [bookings, filter, notificationCountByBooking, query])
  const selected = useMemo(() => bookings.find((booking) => booking.id === selectedId) || filtered[0] || bookings[0] || null, [bookings, filtered, selectedId])
  const selectedAlerts = useMemo(() => selected ? notifications.filter((notification) => notification.booking_id === selected.id) : [], [notifications, selected])

  const counts = useMemo(() => ({
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
    in_progress: bookings.filter((booking) => booking.status === 'in_progress').length,
    completed: bookings.filter((booking) => booking.status === 'completed').length,
    missed: bookings.filter((booking) => booking.status === 'missed').length,
  }), [bookings])

  const todayKey = new Date().toISOString().slice(0, 10)
  const newApps = apps.filter((app) => app.status === 'new').length
  const todayJobs = bookings.filter((booking) => booking.scheduled_date === todayKey && !['completed', 'cancelled'].includes(booking.status)).length
  const overdueQuotes = bookings.filter((booking) => booking.status === 'pending' && quoteAgeMinutes(booking) >= 60).length
  const unassignedJobs = bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status) && !booking.staff_id).length
  const activeCleaners = cleaners.filter((cleaner) => cleaner.status === 'active').length
  const activeJobs = counts.confirmed + counts.in_progress
  const quoteSlaPercent = counts.pending > 0 ? Math.max(0, Math.round(((counts.pending - overdueQuotes) / counts.pending) * 100)) : 100
  const latestAlerts = notifications.slice(0, 5)
  const selectedThread = selected ? conversations.find((conversation) => conversation.booking_id === selected.id) : null

  const fetchBookings = useCallback(async (keepSelected = true) => {
    try {
      const res = await fetch('/api/admin/operations')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoadError(data.error || 'Could not load operations.')
        setLoading(false)
        return
      }
      const list = data.bookings || []
      setLoadError('')
      setBookings(list)
      setCleaners((data.staff || []).filter((staff: Cleaner) => staff.role === 'cleaner' && staff.status === 'active'))
      setApps(data.applications || [])
      setNotifications(data.notifications || [])
      setConversations(data.conversations || [])
      setMetrics(data.metrics || { unreadNotifications: 0, unreadMessages: 0, openInvoiceCents: 0, capturedPaymentCents: 0 })
      setLoading(false)
      if (!keepSelected || !selectedId) setSelectedId(list.find((booking: Booking) => booking.status === filter)?.id || list[0]?.id || '')
    } catch {
      setLoadError('Network error while loading operations.')
      setLoading(false)
    }
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
    <main className="min-h-screen bg-[#EAF3F8] text-[#0B3558]">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-64 shrink-0 border-r border-[#C7DAE8] bg-[#082E4C] px-4 py-5 text-white xl:flex xl:flex-col">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-black">
            cleanngo <ArrowUpRight className="h-4 w-4 text-[#7DD3FC]" />
          </Link>
          <div className="mt-8 rounded-[8px] border border-white/10 bg-white/[0.08] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7DD3FC]">Control room</p>
            <div className="mt-3 text-3xl font-black">{counts.pending}</div>
            <p className="mt-1 text-sm font-bold text-white/[0.65]">jobs waiting for quote</p>
          </div>
          <nav className="mt-6 space-y-1">
            <Link href="/admin" className="flex min-h-10 items-center gap-3 rounded-[8px] bg-white px-3 text-sm font-black text-[#082E4C]">
              <ClipboardList className="h-4 w-4" />
              Console
            </Link>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex min-h-10 items-center rounded-[8px] px-3 text-sm font-bold text-white/[0.68] hover:bg-white/10 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-[8px] border border-white/10 bg-white/[0.08] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7DD3FC]">Today</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xl font-black">{todayJobs}</div>
                <div className="text-white/[0.55]">on road</div>
              </div>
              <div>
                <div className="text-xl font-black">{activeCleaners}</div>
                <div className="text-white/[0.55]">cleaners</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#C7DAE8] bg-white/[0.92] px-4 py-4 backdrop-blur sm:px-6 xl:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D7ED0]">Operations command centre</p>
                <h1 className="mt-1 text-2xl font-black sm:text-4xl">Run quotes, dispatch, messages, and recovery</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/customer/book" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0B3558] px-5 text-sm font-black text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  New customer job
                </Link>
                <button onClick={() => { setLoading(true); fetchBookings(true) }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#CFE0ED] bg-white px-4 text-sm font-black text-[#0B3558]">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
                <button onClick={signOut} className="min-h-11 rounded-full border border-[#CFE0ED] bg-white px-5 text-sm font-black text-[#60798F]">Sign out</button>
              </div>
            </div>
            <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 xl:hidden">
              <Link href="/admin" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0B3558] px-4 py-2 text-sm font-black text-white">
                <ClipboardList className="h-4 w-4" />
                Console
              </Link>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-[#CFE0ED] bg-white px-4 py-2 text-sm font-black text-[#0B3558]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <div className="px-4 py-5 sm:px-6 xl:px-8">
            {loadError && (
              <section className="mb-5 rounded-[8px] border border-red-200 bg-red-50 p-4 text-red-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-black">Admin data could not load</h2>
                    <p className="mt-1 text-sm">{loadError}</p>
                  </div>
                  <button onClick={() => { setLoading(true); fetchBookings(false) }} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-red-900 px-4 text-sm font-black text-white">
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </button>
                </div>
              </section>
            )}

            <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-6">
              {[
                { label: 'Quote backlog', value: counts.pending, helper: `${overdueQuotes} outside SLA`, icon: ClipboardList, tone: 'text-amber-600', filterValue: 'pending' },
                { label: 'Active jobs', value: activeJobs, helper: `${counts.in_progress} in progress`, icon: CalendarDays, tone: 'text-blue-600', filterValue: 'confirmed' },
                { label: 'Unassigned', value: unassignedJobs, helper: `${activeCleaners} active cleaners`, icon: UsersRound, tone: 'text-sky-600', filterValue: 'all' },
                { label: 'Recovery', value: counts.missed, helper: 'needs follow-up', icon: ShieldCheck, tone: 'text-red-600', filterValue: 'missed' },
                { label: 'Messages', value: metrics.unreadMessages, helper: 'customer replies', icon: MessageCircle, tone: 'text-[#1D7ED0]', filterValue: 'all' },
                { label: 'Open invoices', value: money(metrics.openInvoiceCents), helper: `${money(metrics.capturedPaymentCents)} captured`, icon: CircleDollarSign, tone: 'text-emerald-600', filterValue: 'all' },
              ].map((item) => (
                <button key={item.label} onClick={() => setFilter(item.filterValue)} className="min-h-32 rounded-[8px] border border-[#CFE0ED] bg-white p-4 text-left shadow-sm transition hover:border-[#8BBFE2]">
                  <div className="flex items-center justify-between gap-3">
                    <item.icon className={`h-5 w-5 ${item.tone}`} />
                    <ChevronRight className="h-4 w-4 text-[#8BA1B2]" />
                  </div>
                  <div className="mt-4 truncate text-3xl font-black">{item.value}</div>
                  <div className="mt-1 text-sm font-black">{item.label}</div>
                  <div className="mt-1 text-xs font-bold text-[#60798F]">{item.helper}</div>
                </button>
              ))}
            </section>

            <section className="mt-5 grid gap-5 2xl:grid-cols-[430px_minmax(0,1fr)_320px]">
              <aside className="rounded-[8px] border border-[#CFE0ED] bg-white shadow-sm">
                <div className="border-b border-[#DCE5ED] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#1D7ED0]"><Filter className="h-4 w-4" /> Priority queue</p>
                      <h2 className="mt-1 text-xl font-black">{filtered.length} job{filtered.length === 1 ? '' : 's'} in view</h2>
                    </div>
                    <span className="rounded-full bg-[#EEF5FA] px-3 py-1 text-xs font-black text-[#60798F]">auto-prioritised</span>
                  </div>
                  <div className="mt-4">
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search customer, suburb, phone, ref"
                      className="h-11 w-full rounded-full border border-[#CFE0ED] bg-[#F8FBFD] px-4 text-sm font-bold outline-none focus:border-[#1D7ED0]"
                    />
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {FILTERS.map((status) => (
                      <button key={status} onClick={() => setFilter(status)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${filter === status ? 'bg-[#0B3558] text-white' : 'bg-[#F4F7FA] text-[#60798F]'}`}>
                        {statusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-[calc(100vh-18rem)] overflow-y-auto p-3">
                  {loading ? (
                    <div className="p-10 text-center text-[#60798F]">Loading jobs...</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-[#60798F]">No jobs match this view.</div>
                  ) : filtered.map((booking) => {
                    const customer = one(booking.customers)
                    const staff = one(booking.staff)
                    const unreadAlerts = notificationCountByBooking.get(booking.id) || 0
                    const urgency = urgencyFor(booking, unreadAlerts)
                    return (
                      <button key={booking.id} onClick={() => setSelectedId(booking.id)} className={`mb-3 w-full rounded-[8px] border p-4 text-left transition ${selected?.id === booking.id ? 'border-[#0B3558] bg-[#EEF5FA] shadow-sm' : 'border-[#E4EAF0] bg-white hover:border-[#9DB6CA]'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-black">{customer?.name || 'Customer'}</div>
                            <div className="mt-1 truncate text-sm font-bold text-[#60798F]">{SERVICE_LABELS[booking.service_type] || booking.service_type} - {booking.suburb || booking.address}</div>
                          </div>
                          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>{booking.status.replace('_', ' ')}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className={`rounded-full border px-3 py-1 font-black ${urgency.className}`}>{urgency.label}</span>
                          {booking.status === 'pending' && <span className="rounded-full border border-[#DCE5ED] bg-white px-3 py-1 font-black text-[#60798F]">{quoteAgeMinutes(booking)} min old</span>}
                          {unreadAlerts > 0 && <span className="rounded-full bg-[#1D7ED0] px-3 py-1 font-black text-white">{unreadAlerts} alert{unreadAlerts === 1 ? '' : 's'}</span>}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                          <span className="rounded bg-[#F4F7FA] px-2 py-1 font-bold text-[#60798F]">{dateLabel(booking.scheduled_date)}</span>
                          <span className="rounded bg-[#F4F7FA] px-2 py-1 font-bold text-[#60798F]">{money(booking.price_cents)}</span>
                          <span className="rounded bg-[#F4F7FA] px-2 py-1 font-bold text-[#60798F]">{staff?.name || 'Unassigned'}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <section className="min-w-0 overflow-hidden rounded-[8px] border border-[#CFE0ED] bg-white shadow-sm">
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
                    alerts={selectedAlerts}
                    onPatch={patchBooking}
                    onQuote={sendQuote}
                    onMessage={sendCustomerMessage}
                  />
                ) : (
                  <div className="p-10 text-center text-[#60798F]">Select a job to see full controls.</div>
                )}
              </section>

              <aside className="space-y-5">
                <section className="rounded-[8px] border border-[#CFE0ED] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1D7ED0]">SLA board</p>
                  <div className="mt-4">
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-black">{quoteSlaPercent}%</div>
                      <div className="text-sm font-bold text-[#60798F]">quote health</div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#E1EAF2]">
                      <div className="h-2 rounded-full bg-[#1D7ED0]" style={{ width: `${quoteSlaPercent}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm">
                    <div className="flex justify-between rounded-[8px] bg-[#F8FBFD] px-3 py-2"><span className="font-bold text-[#60798F]">Overdue quotes</span><span className="font-black">{overdueQuotes}</span></div>
                    <div className="flex justify-between rounded-[8px] bg-[#F8FBFD] px-3 py-2"><span className="font-bold text-[#60798F]">Unread alerts</span><span className="font-black">{metrics.unreadNotifications}</span></div>
                    <div className="flex justify-between rounded-[8px] bg-[#F8FBFD] px-3 py-2"><span className="font-bold text-[#60798F]">New applicants</span><span className="font-black">{newApps}</span></div>
                  </div>
                </section>

                <section className="rounded-[8px] border border-[#CFE0ED] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Selected signal</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[8px] bg-[#F8FBFD] p-3">
                      <div className="text-sm font-bold text-[#60798F]">Conversation</div>
                      <div className="mt-1 text-2xl font-black">{selectedThread?.unread_admin_count || 0}</div>
                    </div>
                    <div className="rounded-[8px] bg-[#F8FBFD] p-3">
                      <div className="text-sm font-bold text-[#60798F]">Job alerts</div>
                      <div className="mt-1 text-2xl font-black">{selectedAlerts.filter((alert) => !alert.read).length}</div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[8px] border border-[#CFE0ED] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Latest alerts</p>
                  <div className="mt-4 space-y-3">
                    {latestAlerts.length === 0 ? (
                      <p className="text-sm font-bold text-[#60798F]">No admin alerts yet.</p>
                    ) : latestAlerts.map((alert) => (
                      <div key={alert.id} className="border-l-2 border-[#1D7ED0] pl-3">
                        <div className="text-sm font-black">{alert.title}</div>
                        <div className="mt-1 line-clamp-2 text-xs font-bold text-[#60798F]">{alert.message}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </section>
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
  alerts,
  onPatch,
  onQuote,
  onMessage,
}: {
  booking: Booking
  cleaners: Cleaner[]
  opsDraft: OpsDraft
  setOpsDraft: (draft: OpsDraft) => void
  saving: boolean
  quotePrice: string
  quoteNote: string
  setQuotePrice: (value: string) => void
  setQuoteNote: (value: string) => void
  messageText: string
  setMessageText: (value: string) => void
  messageStatus: string
  conversations: Conversation[]
  alerts: AdminNotification[]
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
  const unreadAlerts = alerts.filter((alert) => !alert.read).length
  const urgency = urgencyFor(booking, unreadAlerts)

  return (
    <div>
      <div className="border-b border-[#DCE5ED] bg-[#F8FBFD] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Job control</p>
            <h2 className="mt-1 text-2xl font-black">{SERVICE_LABELS[booking.service_type] || booking.service_type}</h2>
            <p className="mt-1 text-sm text-[#60798F]">Ref {booking.id.slice(0, 8)} - created {shortDateTime(booking.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${urgency.className}`}>{urgency.label}</span>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>{booking.status.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Quote age', value: `${quoteAgeMinutes(booking)} min`, icon: Timer },
            { label: 'Price', value: money(booking.price_cents), icon: CreditCard },
            { label: 'Cleaner', value: staff?.name || 'Unassigned', icon: UsersRound },
            { label: 'Alerts', value: String(unreadAlerts), icon: Bell },
          ].map((item) => (
            <div key={item.label} className="rounded-[8px] border border-[#DCE5ED] bg-white p-3">
              <item.icon className="h-4 w-4 text-[#1D7ED0]" />
              <div className="mt-2 text-lg font-black">{item.value}</div>
              <div className="text-xs font-bold text-[#60798F]">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-2">
        {alerts.length > 0 && (
          <section className="rounded-[8px] border border-[#B9DDF7] bg-[#F1F8FE] p-4 xl:col-span-2">
            <h3 className="flex items-center gap-2 font-black"><Bell className="h-5 w-5 text-[#1D7ED0]" />Job activity</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="rounded-[8px] bg-white p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-black">{alert.title}</div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${alert.read ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800'}`}>{alert.read ? 'read' : 'new'}</span>
                  </div>
                  <p className="mt-1 text-[#60798F]">{alert.message}</p>
                  <p className="mt-2 text-xs font-bold text-[#8BA1B2]">{shortDateTime(alert.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[8px] bg-[#F4F7FA] p-4">
          <h3 className="flex items-center gap-2 font-black"><UserRound className="h-5 w-5 text-[#1D7ED0]" />Customer</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="font-black">{customer?.name || 'Customer'}</div>
            <div className="flex items-center gap-2 text-[#60798F]"><Mail className="h-4 w-4" />{customer?.email || 'No email'}</div>
            <div className="flex items-center gap-2 text-[#60798F]"><Phone className="h-4 w-4" />{customer?.phone || 'No phone'}</div>
          </div>
        </section>

        <section className="rounded-[8px] bg-[#F4F7FA] p-4">
          <h3 className="flex items-center gap-2 font-black"><Home className="h-5 w-5 text-[#1D7ED0]" />Job detail</h3>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-[#60798F]"><MapPin className="h-4 w-4" />{booking.address}</div>
            <div className="flex items-center gap-2 text-[#60798F]"><CalendarDays className="h-4 w-4" />{dateLabel(booking.scheduled_date)} at {timeLabel(booking.scheduled_time)}</div>
            <div className="font-bold">{booking.bedrooms} bedrooms / {booking.bathrooms} bathrooms / {money(booking.price_cents)}</div>
            {(booking.extras || []).length > 0 && <div className="text-[#60798F]">Extras: {(booking.extras || []).join(', ')}</div>}
            {booking.notes && <div className="rounded bg-white p-3 text-[#60798F]">{booking.notes}</div>}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4">
          <h3 className="font-black">Quote and payment</h3>
          <p className="mt-1 text-sm text-[#60798F]">Send a clear customer quote and move the job toward confirmation.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr]">
            <input type="number" placeholder="Price" value={quotePrice} onChange={(event) => setQuotePrice(event.target.value)} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
            <input placeholder="Customer note, optional" value={quoteNote} onChange={(event) => setQuoteNote(event.target.value)} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
          </div>
          <button onClick={onQuote} disabled={saving || !quotePrice} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0B3558] px-5 text-sm font-black text-white disabled:opacity-50">
            <CreditCard className="h-4 w-4" />
            Send quote
          </button>
          {booking.status === 'pending' && (
            <p className="mt-3 rounded-[8px] bg-amber-50 p-3 text-sm font-bold text-amber-800">This customer-created job post is waiting in the admin queue until a quote is sent.</p>
          )}
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4">
          <h3 className="font-black">Cleaner assignment</h3>
          <p className="mt-1 text-sm text-[#60798F]">Current cleaner: <span className="font-bold text-[#0B3558]">{staff?.name || 'Unassigned'}</span></p>
          <select value={booking.staff_id || ''} disabled={saving} onChange={(event) => onPatch({ staff_id: event.target.value || null })} className="mt-4 w-full rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm">
            <option value="">Unassigned</option>
            {cleaners.map((cleaner) => <option key={cleaner.id} value={cleaner.id}>{cleaner.name}{cleaner.suburb ? ` - ${cleaner.suburb}` : ''}</option>)}
          </select>
          {booking.covered_by_backup && <p className="mt-2 text-sm font-bold text-amber-700">Backup coverage is active for this job.</p>}
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4 xl:col-span-2">
          <h3 className="font-black">Schedule and service notes</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <input type="date" value={opsDraft.scheduled_date} onChange={(event) => setOpsDraft({ ...opsDraft, scheduled_date: event.target.value })} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
            <input type="time" value={opsDraft.scheduled_time} onChange={(event) => setOpsDraft({ ...opsDraft, scheduled_time: event.target.value })} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
            <input value={opsDraft.address} onChange={(event) => setOpsDraft({ ...opsDraft, address: event.target.value })} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm md:col-span-2" placeholder="Address" />
            <input value={opsDraft.suburb} onChange={(event) => setOpsDraft({ ...opsDraft, suburb: event.target.value })} className="rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" placeholder="Suburb" />
          </div>
          <textarea rows={3} value={opsDraft.notes} onChange={(event) => setOpsDraft({ ...opsDraft, notes: event.target.value })} className="mt-3 w-full rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" placeholder="Internal job notes and customer preferences" />
          <button disabled={saving} onClick={() => onPatch(opsDraft)} className="mt-3 rounded-full border border-[#0B3558] px-5 py-3 text-sm font-black text-[#0B3558] disabled:opacity-50">Save schedule and notes</button>
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4">
          <h3 className="font-black">Status controls</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {STATUS_ACTIONS.map((status) => (
              <button key={status} disabled={saving || booking.status === status} onClick={() => onPatch({ status })} className={`rounded-full border px-4 py-2 text-sm font-black disabled:opacity-40 ${booking.status === status ? 'bg-[#0B3558] text-white' : 'border-[#DCE5ED] text-[#0B3558]'}`}>
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4">
          <h3 className="font-black">Proof and completion</h3>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded bg-[#F4F7FA] p-3"><div className="font-black">{photoCount}</div><div className="text-[#60798F]">photos</div></div>
            <div className="rounded bg-[#F4F7FA] p-3"><div className="font-black">{done?.start_time ? 'Yes' : 'No'}</div><div className="text-[#60798F]">started</div></div>
            <div className="rounded bg-[#F4F7FA] p-3"><div className="font-black">{done?.submitted_at ? 'Yes' : 'No'}</div><div className="text-[#60798F]">submitted</div></div>
          </div>
          {done?.notes && <p className="mt-3 rounded bg-[#F4F7FA] p-3 text-sm text-[#60798F]">{done.notes}</p>}
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4 xl:col-span-2">
          <h3 className="flex items-center gap-2 font-black"><Camera className="h-5 w-5 text-[#1D7ED0]" />Job photos</h3>
          <p className="mt-1 text-sm text-[#60798F]">Customer-uploaded photos and cleaner proof photos stay visible here for admin review.</p>
          <PhotoStrip title="Customer request photos" photos={customerPhotos} />
          <PhotoStrip title="Cleaner before photos" photos={beforePhotos} />
          <PhotoStrip title="Cleaner after photos" photos={afterPhotos} />
        </section>

        <section className="rounded-[8px] border border-[#DCE5ED] p-4 xl:col-span-2">
          <h3 className="flex items-center gap-2 font-black"><MessageCircle className="h-5 w-5 text-[#1D7ED0]" />Message customer in-app</h3>
          <p className="mt-1 text-sm text-[#60798F]">Use clear, reassuring customer language. This appears in their Cleanngo account and sends an email notification.</p>
          <textarea rows={4} value={messageText} onChange={(event) => setMessageText(event.target.value)} className="mt-4 w-full rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" placeholder="Example: Hi Jane, your quote is ready. We included the oven reset you requested and can confirm Tuesday at 9:00." />
          {messageStatus && <p className="mt-2 text-sm font-bold text-[#0B3558]">{messageStatus}</p>}
          <button onClick={onMessage} disabled={saving || !messageText.trim()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0B3558] px-5 text-sm font-black text-white disabled:opacity-50">
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
                  <div className="text-sm text-[#60798F]">No messages yet.</div>
                ) : thread.messages.map((message) => (
                  <div key={message.id} className={`rounded-[8px] p-3 text-sm ${message.sender_type === 'admin' ? 'bg-white text-[#0B3558]' : 'bg-[#0B3558] text-white'}`}>
                    <div className="whitespace-pre-wrap">{message.body}</div>
                    <div className={`mt-2 text-xs ${message.sender_type === 'admin' ? 'text-[#60798F]' : 'text-white/55'}`}>
                      {message.sender_type === 'admin' ? 'Admin' : 'Customer'} - {new Date(message.created_at).toLocaleString()}
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
      <div className="text-xs font-black uppercase tracking-[0.14em] text-[#60798F]">{title}</div>
      {photos.length === 0 ? (
        <div className="mt-2 rounded-[8px] bg-[#F4F7FA] p-4 text-sm text-[#60798F]">No photos uploaded.</div>
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
