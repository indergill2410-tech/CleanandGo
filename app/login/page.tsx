'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BrandMark from '@/components/BrandMark'
import HomeLink from '@/components/HomeLink'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  // Staff destinations force the Staff tab; otherwise default to Client.
  const staffRedirect = !!redirectTo && (redirectTo.startsWith('/admin') || redirectTo.startsWith('/cleaner'))
  const initialTab = searchParams.get('tab') === 'staff' || staffRedirect ? 'staff' : 'client'

  const [tab, setTab] = useState<'client' | 'staff'>(initialTab)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchTab = (t: 'client' | 'staff') => { setTab(t); setMode('signin'); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error } =
      tab === 'client' && mode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (tab === 'client') {
      // Link (or create) the customer record for this user, then continue.
      await fetch('/api/account/claim', { method: 'POST' }).catch(() => {})
      if (optIn) {
        fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, source: 'signup' }),
        }).catch(() => {})
      }
      router.push(redirectTo || '/account')
    } else if (redirectTo) {
      router.push(redirectTo)
    } else {
      // Send each staff role to its console.
      const { role } = await fetch('/api/auth/whoami').then(r => r.json()).catch(() => ({ role: null }))
      router.push(role === 'admin' ? '/admin' : role === 'cleaner' ? '/cleaner' : '/account')
    }
    router.refresh()
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1 mb-6">
        {(['client', 'staff'] as const).map(t => (
          <button key={t} type="button" onClick={() => switchTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === t ? 'bg-white text-[#2C4A6E]' : 'text-white/60 hover:text-white'
            }`}>
            {t === 'client' ? 'Client' : 'Staff'}
          </button>
        ))}
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">{tab === 'client' ? 'Client Login' : 'Staff Login'}</h1>
        <p className="text-white/50 text-sm mt-1">{tab === 'client' ? 'Manage your cleaning plans & bookings' : 'Admins & cleaners'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'client' && mode === 'signup' && (
          <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className={inputCls} />
        {tab === 'client' && mode === 'signup' && (
          <label className="flex items-start gap-2.5 text-white/70 text-sm cursor-pointer">
            <input type="checkbox" checked={optIn} onChange={e => setOptIn(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#4A7FA5]" />
            Email me cleaning tips &amp; the occasional offer (optional)
          </label>
        )}
        {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}
        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition disabled:opacity-50">
          {loading ? 'Please wait…' : tab === 'client' && mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        {tab === 'client' ? (
          <p className="text-center text-white/50 text-sm">
            {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }} className="text-white font-semibold underline">
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </button>
          </p>
        ) : (
          <p className="text-center pt-1">
            <Link href="/forgot-password" className="text-white/50 text-sm hover:text-white">Forgot password?</Link>
          </p>
        )}
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <HomeLink className="fixed top-6 left-6 z-20" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#4A7FA5' }} />
      </div>
      <div className="glass-strong rounded-3xl p-10 w-full max-w-sm relative z-10 shadow-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-cta mb-1 shadow-lg text-white">
            <BrandMark className="w-8 h-8" />
          </Link>
        </div>
        <Suspense fallback={<div className="text-center text-white/50 py-8">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
