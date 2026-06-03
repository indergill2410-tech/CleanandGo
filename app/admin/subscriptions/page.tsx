'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Sub = {
  id: string
  property_type: 'home' | 'office'
  frequency: string
  preferred_day: string | null
  preferred_time: string | null
  address: string
  suburb: string
  bedrooms: number | null
  bathrooms: number | null
  office_sqm: number | null
  price_cents: number | null
  status: string
  primary_staff_id: string | null
  backup_staff_id: string | null
  notes: string | null
  created_at: string
  customers?: { name: string; email: string; phone: string }
}

type Staff = { id: string; name: string; role: string }

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  active:    'bg-green-500/20 text-green-300 border-green-400/30',
  paused:    'bg-purple-500/20 text-purple-300 border-purple-400/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-400/30',
}

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Sub | null>(null)
  const [price, setPrice] = useState('')
  const [primary, setPrimary] = useState('')
  const [backup, setBackup] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [s, st] = await Promise.all([
        fetch('/api/subscriptions').then(r => r.json()),
        fetch('/api/staff').then(r => r.json()),
      ])
      setSubs(s.subscriptions || [])
      setStaff(st.staff || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openActivate = (sub: Sub) => {
    setSelected(sub)
    setPrice(sub.price_cents ? String(sub.price_cents / 100) : '')
    setPrimary(sub.primary_staff_id || '')
    setBackup(sub.backup_staff_id || '')
    setMsg('')
    setError('')
  }

  const activate = async () => {
    if (!selected || !price) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/subscriptions/${selected.id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(price), primaryStaffId: primary || null, backupStaffId: backup || null }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setMsg('Priced — Stripe subscription created. Customer will be billed once they confirm their card.')
      await load()
      setTimeout(() => setSelected(null), 2500)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const staffName = (id: string | null) => staff.find(s => s.id === id)?.name || '—'
  const sizeLabel = (s: Sub) =>
    s.property_type === 'office' ? `${s.office_sqm ?? '?'} m²` : `${s.bedrooms ?? '?'} bed · ${s.bathrooms ?? '?'} bath`

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Recurring Plans</h1>
          <p className="text-white/50 mt-1">Price each plan and assign a primary + backup cleaner.</p>
        </div>

        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : subs.length === 0 ? (
          <div className="glass-strong rounded-2xl p-10 text-center text-white/60">No plan requests yet.</div>
        ) : (
          <div className="grid gap-4">
            {subs.map(sub => (
              <div key={sub.id} className="glass-strong rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold">{sub.customers?.name || 'Unknown'}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[sub.status] || 'bg-white/10 text-white/60 border-white/20'}`}>{sub.status}</span>
                    <span className="text-white/40 text-xs capitalize">{sub.property_type} · {sub.frequency}</span>
                  </div>
                  <div className="text-white/60 text-sm">{sub.address}, {sub.suburb} · {sizeLabel(sub)}</div>
                  <div className="text-white/40 text-xs mt-1">
                    Preferred: {sub.preferred_day || '—'} {sub.preferred_time?.slice(0,5) || ''} · Cleaner: {staffName(sub.primary_staff_id)} · Backup: {staffName(sub.backup_staff_id)}
                    {sub.price_cents ? ` · $${(sub.price_cents/100).toFixed(2)}/visit` : ''}
                  </div>
                  {sub.notes && <div className="text-white/40 text-xs mt-1 italic">“{sub.notes}”</div>}
                </div>
                <button onClick={() => openActivate(sub)} className="btn-primary text-sm px-6 py-3 whitespace-nowrap">
                  {sub.status === 'requested' ? 'Price & assign' : 'Edit'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activate modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <div className="glass-strong rounded-3xl p-7 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-1">Price & assign</h2>
            <p className="text-white/50 text-sm mb-5">{selected.customers?.name} · {selected.property_type} · {selected.frequency}</p>

            <label className="text-white/70 text-sm mb-1 block">Per-visit price (AUD)</label>
            <input type="number" min={0} step="0.01" value={price} onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 140" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm mb-4" />

            <label className="text-white/70 text-sm mb-1 block">Primary cleaner</label>
            <select value={primary} onChange={e => setPrimary(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm mb-4">
              <option value="" className="text-black">— Unassigned —</option>
              {staff.map(s => <option key={s.id} value={s.id} className="text-black">{s.name}</option>)}
            </select>

            <label className="text-white/70 text-sm mb-1 block">Backup cleaner</label>
            <select value={backup} onChange={e => setBackup(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm mb-5">
              <option value="" className="text-black">— Unassigned —</option>
              {staff.filter(s => s.id !== primary).map(s => <option key={s.id} value={s.id} className="text-black">{s.name}</option>)}
            </select>

            {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm mb-4">{error}</div>}
            {msg && <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3 text-green-200 text-sm mb-4">{msg}</div>}

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition text-sm">Cancel</button>
              <button onClick={activate} disabled={saving || !price} className="flex-1 py-3 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition disabled:opacity-50 text-sm">
                {saving ? 'Saving…' : 'Confirm & create subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
