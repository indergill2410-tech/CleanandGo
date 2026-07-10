'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DollarSign,
  MapPin,
  MessageCircle,
  ReceiptText,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { RoleLens3D } from '@/components/dashboard/CleanDashboard'

type Relation<T> = T | T[] | null
type Person = { id?: string; name: string; email?: string | null; phone?: string | null; suburb?: string | null; status?: string | null; role?: string | null }
type Completion = { start_time: string | null; end_time: string | null; submitted_at: string | null; before_photos: string[] | null; after_photos: string[] | null; notes: string | null }
type Booking = {
  id: string
  service_type: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
  address: string
  suburb: string
  price_cents: number
  staff_id: string | null
  created_at: string
  notes: string | null
  customers?: Relation<Person>
  staff?: Relation<Person>
  job_completions?: Relation<Completion>
}
type Staff = { id: string; name: string; email: string; role: string; status: string; suburb?: string | null }
type Application = { id: string; name: string; status: string; suburbs: string | null; created_at: string; right_to_work?: boolean | null; has_police_check?: boolean | null; has_wwcc?: boolean | null }
type Notification = { id: string; title: string; message: string; booking_id: string | null; read: boolean; created_at: string; type: string }
type Conversation = { id: string; booking_id: string | null; subject: string | null; unread_admin_count: number; last_message_at: string | null }
type OpsMetrics = { unreadNotifications: number; unreadMessages: number; openInvoiceCents: number; capturedPaymentCents: number }
type FinanceMetrics = {
  pendingStaffPaymentCents: number
  paidStaffThisWeekCents: number
  paidStaffThisMonthCents: number
  expensesThisWeekCents: number
  expensesThisMonthCents: number
  incompleteOnboarding: number
}

const statusTone: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
  confirmed: 'bg-sky-100 text-sky-900 border-sky-200',
  in_progress: 'bg-blue-100 text-blue-900 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  missed: 'bg-red-100 text-red-900 border-red-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
}

