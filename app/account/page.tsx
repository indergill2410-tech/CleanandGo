'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PaymentForm from '@/components/PaymentForm'

type Sub = {
  id: string
  property_type: string
  frequency: string
  address: string
  suburb: string
  status: string
  price_cents: number | null
  preferred_day: string | null
  stripe_subscription_id: string | null
}
type Credit = { id: string; amount_cents: number; reason: string | null }
type Invoice = { id: string; amount_cents: number; description: string | null; hosted_invoice_url: string | null }
type Booking = { id: string; service_type: string; status: string; scheduled_date: string; scheduled_time: string | null; suburb: string | null; price_cents: number }

const SERVICE_LABELS: Record<string, string> = { recurring: 'Recurring Clean', oneoff: 'One-Off Clean', endoflease: 'End of Lease' }

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-amber-500/20 text-amber-300',
  active:    'bg-green-500/20 text-green-300',
  paused:    'bg-purple-500/20 text-purple-300',
  cancelled: 'bg-red-500/20 text-red-300',
  pending:     'bg-amber-500/20 text-amber-300',
  confirmed:   'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-purple-500/20 text-purple-300',
  completed:   'bg-green-500/20 text-green-300',
  missed:      'bg-red-500/20 text-red-300',
}

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [subs, setSubs] = useState<Sub[]>([])
  const [credits, setCredits] = useState<Credit[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [busy, setBusy] = useState<string>('')
  const [pay, setPay] = useState<{ id: string; clientSecret: string; amountCents: number } | null>(null)

  const load = useCallback(async () => {
    // Ensure the signed-in user is linked to their customer record (e.g. after
    // confirming a sign-up made during checkout), then load their data.
    await fetch('/api/account/claim', { method: 'POST' }).catch(() => {})
    const res = await fetch('/api/account/data')
    if (res.status === 401 || res.status === 403) { router.push('/account/login'); return }
    const data = await res.json()
    setName(data.customer?.name || '')
    setSubs(data.subscriptions || [])
    setCredits(data.credits || [])
    setInvoices(data.invoices || [])
    setBookings(data.bookings || [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

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

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/account/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/60" style={{ background: 'linear-gradient(135deg, #1C2B3A, #2C4A6E)' }}>Loading…</div>
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-white/50 text-sm hover:text-white">← Clean&amp;Go</Link>
            <h1 className="text-2xl font-bold text-white mt-1">Hi {name.split(' ')[0] || 'there'}</h1>
          </div>
          <button onClick={signOut} className="text-white/60 text-sm hover:text-white">Sign out</button>
        </div>

        {credits.length > 0 && (
          <div className="glass rounded-2xl p-4 mb-6 text-green-200 text-sm">
            🎉 You have ${(credits.reduce((s, c) => s + c.amount_cents, 0) / 100).toFixed(2)} in account credit.
          </div>
        )}

        {invoices.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">Outstanding invoices</h2>
            <div className="space-y-3">
              {invoices.map(inv => (
                <div key={inv.id} className="glass-strong rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">${(inv.amount_cents / 100).toFixed(2)}</div>
                    <div className="text-white/50 text-sm">{inv.description || 'Cleaning service'}</div>
                  </div>
                  {inv.hosted_invoice_url && (
                    <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold px-5 py-2.5 rounded-full bg-white text-[#2C4A6E] hover:bg-white/90">
                      Pay now →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">Your plans</h2>

        {subs.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm mb-4">You don&apos;t have any plans yet.</p>
            <Link href="/customer/plan" className="btn-primary text-sm px-6 py-3">Start a recurring plan →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subs.map(s => (
              <div key={s.id} className="glass-strong rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold capitalize">{s.property_type} · {s.frequency}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_STYLES[s.status] || 'bg-white/10 text-white/60'}`}>{s.status}</span>
                </div>
                <div className="text-white/60 text-sm">{s.address}, {s.suburb}</div>
                <div className="text-white/40 text-xs mt-1">
                  {s.preferred_day ? `${s.preferred_day} · ` : ''}{s.price_cents ? `$${(s.price_cents / 100).toFixed(2)}/visit` : 'awaiting price'}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {s.stripe_subscription_id && s.status === 'requested' && (
                    <button onClick={() => startPay(s.id)} disabled={busy === s.id} className="text-sm font-semibold px-4 py-2 rounded-full bg-white text-[#2C4A6E] hover:bg-white/90 disabled:opacity-50">
                      Complete payment
                    </button>
                  )}
                  {s.status === 'active' && (
                    <button onClick={() => act(s.id, 'pause')} disabled={busy === s.id} className="text-sm px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">Pause</button>
                  )}
                  {s.status === 'paused' && (
                    <button onClick={() => act(s.id, 'resume')} disabled={busy === s.id} className="text-sm px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">Resume</button>
                  )}
                  {['active', 'paused', 'requested'].includes(s.status) && (
                    <button onClick={() => act(s.id, 'cancel')} disabled={busy === s.id} className="text-sm px-4 py-2 rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10 disabled:opacity-50">Cancel</button>
                  )}
                </div>

                {pay?.id === s.id && (
                  <div className="mt-5 border-t border-white/10 pt-5">
                    <PaymentForm clientSecret={pay.clientSecret} amountCents={pay.amountCents} returnPath="/account" ctaLabel="Confirm & start plan" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {bookings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">Your bookings</h2>
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="glass-strong rounded-2xl p-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">{SERVICE_LABELS[b.service_type] || b.service_type}</div>
                    <div className="text-white/50 text-sm">{b.scheduled_date}{b.scheduled_time ? ` · ${b.scheduled_time.slice(0, 5)}` : ''}{b.suburb ? ` · ${b.suburb}` : ''}</div>
                  </div>
                  <div className="text-right">
                    {b.price_cents > 0 && <div className="text-white font-bold">${(b.price_cents / 100).toFixed(0)}</div>}
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_STYLES[b.status] || 'bg-white/10 text-white/60'}`}>{b.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/customer/plan" className="text-[#7BA7C7] text-sm font-semibold hover:text-white">+ Start another plan</Link>
        </div>
      </div>
    </div>
  )
}
