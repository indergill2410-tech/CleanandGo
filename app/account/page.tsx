'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Camera,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Home,
  MessageCircle,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PaymentForm from '@/components/PaymentForm'
import { RoleLens3D } from '@/components/dashboard/CleanDashboard'

type StaffPerson = { name: string; phone: string | null; suburb: string | null }
type StaffRef = StaffPerson | StaffPerson[] | null

type Sub = {
  id: string
  property_type: string
  frequency: string
  address: string
  suburb: string
  state: string | null
  postcode: string | null
  status: string
  price_cents: number | null
  preferred_day: string | null
  preferred_time: string | null
  stripe_subscription_id: string | null
  primary_staff: StaffRef
  backup_staff: StaffRef
}
type Credit = { id: string; amount_cents: number; reason: string | null }
type Invoice = { id: string; amount_cents: number; description: string | null; hosted_invoice_url: string | null }
type Completion = {
  start_time: string | null
  end_time: string | null
  submitted_at: string | null
  before_photos: string[] | null
  after_photos: string[] | null
  notes: string | null
}
type Booking = {
  id: string
  service_type: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
  address: string
  suburb: string | null
  state: string | null
  postcode: string | null
  bedrooms: number | null
  bathrooms: number | null
  extras: string[] | null
  notes: string | null
  photos: string[] | null
  price_cents: number
  covered_by_backup: boolean
  staff: StaffRef
  job_completions: Completion[] | Completion | null
}
type Conversation = { id: string; subject: string | null; booking_id: string | null; last_message_at: string | null }

const SERVICE_LABELS: Record<string, string> = {
  recurring: 'Recurring clean',
  oneoff: 'One-off clean',
  endoflease: 'End-of-lease clean',
}

