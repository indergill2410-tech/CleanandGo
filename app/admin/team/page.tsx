'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Staff = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  status: string
  suburb: string | null
  user_id: string | null
}

export default function AdminTeam() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', suburb: '', role: 'cleaner' })
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await fetch('/api/staff?all=true').then(r => r.json())
      setStaff(data.staff || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true); setError(''); setMsg('')
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setMsg(data.emailed ? `Invite emailed to ${form.email}.` : 'Created — email not configured.')
      if (!data.emailed && data.inviteLink) prompt('Set-password link to send manually:', data.inviteLink)
      setForm({ name: '', email: '', phone: '', suburb: '', role: 'cleaner' })
      await load()
    } catch {
      setError('Network error')
    } finally {
      setAdding(false)
    }
  }

  const update = async (id: string, updates: { role?: string; status?: string }) => {
    setBusy(id)
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) alert(data.error || 'Update failed')
    } catch { alert('Network error') } finally {
      await load(); setBusy('')
    }
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  return (
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #0B3558 0%, #0B3558 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Team</h1>
          <p className="text-white/50 mt-1">Add admins or cleaners and manage access.</p>
        </div>

        {/* Add member */}
        <form onSubmit={add} className="glass-strong rounded-2xl p-6 mb-8 grid gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} />
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className={inputCls} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <input placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
            <input placeholder="Suburb (optional)" value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))} className={inputCls} />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputCls}>
              <option value="cleaner" className="text-black">Cleaner</option>
              <option value="admin" className="text-black">Admin</option>
            </select>
          </div>
          {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}
          {msg && <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3 text-green-200 text-sm">{msg}</div>}
          <button type="submit" disabled={adding} className="py-3.5 rounded-xl bg-white text-[#0B3558] font-bold hover:bg-white/90 transition disabled:opacity-50">
            {adding ? 'Adding…' : 'Add & send invite'}
          </button>
        </form>

        {/* Team list */}
        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : (
          <div className="space-y-3">
            {staff.map(m => (
              <div key={m.id} className="glass-strong rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{m.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>{m.role}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'}`}>{m.status}</span>
                    {!m.user_id && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">no login</span>}
                  </div>
                  <div className="text-white/50 text-sm mt-0.5">{m.email}{m.suburb ? ` · ${m.suburb}` : ''}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {m.role === 'cleaner' ? (
                    <button onClick={() => update(m.id, { role: 'admin' })} disabled={busy === m.id} className="text-sm px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">Make admin</button>
                  ) : (
                    <button onClick={() => update(m.id, { role: 'cleaner' })} disabled={busy === m.id} className="text-sm px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">Make cleaner</button>
                  )}
                  {m.status === 'active' ? (
                    <button onClick={() => update(m.id, { status: 'inactive' })} disabled={busy === m.id} className="text-sm px-3 py-1.5 rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10 disabled:opacity-50">Deactivate</button>
                  ) : (
                    <button onClick={() => update(m.id, { status: 'active' })} disabled={busy === m.id} className="text-sm px-3 py-1.5 rounded-full border border-green-400/30 text-green-300 hover:bg-green-500/10 disabled:opacity-50">Activate</button>
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
