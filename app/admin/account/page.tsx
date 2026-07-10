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

  const inputCls = 'w-full rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-3 text-sm text-[#0B3558] placeholder:text-[#8AA0AC] outline-none focus:border-[#1D7ED0]'

  return (
    <div className="min-h-screen bg-[#DDECF5] px-4 py-5 text-[#0B3558] sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">Back to overview</Link>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-[#0B3558]">Admin account</h1>
          <p className="mt-1 text-sm font-bold text-[#60798F]">Change your password.</p>
        </div>

        <form onSubmit={save} className="space-y-4 rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-6 shadow-sm">
          <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required className={inputCls} />
          <input type="password" placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} required className={inputCls} />
          {error && <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
          {msg && <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{msg}</div>}
          <button type="submit" disabled={saving} className="w-full rounded-[8px] bg-[#0B3558] py-3.5 font-bold text-white transition hover:bg-[#164A75] disabled:opacity-50">
            {saving ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}