const STATUS_COPY: Record<string, { label: string; className: string; helper: string }> = {
  requested: { label: 'Quote requested', className: 'bg-amber-100 text-amber-800', helper: 'We are preparing your tailored price.' },
  active: { label: 'Plan active', className: 'bg-emerald-100 text-emerald-800', helper: 'Your recurring clean is ready to run.' },
  paused: { label: 'Paused', className: 'bg-amber-100 text-amber-800', helper: 'Your plan is paused until you resume it.' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800', helper: 'This plan is no longer active.' },
  pending: { label: 'Quote requested', className: 'bg-amber-100 text-amber-800', helper: 'We are reviewing your request.' },
  confirmed: { label: 'Booked', className: 'bg-blue-100 text-blue-800', helper: 'Your clean is confirmed.' },
  in_progress: { label: 'In progress', className: 'bg-amber-100 text-amber-800', helper: 'Your cleaner is working through the checklist.' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-800', helper: 'Your clean has been completed.' },
  missed: { label: 'Credited', className: 'bg-red-100 text-red-800', helper: 'A service credit has been added to your account.' },
}

const money = (cents?: number | null) => cents ? `$${(cents / 100).toFixed(2)}` : 'Price pending'
const dateLabel = (value?: string | null) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date pending'
const timeLabel = (value?: string | null) => value ? value.slice(0, 5) : 'Time pending'
const person = (value: StaffRef): StaffPerson | undefined => Array.isArray(value) ? value[0] : value || undefined
const completion = (value: Booking['job_completions']) => Array.isArray(value) ? value[0] : value
const statusInfo = (status: string) => STATUS_COPY[status] || { label: status.replace('_', ' '), className: 'bg-slate-100 text-slate-700', helper: 'We will keep this updated.' }
const TIMELINE = ['pending', 'confirmed', 'in_progress', 'completed'] as const
const timelineLabel: Record<string, string> = {
  pending: 'Quote',
  confirmed: 'Booked',
  in_progress: 'Cleaning',
  completed: 'Complete',
}

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subs, setSubs] = useState<Sub[]>([])
  const [credits, setCredits] = useState<Credit[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [busy, setBusy] = useState<string>('')
  const [error, setError] = useState('')
  const [pay, setPay] = useState<{ id: string; clientSecret: string; amountCents: number } | null>(null)
  const [request, setRequest] = useState<{ type: string; title: string; bookingId?: string; message: string } | null>(null)
  const [requestStatus, setRequestStatus] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      await fetch('/api/account/claim', { method: 'POST' }).catch(() => {})
      const res = await fetch('/api/account/data')
      if (res.status === 401 || res.status === 403) { router.push('/login?tab=client'); return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not load your dashboard.')
        setLoading(false)
        return
      }
      setName(data.customer?.name || '')
      setEmail(data.customer?.email || '')
      setSubs(data.subscriptions || [])
      setCredits(data.credits || [])
      setInvoices(data.invoices || [])
      setBookings(data.bookings || [])
      setConversations(data.conversations || [])
      setLoading(false)
    } catch {
      setError('Network error while loading your dashboard.')
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  const firstName = name.split(' ')[0] || 'there'
  const openInvoiceTotal = invoices.reduce((sum, invoice) => sum + invoice.amount_cents, 0)
  const creditTotal = credits.reduce((sum, credit) => sum + credit.amount_cents, 0)
  const activePlans = subs.filter((plan) => plan.status === 'active').length
  const nextBooking = useMemo(() => {
    const upcoming = bookings
      .filter((booking) => ['pending', 'confirmed', 'in_progress'].includes(booking.status))
      .sort((a, b) => `${a.scheduled_date} ${a.scheduled_time || ''}`.localeCompare(`${b.scheduled_date} ${b.scheduled_time || ''}`))
    return upcoming[0] || bookings[0]
  }, [bookings])

  const act = async (id: string, action: 'pause' | 'resume' | 'cancel') => {
    if (action === 'cancel' && !confirm('Cancel this plan? You can always start a new one later.')) return
    setBusy(id)
    await fetch(`/api/account/subscriptions/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    await load()
    setBusy('')
  }

  const startPay = async (id: string) => {
    setBusy(id)
    const res = await fetch(`/api/account/subscriptions/${id}/pay`)
    const data = await res.json()
    setBusy('')
    if (data.paid) { await load(); return }
    if (data.clientSecret) setPay({ id, clientSecret: data.clientSecret, amountCents: data.amountCents })
  }

  const openRequest = (type: string, title: string, message: string, bookingId?: string) => {
    setRequest({ type, title, bookingId, message })
    setRequestStatus('')
  }

  const submitRequest = async () => {
    if (!request || !request.message.trim()) return
    setSendingRequest(true)
    setRequestStatus('')
    try {
      const res = await fetch('/api/account/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: request.type,
          bookingId: request.bookingId,
          message: request.message,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setRequestStatus(data.error || 'Could not send request.')
        return
      }
      await load()
      setRequestStatus('Request sent. Your Cleanngo team will reply in Messages.')
      setTimeout(() => router.push(`/account/messages?conversation=${data.conversationId}`), 650)
    } catch {
      setRequestStatus('Network error. Please try again.')
    } finally {
      setSendingRequest(false)
    }
  }

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/login?tab=client')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#DDECF5] text-[#0B3558]">Preparing your dashboard...</div>
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#DDECF5] px-4 text-[#0B3558]">
        <section className="w-full max-w-md rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black">Dashboard could not load</h1>
          <p className="mt-3 text-sm text-[#60798F]">{error}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button onClick={() => { setLoading(true); load() }} className="min-h-11 rounded-full bg-[#0B3558] px-5 text-sm font-black text-white">Try again</button>
            <Link href="/login?tab=client" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#C9D7E2] px-5 text-sm font-black text-[#0B3558]">Sign in</Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#DDECF5] text-[#0B3558]">
      <header className="border-b border-[#B9CFDE] bg-[#EAF6FC]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-[#1D7ED0] hover:text-[#0B3558]">cleanngo home</Link>
            <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">Welcome back, {firstName}</h1>
            <p className="mt-1 text-sm text-[#60798F]">Your upcoming cleans, messages, photos, and payments in one calm place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/account/messages" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#C9D7E2] bg-white px-5 text-sm font-black text-[#0B3558] hover:border-[#0B3558]">
              <MessageCircle className="h-4 w-4" />
              Messages
            </Link>
            <Link href="/customer/book" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0B3558] px-5 text-sm font-black text-white hover:bg-[#0B3558]">
              Book a clean
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={signOut} className="min-h-11 rounded-full px-4 text-sm font-bold text-[#60798F] hover:bg-white">Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Active plans', value: activePlans, icon: ShieldCheck },
            { label: 'Upcoming jobs', value: bookings.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length, icon: CalendarDays },
            { label: 'Account credit', value: money(creditTotal), icon: CheckCircle2 },
            { label: 'Open invoices', value: money(openInvoiceTotal), icon: CreditCard },
          ].map((item) => (
            <div key={item.label} className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-[0_14px_34px_rgba(11,53,88,0.07)]">
              <item.icon className="h-5 w-5 text-[#1D7ED0]" />
              <div className="mt-4 text-2xl font-black">{item.value}</div>
              <div className="mt-1 text-sm font-semibold text-[#60798F]">{item.label}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,1.02fr)]">
          <div className="rounded-[8px] bg-[#0B3558] p-6 text-white shadow-[0_18px_46px_rgba(11,53,88,0.22)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#7DD3FC]">Your next clean</p>
                <h2 className="mt-2 text-3xl font-black">{nextBooking ? SERVICE_LABELS[nextBooking.service_type] || nextBooking.service_type : 'No clean scheduled yet'}</h2>
                <p className="mt-2 text-white/64">
                  {nextBooking ? `${dateLabel(nextBooking.scheduled_date)} at ${timeLabel(nextBooking.scheduled_time)} · ${nextBooking.address}` : 'Post a one-off job or create a recurring plan. New job requests go straight to the admin queue for quoting.'}
                </p>
              </div>
              {nextBooking && (
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${statusInfo(nextBooking.status).className}`}>
                  {statusInfo(nextBooking.status).label}
                </span>
              )}
            </div>

            {nextBooking ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[8px] bg-white/8 p-4">
                  <UserRound className="h-5 w-5 text-[#7DD3FC]" />
                  <div className="mt-3 text-sm text-white/50">Cleaner</div>
                  <div className="font-black">{person(nextBooking.staff)?.name || 'Being assigned'}</div>
                  <div className="mt-1 text-xs text-white/45">{nextBooking.covered_by_backup ? 'Backup coverage active' : 'Primary assignment'}</div>
                </div>
                <div className="rounded-[8px] bg-white/8 p-4">
                  <Home className="h-5 w-5 text-[#F5C84C]" />
                  <div className="mt-3 text-sm text-white/50">Home details</div>
                  <div className="font-black">{nextBooking.bedrooms || '?'} bed · {nextBooking.bathrooms || '?'} bath</div>
                  <div className="mt-1 text-xs text-white/45">{nextBooking.suburb || 'Address confirmed'}</div>
                </div>
                <div className="rounded-[8px] bg-white/8 p-4">
                  <Sparkles className="h-5 w-5 text-[#7DD3FC]" />
                  <div className="mt-3 text-sm text-white/50">Price</div>
                  <div className="font-black">{money(nextBooking.price_cents)}</div>
                  <div className="mt-1 text-xs text-white/45">{statusInfo(nextBooking.status).helper}</div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/customer/plan" className="inline-flex justify-center rounded-full bg-[#F5C84C] px-6 py-3 font-black text-[#0B3558]">Start a weekly reset</Link>
                <Link href="/customer/book" className="inline-flex justify-center rounded-full border border-white/20 px-6 py-3 font-black text-white">Post a one-off job</Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <RoleLens3D
              tone="customer"
              score={activePlans > 0 ? 'Plan on' : 'Ready'}
              primary={{ label: 'Next clean', value: nextBooking ? statusInfo(nextBooking.status).label : 'Book' }}
              secondary={{ label: 'Messages', value: conversations.length }}
              tertiary={{ label: 'Photos', value: bookings.filter((booking) => Boolean(completion(booking.job_completions))).length }}
            />

            <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-6 shadow-[0_14px_34px_rgba(11,53,88,0.07)]">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Helpful next steps</p>
              <h2 className="mt-2 text-2xl font-black">Make the next clean feel easier</h2>
              <div className="mt-5 space-y-3">
                {[
                  { title: 'Add an oven or fridge reset', text: 'Good before guests, inspections, or a fresh start.', type: 'oven_fridge', message: 'I would like to add an oven or fridge reset to my next clean. Please confirm the best option and price.' },
                  { title: 'Start a recurring plan', text: 'Keep the same clean feeling every week or fortnight.', type: 'recurring_plan', message: 'I am interested in a recurring cleaning plan. Please recommend the best frequency for my home.' },
                  { title: 'Ask about office or Airbnb support', text: 'Get a fixed plan for workspaces or turnovers.', type: 'office_airbnb', message: 'I would like help with office cleaning or Airbnb turnover support. Please send me the best next step.' },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => openRequest(item.type, item.title, item.message, nextBooking?.id)}
                    className="block w-full rounded-[8px] border border-[#B9CFDE] bg-white/70 p-4 text-left transition hover:border-[#1D7ED0] hover:bg-[#EAF6FC]"
                  >
                    <div className="font-black">{item.title}</div>
                    <div className="mt-1 text-sm text-[#60798F]">{item.text}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {request && (
          <section className="mt-6 rounded-[8px] border border-[#C9D7E2] bg-[#F8FBFF] p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="lg:max-w-md">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Service request</p>
                <h2 className="mt-1 text-2xl font-black">{request.title}</h2>
                <p className="mt-2 text-sm text-[#60798F]">Send this to the Cleanngo team. They will reply inside your message centre.</p>
              </div>
              <div className="flex-1">
                <textarea
                  value={request.message}
                  onChange={(event) => setRequest({ ...request, message: event.target.value })}
                  rows={4}
                  className="w-full rounded-[8px] border border-[#D8E1E8] bg-[#F8FAFB] p-4 text-sm outline-none focus:border-[#1D7ED0]"
                />
                {requestStatus && <p className={`mt-2 text-sm font-bold ${requestStatus.startsWith('Request sent') ? 'text-emerald-700' : 'text-red-600'}`}>{requestStatus}</p>}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={submitRequest}
                    disabled={sendingRequest || !request.message.trim()}
                    className="min-h-11 rounded-full bg-[#0B3558] px-5 text-sm font-black text-white disabled:opacity-50"
                  >
                    {sendingRequest ? 'Sending...' : 'Send request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequest(null)}
                    className="min-h-11 rounded-full border border-[#C9D7E2] px-5 text-sm font-black text-[#0B3558]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {invoices.length > 0 && (
          <section className="mt-6 rounded-[8px] border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-black text-amber-900">Payment needed to keep things moving</h2>
                <p className="text-sm text-amber-800">You have {invoices.length} open invoice{invoices.length === 1 ? '' : 's'}.</p>
              </div>
              {invoices[0]?.hosted_invoice_url && (
                <a href={invoices[0].hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-white">
                  Pay {money(invoices[0].amount_cents)}
                </a>
              )}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Plans</p>
                <h2 className="text-2xl font-black">Recurring service</h2>
              </div>
              <Link href="/customer/plan" className="text-sm font-black text-[#0B3558]">Add plan</Link>
            </div>

            {subs.length === 0 ? (
              <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-6 text-center">
                <p className="text-[#60798F]">No recurring plan yet.</p>
                <Link href="/customer/plan" className="mt-4 inline-flex rounded-full bg-[#0B3558] px-5 py-3 text-sm font-black text-white">Start a recurring plan</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {subs.map((plan) => {
                  const primary = person(plan.primary_staff)
                  const backup = person(plan.backup_staff)
                  return (
                    <div key={plan.id} className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-black capitalize">{plan.property_type} · {plan.frequency}</div>
                          <div className="mt-1 text-sm text-[#60798F]">{plan.address}, {plan.suburb}</div>
                          <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#9AA7B1]">{plan.preferred_day || 'Day pending'} {plan.preferred_time ? `· ${timeLabel(plan.preferred_time)}` : ''}</div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusInfo(plan.status).className}`}>{statusInfo(plan.status).label}</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[8px] bg-[#EAF6FC] p-3">
                          <div className="text-xs font-bold text-[#60798F]">Per visit</div>
                          <div className="font-black">{money(plan.price_cents)}</div>
                        </div>
                        <div className="rounded-[8px] bg-[#EAF6FC] p-3">
                          <div className="text-xs font-bold text-[#60798F]">Primary cleaner</div>
                          <div className="font-black">{primary?.name || 'Assigning soon'}</div>
                        </div>
                        <div className="rounded-[8px] bg-[#EAF6FC] p-3">
                          <div className="text-xs font-bold text-[#60798F]">Backup cover</div>
                          <div className="font-black">{backup?.name || 'On standby'}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {plan.stripe_subscription_id && plan.status === 'requested' && (
                          <button onClick={() => startPay(plan.id)} disabled={busy === plan.id} className="inline-flex items-center gap-2 rounded-full bg-[#0B3558] px-4 py-2 text-sm font-black text-white disabled:opacity-50">
                            <CreditCard className="h-4 w-4" />
                            Complete payment
                          </button>
                        )}
                        {plan.status === 'active' && (
                          <button onClick={() => act(plan.id, 'pause')} disabled={busy === plan.id} className="inline-flex items-center gap-2 rounded-full border border-[#C9D7E2] px-4 py-2 text-sm font-black text-[#0B3558] disabled:opacity-50">
                            <Pause className="h-4 w-4" />
                            Pause plan
                          </button>
                        )}
                        {plan.status === 'paused' && (
                          <button onClick={() => act(plan.id, 'resume')} disabled={busy === plan.id} className="inline-flex items-center gap-2 rounded-full bg-[#0B3558] px-4 py-2 text-sm font-black text-white disabled:opacity-50">
                            <Play className="h-4 w-4" />
                            Resume plan
                          </button>
                        )}
                        {['active', 'paused', 'requested'].includes(plan.status) && (
                          <button onClick={() => act(plan.id, 'cancel')} disabled={busy === plan.id} className="rounded-full border border-red-200 px-4 py-2 text-sm font-black text-red-600 disabled:opacity-50">Cancel</button>
                        )}
                      </div>
                      {pay?.id === plan.id && (
                        <div className="mt-5 border-t border-[#B9CFDE] pt-5">
                          <PaymentForm clientSecret={pay.clientSecret} amountCents={pay.amountCents} returnPath="/account" ctaLabel="Confirm and start plan" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Jobs</p>
                <h2 className="text-2xl font-black">Quote requests and cleans</h2>
              </div>
              <Link href="/account/messages" className="text-sm font-black text-[#0B3558]">{conversations.length} message thread{conversations.length === 1 ? '' : 's'}</Link>
            </div>

            {bookings.length === 0 ? (
              <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-6 text-center">
                <p className="text-[#60798F]">No one-off jobs yet.</p>
                <Link href="/customer/book" className="mt-4 inline-flex rounded-full bg-[#0B3558] px-5 py-3 text-sm font-black text-white">Post a job</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const cleaner = person(booking.staff)
                  const done = completion(booking.job_completions)
                  const progressIndex = TIMELINE.indexOf(booking.status as typeof TIMELINE[number])
                  const beforePhotos = done?.before_photos || []
                  const afterPhotos = done?.after_photos || []
                  const requestPhotos = booking.photos || []
                  return (
                    <article key={booking.id} className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-lg font-black">{SERVICE_LABELS[booking.service_type] || booking.service_type}</div>
                          <div className="mt-1 text-sm text-[#60798F]">{dateLabel(booking.scheduled_date)} at {timeLabel(booking.scheduled_time)} · {booking.address}</div>
                          {booking.notes && <div className="mt-2 rounded-[8px] bg-[#EAF6FC] p-3 text-sm text-[#60798F]">{booking.notes}</div>}
                        </div>
                        <div className="sm:text-right">
                          <div className="font-black">{money(booking.price_cents)}</div>
                          <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${statusInfo(booking.status).className}`}>{statusInfo(booking.status).label}</span>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[8px] bg-[#EAF6FC] p-3">
                          <div className="text-xs font-bold text-[#60798F]">Cleaner</div>
                          <div className="font-black">{cleaner?.name || 'Being assigned'}</div>
                        </div>
                        <div className="rounded-[8px] bg-[#EAF6FC] p-3">
                          <div className="text-xs font-bold text-[#60798F]">Coverage</div>
                          <div className="font-black">{booking.covered_by_backup ? 'Backup cleaner' : 'Standard cover'}</div>
                        </div>
                        <div className="rounded-[8px] bg-[#EAF6FC] p-3">
                          <div className="text-xs font-bold text-[#60798F]">Proof</div>
                          <div className="font-black">{(done?.after_photos || []).length || (booking.photos || []).length || 0} photo{((done?.after_photos || []).length || (booking.photos || []).length || 0) === 1 ? '' : 's'}</div>
                        </div>
                      </div>
                      <div className="mt-5 rounded-[8px] bg-[#EAF6FC] p-4">
                        <div className="flex items-center justify-between gap-2">
                          {TIMELINE.map((step, index) => {
                            const active = progressIndex >= 0 && index <= progressIndex
                            return (
                              <div key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
                                <div className={`h-3 w-full rounded-full ${active ? 'bg-[#0B3558]' : 'bg-[#DDE5EC]'}`} />
                                <div className={`text-xs font-black ${active ? 'text-[#0B3558]' : 'text-[#9AA7B1]'}`}>{timelineLabel[step]}</div>
                              </div>
                            )
                          })}
                        </div>
                        <p className="mt-3 text-sm text-[#60798F]">{statusInfo(booking.status).helper}</p>
                      </div>
                      <CustomerPhotoGallery title="Your job photos" requestPhotos={requestPhotos} beforePhotos={beforePhotos} afterPhotos={afterPhotos} />
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={`/account/messages?conversation=${conversations.find((c) => c.booking_id === booking.id)?.id || ''}`} className="rounded-full border border-[#C9D7E2] px-4 py-2 text-sm font-black text-[#0B3558]">Message cleanngo</Link>
                        <button
                          type="button"
                          onClick={() => openRequest('reschedule', 'Update this booking', `I would like to update my ${SERVICE_LABELS[booking.service_type] || booking.service_type} on ${dateLabel(booking.scheduled_date)}.`, booking.id)}
                          className="rounded-full bg-[#EAF6FC] px-4 py-2 text-sm font-black text-[#0B3558]"
                        >
                          Change booking
                        </button>
                        <button
                          type="button"
                          onClick={() => openRequest('oven_fridge', 'Add service to this booking', `Please add an extra service to my ${SERVICE_LABELS[booking.service_type] || booking.service_type}. I am interested in: `, booking.id)}
                          className="rounded-full bg-[#EAF6FC] px-4 py-2 text-sm font-black text-[#0B3558]"
                        >
                          Add extra service
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function CustomerPhotoGallery({
  title,
  requestPhotos,
  beforePhotos,
  afterPhotos,
}: {
  title: string
  requestPhotos: string[]
  beforePhotos: string[]
  afterPhotos: string[]
}) {
  const photos = [
    ...requestPhotos.map((src) => ({ src, label: 'Request photo' })),
    ...beforePhotos.map((src) => ({ src, label: 'Before photo' })),
    ...afterPhotos.map((src) => ({ src, label: 'After photo' })),
  ]

  if (photos.length === 0) return null

  return (
    <div className="mt-5 rounded-[8px] border border-[#D8E8F2] p-4">
      <h3 className="flex items-center gap-2 text-sm font-black text-[#0B3558]">
        <Camera className="h-4 w-4 text-[#1D7ED0]" />
        {title}
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <a key={`${photo.src}-${index}`} href={photo.src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[8px] border border-[#B9CFDE] bg-[#EAF6FC]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={`${photo.label} ${index + 1}`} className="aspect-video w-full object-cover" />
            <div className="px-2 py-1 text-xs font-bold text-[#60798F]">{photo.label}</div>
          </a>
        ))}
      </div>
    </div>
  )
}