const one = <T,>(value: Relation<T>) => Array.isArray(value) ? value[0] : value
const money = (cents?: number | null) => `$${((cents || 0) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
const timeLabel = (time?: string | null) => time ? time.slice(0, 5) : 'No time'
const dateLabel = (date?: string | null) => date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'No date'
const shortDateTime = (value?: string | null) => value ? new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not set'
const quoteAgeMinutes = (booking: Booking) => Math.max(0, Math.round((Date.now() - new Date(booking.created_at).getTime()) / 60000))

export default function AdminCommandCenter() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [metrics, setMetrics] = useState<OpsMetrics>({ unreadNotifications: 0, unreadMessages: 0, openInvoiceCents: 0, capturedPaymentCents: 0 })
  const [finance, setFinance] = useState<FinanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [opsRes, financeRes] = await Promise.all([
        fetch('/api/admin/operations'),
        fetch('/api/admin/finance'),
      ])
      const [opsData, financeData] = await Promise.all([
        opsRes.json().catch(() => ({})),
        financeRes.json().catch(() => ({})),
      ])
      if (!opsRes.ok) {
        setError(opsData.error || 'Operations data could not load.')
        return
      }
      setBookings(opsData.bookings || [])
      setStaff(opsData.staff || [])
      setApplications(opsData.applications || [])
      setNotifications(opsData.notifications || [])
      setConversations(opsData.conversations || [])
      setMetrics(opsData.metrics || { unreadNotifications: 0, unreadMessages: 0, openInvoiceCents: 0, capturedPaymentCents: 0 })
      if (financeRes.ok) setFinance(financeData.metrics || null)
    } catch {
      setError('Network error while loading the command center.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 30000)
    return () => window.clearInterval(timer)
  }, [load])

  const counts = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowKey = tomorrow.toISOString().slice(0, 10)
    const activeStaff = staff.filter((member) => member.role === 'cleaner' && member.status === 'active')
    return {
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
      inProgress: bookings.filter((booking) => booking.status === 'in_progress').length,
      missed: bookings.filter((booking) => booking.status === 'missed').length,
      today: bookings.filter((booking) => booking.scheduled_date === todayKey && !['completed', 'cancelled'].includes(booking.status)).length,
      tomorrow: bookings.filter((booking) => booking.scheduled_date === tomorrowKey && !['completed', 'cancelled'].includes(booking.status)).length,
      unassigned: bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status) && !booking.staff_id).length,
      cleaners: activeStaff.length,
      applicants: applications.filter((application) => application.status === 'new').length,
      revenue: bookings.reduce((sum, booking) => sum + (booking.status === 'completed' ? booking.price_cents || 0 : 0), 0),
    }
  }, [applications, bookings, staff])

  const operationalScore = useMemo(() => {
    const risk = counts.unassigned * 8 + counts.missed * 16 + metrics.unreadMessages * 4 + (finance?.incompleteOnboarding || 0) * 5
    return Math.max(55, Math.min(99, 96 - risk))
  }, [counts.missed, counts.unassigned, finance?.incompleteOnboarding, metrics.unreadMessages])

  const priorityJobs = useMemo(() => {
    return [...bookings]
      .filter((booking) => !['completed', 'cancelled'].includes(booking.status))
      .sort((a, b) => priorityScore(b, notifications, conversations) - priorityScore(a, notifications, conversations))
      .slice(0, 8)
  }, [bookings, conversations, notifications])

  const latestAlerts = notifications.slice(0, 5)
  const activeCleaners = staff.filter((member) => member.role === 'cleaner' && member.status === 'active').slice(0, 6)
  const onboardingPressure = finance?.incompleteOnboarding || applications.filter((application) => application.status === 'new').length

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-[8px] border border-[#D4E1E8] bg-white px-5 py-4 text-sm font-black text-[#5C7180] shadow-sm">Loading command center...</div>
      </section>
    )
  }

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-5 rounded-[8px] border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-black">Command center could not load</h2>
              <p className="mt-1 text-sm">{error}</p>
            </div>
            <button onClick={() => { setLoading(true); load() }} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-red-800 px-4 text-sm font-black text-white">
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-5 2xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[8px] border border-[#CFE0ED] bg-white p-5 shadow-sm">
          <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D7ED0]">Today&apos;s business view</p>
              <h2 className="mt-2 max-w-3xl text-2xl font-black tracking-normal text-[#0B3558] sm:text-4xl">
                See what needs attention, then move the day forward.
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-[#60798F]">
                Review open jobs, customer messages, staff readiness, and payments from one calm place.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <CommandLink href="/admin/team" icon={UsersRound} label="Staff" />
                <CommandLink href="/admin/customers" icon={UserRoundCheck} label="Customers" />
                <CommandLink href="/admin/finance" icon={ReceiptText} label="Finance" />
                <CommandLink href="/admin/applications" icon={ShieldCheck} label="Onboarding" />
              </div>
            </div>
            <RoleLens3D
              tone="admin"
              score={operationalScore}
              primary={{ label: 'Jobs today', value: counts.today }}
              secondary={{ label: 'Staff ready', value: counts.cleaners }}
              tertiary={{ label: 'Needs assigning', value: counts.unassigned }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="Jobs today" value={String(counts.today)} helper={`${counts.tomorrow} tomorrow`} icon={CalendarDays} tone="sky" />
          <MetricCard label="Needs assigning" value={String(counts.unassigned)} helper={`${counts.cleaners} staff ready`} icon={MapPin} tone="amber" />
          <MetricCard label="Customer updates" value={String(metrics.unreadMessages + metrics.unreadNotifications)} helper={`${metrics.unreadMessages} messages`} icon={MessageCircle} tone="blue" />
          <MetricCard label="Staff setup" value={String(onboardingPressure)} helper="items to clear" icon={ShieldAlert} tone="emerald" />
          <MetricCard label="Pending staff pay" value={money(finance?.pendingStaffPaymentCents)} helper={`${money(finance?.paidStaffThisWeekCents)} paid week`} icon={Banknote} tone="lime" />
          <MetricCard label="Month expenses" value={money(finance?.expensesThisMonthCents)} helper={`${money(metrics.capturedPaymentCents)} captured`} icon={DollarSign} tone="slate" />
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Jobs needing attention" action={<Link href="/admin/subscriptions" className="text-sm font-black text-[#1D7ED0]">Recurring plans</Link>}>
          <div className="grid gap-3 lg:grid-cols-4">
            <LaneStat label="Quote backlog" value={counts.pending} icon={ClipboardList} />
            <LaneStat label="Confirmed" value={counts.confirmed} icon={BadgeCheck} />
            <LaneStat label="In progress" value={counts.inProgress} icon={Clock3} />
            <LaneStat label="Recovery" value={counts.missed} icon={AlertTriangle} />
          </div>
          <div className="mt-4 overflow-hidden rounded-[8px] border border-[#D4E1E8]">
            {priorityJobs.length === 0 ? (
              <div className="bg-[#F7FAFC] p-8 text-center text-sm font-bold text-[#5C7180]">No active jobs need attention.</div>
            ) : priorityJobs.map((booking) => {
              const customer = one(booking.customers)
              const cleaner = one(booking.staff)
              const unread = notifications.filter((item) => item.booking_id === booking.id && !item.read).length
              return (
                <article key={booking.id} className="grid gap-3 border-b border-[#D4E1E8] bg-white p-4 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${statusTone[booking.status] || statusTone.pending}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      {unread > 0 && <span className="rounded-full bg-[#E7F5FF] px-2.5 py-1 text-xs font-black text-[#075985]">{unread} alert{unread === 1 ? '' : 's'}</span>}
                      {!booking.staff_id && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-900">needs cleaner</span>}
                    </div>
                    <h3 className="mt-3 text-base font-black text-[#102D42]">{customer?.name || 'Customer'} - {booking.service_type.replace('_', ' ')}</h3>
                    <p className="mt-1 text-sm font-bold text-[#5C7180]">{dateLabel(booking.scheduled_date)} at {timeLabel(booking.scheduled_time)} - {booking.suburb || booking.address}</p>
                  </div>
                  <div className="grid gap-2 text-sm font-bold text-[#5C7180] sm:grid-cols-3 lg:min-w-[330px]">
                    <MiniFact label="Cleaner" value={cleaner?.name || 'Unassigned'} />
                    <MiniFact label="Quote age" value={`${quoteAgeMinutes(booking)}m`} />
                    <MiniFact label="Value" value={money(booking.price_cents)} />
                  </div>
                </article>
              )
            })}
          </div>
        </Panel>

        <Panel title="Customer updates" action={<Link href="/admin/notifications" className="text-sm font-black text-[#1D7ED0]">View updates</Link>}>
          <div className="space-y-3">
            {latestAlerts.length === 0 ? (
              <div className="rounded-[8px] bg-[#F7FAFC] p-6 text-sm font-bold text-[#5C7180]">No live alerts.</div>
            ) : latestAlerts.map((alert) => (
              <article key={alert.id} className="rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black">{alert.title}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${alert.read ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-900'}`}>
                    {alert.read ? 'read' : 'new'}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-bold text-[#5C7180]">{alert.message}</p>
                <p className="mt-2 text-xs font-black text-[#8AA0AC]">{shortDateTime(alert.created_at)}</p>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <Panel title="Staff ready today" action={<Link href="/admin/team" className="text-sm font-black text-[#1D7ED0]">Open staff</Link>}>
          <div className="space-y-3">
            {activeCleaners.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] p-3">
                <div>
                  <div className="font-black">{member.name}</div>
                  <div className="text-sm font-bold text-[#5C7180]">{member.suburb || 'Service area not set'}</div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-900">active</span>
              </div>
            ))}
            {activeCleaners.length === 0 && <EmptyLine text="No active cleaners loaded." />}
          </div>
        </Panel>

        <Panel title="Applicants and checks" action={<Link href="/admin/applications" className="text-sm font-black text-[#1D7ED0]">Open applicants</Link>}>
          <div className="space-y-3">
            {applications.slice(0, 5).map((application) => (
              <div key={application.id} className="rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{application.name}</div>
                    <div className="text-sm font-bold text-[#5C7180]">{application.suburbs || 'Suburbs not set'}</div>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#5C7180]">{application.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                  <Readiness ok={Boolean(application.right_to_work)} label="work rights" />
                  <Readiness ok={Boolean(application.has_police_check)} label="police" />
                  <Readiness ok={Boolean(application.has_wwcc)} label="wwcc" />
                </div>
              </div>
            ))}
            {applications.length === 0 && <EmptyLine text="No applicants loaded." />}
          </div>
        </Panel>

        <Panel title="Finance to review" action={<Link href="/admin/finance" className="text-sm font-black text-[#1D7ED0]">Open finance</Link>}>
          <div className="grid gap-3">
            <FinanceRow label="Staff pay waiting" value={money(finance?.pendingStaffPaymentCents)} icon={Banknote} />
            <FinanceRow label="Paid this month" value={money(finance?.paidStaffThisMonthCents)} icon={CheckCircle2} />
            <FinanceRow label="Expenses this month" value={money(finance?.expensesThisMonthCents)} icon={ReceiptText} />
            <FinanceRow label="Open invoices" value={money(metrics.openInvoiceCents)} icon={DollarSign} />
          </div>
        </Panel>
      </section>
    </section>
  )
}

