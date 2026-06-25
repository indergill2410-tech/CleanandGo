'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Invoice = {
  id: string
  amount_cents: number
  description: string | null
  status: string
  hosted_invoice_url: string | null
  created_at: string
  customers?: { name: string; email: string }
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-500/20 text-amber-300',
  paid: 'bg-green-500/20 text-green-300',
  void: 'bg-red-500/20 text-red-300',
}

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ url: string | null } | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await fetch('/api/invoices').then(r => r.json())
      setInvoices(data.invoices || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: email, customerName: name, amount: parseFloat(amount), description }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setResult({ url: data.hostedInvoiceUrl })
      setEmail(''); setName(''); setAmount(''); setDescription('')
      await load()
    } catch {
      setError('Network error')
    } finally {
      setSending(false)
    }
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  return (
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #172434 0%, #172434 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Invoices</h1>
          <p className="text-white/50 mt-1">Bill a customer any amount. Stripe emails a payment link; they can also pay from their account.</p>
        </div>

        {/* Send form */}
        <form onSubmit={send} className="glass-strong rounded-2xl p-6 mb-8 grid gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input type="email" placeholder="Customer email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
            <input placeholder="Customer name (optional)" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input type="number" min="0" step="0.01" placeholder="Amount (AUD)" value={amount} onChange={e => setAmount(e.target.value)} required className={inputCls} />
            <input placeholder="Description (e.g. Deep clean — 12 Smith St)" value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />
          </div>
          {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}
          {result && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3 text-green-200 text-sm">
              Invoice sent &amp; emailed.{' '}
              {result.url && <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Open payment link →</a>}
            </div>
          )}
          <button type="submit" disabled={sending} className="py-3.5 rounded-xl bg-white text-[#172434] font-bold hover:bg-white/90 transition disabled:opacity-50">
            {sending ? 'Sending…' : 'Create & send invoice'}
          </button>
        </form>

        {/* List */}
        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">Recent invoices</h2>
        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : invoices.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center text-white/60">No invoices yet.</div>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="glass-strong rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">${(inv.amount_cents / 100).toFixed(2)} <span className="text-white/40 text-sm font-normal">· {inv.customers?.name || inv.customers?.email}</span></div>
                  <div className="text-white/40 text-xs">{inv.description || 'Cleaning service'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_STYLES[inv.status] || 'bg-white/10 text-white/60'}`}>{inv.status}</span>
                  {inv.hosted_invoice_url && (
                    <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-[#8FD8B4] text-sm hover:text-white">link →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
