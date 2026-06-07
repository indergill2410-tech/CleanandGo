'use client'
import { useState } from 'react'

// Public newsletter opt-in form (footer + blog). Posts to /api/newsletter/subscribe.
export default function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'footer' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      setDone(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return <p className={compact ? 'text-white/60 text-sm' : 'text-green-200 text-sm'}>🎉 You’re subscribed — cleaning tips coming your way.</p>
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm'

  return (
    <form onSubmit={submit} className="space-y-2">
      {!compact && (
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name (optional)" className={inputCls} />
      )}
      <div className="flex flex-col gap-2 min-[420px]:flex-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={inputCls} />
        <button type="submit" disabled={busy} className="min-h-11 shrink-0 px-5 py-2.5 rounded-xl bg-white text-[#2C4A6E] font-bold text-sm hover:bg-white/90 disabled:opacity-50">
          {busy ? '…' : 'Subscribe'}
        </button>
      </div>
      {error && <p className="text-red-300 text-xs">{error}</p>}
    </form>
  )
}
