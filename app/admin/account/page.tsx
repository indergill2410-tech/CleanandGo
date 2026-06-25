'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminAccount() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setMsg('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setSaving(true)
    const { error } = await createClient().auth.updateUser({ password })
    setSaving(false)
    if (error) { setError(error.message); return }
    setMsg('Password updated.')
    setPassword(''); setConfirm('')
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  return (
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #172434 0%, #172434 100%)' }}>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Account</h1>
          <p className="text-white/50 mt-1">Change your password.</p>
        </div>

        <form onSubmit={save} className="glass-strong rounded-2xl p-6 space-y-4">
          <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required className={inputCls} />
          <input type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} required className={inputCls} />
          {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}
          {msg && <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3 text-green-200 text-sm">{msg}</div>}
          <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl bg-white text-[#172434] font-bold hover:bg-white/90 transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
