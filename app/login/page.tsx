'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirectTo)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#4A7FA5' }} />
      </div>
      <div className="glass-strong rounded-3xl p-10 w-full max-w-sm relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-cta flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Staff Login</h1>
          <p className="text-white/50 text-sm mt-1">Clean&amp;Go Operations</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@cleanandgo.com.au"
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm"
            />
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
