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
  open: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  void: 'bg-red-100 text-red-800',
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

  const inputCls = 'w-full rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-3 text-sm text-[#0B3558] placeholder:text-[#8AA0AC] outline-none focus:border-[#1D7ED0]'

  return (
    <div className="min-h-screen bg-[#DDECF5] px-4 py-5 text-[#0B3558] sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">Back to overview</Link>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-[#0B3558]">Invoices</h1>
          <p className="mt-1 text-sm font-bold text-[#60798F]">Send a Stripe payment link and track whether the customer has paid.</p>
        </div>

        <form onSubmit={send} className="mb-8 grid gap-3 rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-6 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <input type="email" placeholder="Customer email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
            <input placeholder="Customer name (optional)" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input type="number" min="0" step="0.01" placeholder="Amount (AUD)" value={amount} onChange={e => setAmount(e.target.value)} required className={inputCls} />
            <input placeholder="Description (e.g. Deep clean — 12 Smith St)" value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />
          </div>
          {error && <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
          {result && (
            <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              Invoice sent &amp; emailed.{' '}
              {result.url && <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Open payment link</a>}
            </div>
          )}
          <button type="submit" disabled={sending} className="rounded-[8px] bg-[#0B3558] py-3.5 font-bold text-white transition hover:bg-[#164A75] disabled:opacity-50">
            {sending ? 'Sending...' : 'Create and send invoice'}
          </button>
        </form>

        <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Recent invoices</h2>
        {loading ? (
          <div className="text-[#60798F]">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-8 text-center text-[#60798F] shadow-sm">No invoices yet.</div>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-4 shadow-sm">
                <div>
                  <div className="font-black text-[#0B3558]">${(inv.amount_cents / 100).toFixed(2)} <span className="text-sm font-bold text-[#60798F]">· {inv.customers?.name || inv.customers?.email}</span></div>
                  <div className="text-xs text-[#60798F]">{inv.description || 'Cleaning service'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${STATUS_STYLES[inv.status] || 'bg-slate-100 text-slate-700'}`}>{inv.status}</span>
                  {inv.hosted_invoice_url && (
                    <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">Open</a>
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