function priorityScore(booking: Booking, notifications: Notification[], conversations: Conversation[]) {
  const alerts = notifications.filter((item) => item.booking_id === booking.id && !item.read).length
  const thread = conversations.find((item) => item.booking_id === booking.id)
  if (booking.status === 'missed') return 100
  if (alerts > 0) return 85 + alerts
  if (!booking.staff_id && ['pending', 'confirmed'].includes(booking.status)) return 75
  if (booking.status === 'pending' && quoteAgeMinutes(booking) > 60) return 70
  if ((thread?.unread_admin_count || 0) > 0) return 65
  if (booking.status === 'in_progress') return 50
  return 10
}

function CommandLink({ href, icon: Icon, label }: { href: string; icon: typeof UsersRound; label: string }) {
  return (
    <Link href={href} className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] px-3 text-sm font-black text-[#102D42] hover:border-[#1670A8]">
      <Icon className="h-4 w-4 text-[#1670A8]" />
      {label}
      <ArrowUpRight className="h-3.5 w-3.5 text-[#8AA0AC]" />
    </Link>
  )
}

function MetricCard({ label, value, helper, icon: Icon, tone }: { label: string; value: string; helper: string; icon: typeof CalendarDays; tone: 'sky' | 'amber' | 'blue' | 'emerald' | 'lime' | 'slate' }) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-800',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    lime: 'bg-lime-50 text-lime-800',
    slate: 'bg-slate-100 text-slate-700',
  }
  return (
    <section className="rounded-[8px] border border-[#D4E1E8] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-[8px] ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <Sparkles className="h-4 w-4 text-[#C6D5DD]" />
      </div>
      <div className="mt-4 text-2xl font-black">{value}</div>
      <div className="mt-1 text-sm font-black">{label}</div>
      <div className="mt-1 text-xs font-bold text-[#5C7180]">{helper}</div>
    </section>
  )
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[#D4E1E8] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function LaneStat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof ClipboardList }) {
  return (
    <div className="rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] p-3">
      <Icon className="h-4 w-4 text-[#1670A8]" />
      <div className="mt-2 text-2xl font-black">{value}</div>
      <div className="text-xs font-bold text-[#5C7180]">{label}</div>
    </div>
  )
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-[#F7FAFC] px-3 py-2">
      <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8AA0AC]">{label}</div>
      <div className="truncate text-[#102D42]">{value}</div>
    </div>
  )
}

function Readiness({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`rounded-full px-2 py-1 ${ok ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>{label}</span>
}

function FinanceRow({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Banknote }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white text-[#1670A8]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-black">{label}</span>
      </div>
      <span className="font-black">{value}</span>
    </div>
  )
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-[8px] bg-[#F7FAFC] p-5 text-sm font-bold text-[#5C7180]">{text}</div>
}
