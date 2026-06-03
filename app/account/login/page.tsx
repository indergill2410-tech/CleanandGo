'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function AuthForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirectTo') || '/account'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error } =
      mode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Link (or create) the customer record for this user, then continue.
    await fetch('/api/account/claim', { method: 'POST' })
    router.push(redirectTo)
    router.refresh()
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === 'signup' && (
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
      )}
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className={inputCls} />
      {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}
      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition disabled:opacity-50">
        {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>
      <p className="text-center text-white/50 text-sm">
        {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
        <button type="button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }} className="text-white font-semibold underline">
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </form>
  )
}

export default function AccountLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="glass-strong rounded-3xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-white/50 text-sm hover:text-white mb-4 inline-block">← Clean&amp;Go</Link>
          <h1 className="text-2xl font-bold text-white">Your account</h1>
          <p className="text-white/50 text-sm mt-1">Manage your cleaning plans</p>
        </div>
        <Suspense fallback={<div className="text-center text-white/50 py-8">Loading…</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  )
}
