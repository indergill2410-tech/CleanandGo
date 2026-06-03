'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      // Invite/recovery links land here with a session (hash) or a PKCE code.
      const code = new URL(window.location.href).searchParams.get('code')
      if (code) await supabase.auth.exchangeCodeForSession(code).catch(() => {})
      const { data } = await supabase.auth.getSession()
      setReady(!!data.session)
      setChecking(false)
    }
    init()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Use at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setSaving(false); return }
    router.push('/cleaner')
    router.refresh()
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="glass-strong rounded-3xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-white/50 text-sm hover:text-white mb-4 inline-block">← Clean&amp;Go</Link>
          <h1 className="text-2xl font-bold text-white">Set your password</h1>
          <p className="text-white/50 text-sm mt-1">Welcome to the team — choose a password to access your portal.</p>
        </div>

        {checking ? (
          <div className="text-center text-white/50 py-6">Verifying your link…</div>
        ) : !ready ? (
          <div className="text-center">
            <p className="text-white/70 text-sm mb-4">This invite link is invalid or has expired.</p>
            <p className="text-white/50 text-xs">Please ask the Clean&amp;Go team to send you a fresh invite.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className={inputCls} />
            <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required className={inputCls} />
            {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}
            <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition disabled:opacity-50">
              {saving ? 'Saving…' : 'Set password & continue →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
