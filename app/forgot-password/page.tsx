'use client'
import { useState } from 'react'
import Link from 'next/link'
import HomeLink from '@/components/HomeLink'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch { /* always show the same confirmation */ }
    setSent(true)
    setLoading(false)
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #172434 0%, #172434 100%)' }}>
      <HomeLink className="fixed top-6 left-6 z-20" />
      <div className="glass-strong rounded-3xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/login" className="text-white/50 text-sm hover:text-white mb-4 inline-block">← Back to login</Link>
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-white/50 text-sm mt-1">We&apos;ll email you a link to set a new one.</p>
        </div>

        {sent ? (
          <div className="text-center text-white/70 text-sm">
            If an account exists for <strong className="text-white">{email}</strong>, a reset link is on its way. Check your inbox.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-white text-[#172434] font-bold hover:bg-white/90 transition disabled:opacity-50">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
