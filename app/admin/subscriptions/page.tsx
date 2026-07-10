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
  photos: string[] | null
  created_at: string
  customers?: { name: string; email: string; phone: string }
}

type Staff = { id: string; name: string; role: string }

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-amber-100 text-amber-800 border-amber-200',
  active:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  paused:    'bg-amber-100 text-amber-800 border-amber-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
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
  const [toolMsg, setToolMsg] = useState('')
  const [offStaff, setOffStaff] = useState('')
  const [offDate, setOffDate] = useState('')

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

  const generateVisits = async () => {
    setToolMsg('Generating…')
    const res = await fetch('/api/subscriptions/generate-visits', { method: 'POST' })
    const data = await res.json()
    setToolMsg(res.ok ? `Created ${data.created} upcoming visit(s).` : (data.error || 'Failed'))
  }

  const reportOff = async () => {
    if (!offStaff || !offDate) { setToolMsg('Pick a cleaner and date.'); return }
    setToolMsg('Arranging coverage…')
    const res = await fetch('/api/staff/unavailability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId: offStaff, date: offDate }),
    })
    const data = await res.json()
    setToolMsg(res.ok ? `Coverage: ${data.reassigned} reassigned to backup, ${data.uncovered} need manual cover.` : (data.error || 'Failed'))
  }

  const staffName = (id: string | null) => staff.find(s => s.id === id)?.name || '—'
  const sizeLabel = (s: Sub) =>
    s.property_type === 'office' ? `${s.office_sqm ?? '?'} m²` : `${s.bedrooms ?? '?'} bed · ${s.bathrooms ?? '?'} bath`

  return (
    <div className="min-h-screen bg-[#DDECF5] text-[#0B3558]">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/admin" className="text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">Back to overview</Link>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-[#0B3558]">Recurring plans</h1>
          <p className="mt-1 text-sm font-bold text-[#60798F]">Price each plan, assign the regular cleaner, and arrange backup cover when needed.</p>
        </div>

        <div className="mb-6 grid gap-5 rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-black text-[#0B3558]">Upcoming visits</div>
            <button onClick={generateVisits} className="rounded-full bg-[#0B3558] px-4 py-2.5 text-sm font-black text-white hover:bg-[#164A75]">
              Generate upcoming visits
            </button>
          </div>
          <div>
            <div className="mb-2 text-sm font-black text-[#0B3558]">Arrange backup cover</div>
            <div className="flex gap-2">
              <select value={offStaff} onChange={e => setOffStaff(e.target.value)} className="flex-1 rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-3 py-2.5 text-sm text-[#0B3558]">
                <option value="">Cleaner...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="date" value={offDate} onChange={e => setOffDate(e.target.value)} className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-3 py-2.5 text-sm text-[#0B3558]" />
              <button onClick={reportOff} className="whitespace-nowrap rounded-full border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-2.5 text-sm font-black text-[#0B3558] hover:border-[#1D7ED0]">Arrange cover</button>
            </div>
          </div>
          {toolMsg && <div className="text-sm font-bold text-[#1D7ED0] md:col-span-2">{toolMsg}</div>}
        </div>

        {loading ? (
          <div className="text-[#60798F]">Loading...</div>
        ) : subs.length === 0 ? (
          <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-10 text-center text-[#60798F] shadow-sm">No plan requests yet.</div>
        ) : (
          <div className="grid gap-4">
            {subs.map(sub => (
              <div key={sub.id} className="flex flex-col justify-between gap-4 rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-[#0B3558]">{sub.customers?.name || 'Unknown'}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-black ${STATUS_STYLES[sub.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>{sub.status}</span>
                    <span className="text-xs font-bold capitalize text-[#60798F]">{sub.property_type} · {sub.frequency}</span>
                  </div>
                  <div className="text-sm font-bold text-[#60798F]">{sub.address}, {sub.suburb} · {sizeLabel(sub)}</div>
                  <div className="mt-1 text-xs text-[#60798F]">
                    Preferred: {sub.preferred_day || '-'} {sub.preferred_time?.slice(0,5) || ''} · Cleaner: {staffName(sub.primary_staff_id)} · Backup: {staffName(sub.backup_staff_id)}
                    {sub.price_cents ? ` · $${(sub.price_cents/100).toFixed(2)}/visit` : ''}
                  </div>
                  {sub.notes && <div className="mt-1 text-xs italic text-[#60798F]">{sub.notes}</div>}
                  {sub.photos && sub.photos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {sub.photos.map(url => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block h-12 w-12 overflow-hidden rounded-[8px] border border-[#B9CFDE]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Booking photo" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => openActivate(sub)} className="whitespace-nowrap rounded-[8px] bg-[#0B3558] px-6 py-3 text-sm font-black text-white">
                  {sub.status === 'requested' ? 'Price and assign' : 'Edit'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activate modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-7 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="mb-1 text-xl font-black text-[#0B3558]">Price and assign</h2>
            <p className="mb-5 text-sm font-bold text-[#60798F]">{selected.customers?.name} · {selected.property_type} · {selected.frequency}</p>

            <label className="mb-1 block text-sm font-black text-[#60798F]">Per-visit price (AUD)</label>
            <input type="number" min={0} step="0.01" value={price} onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 140" className="mb-4 w-full rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-3 text-sm text-[#0B3558] placeholder:text-[#8AA0AC]" />

            <label className="mb-1 block text-sm font-black text-[#60798F]">Primary cleaner</label>
            <select value={primary} onChange={e => setPrimary(e.target.value)} className="mb-4 w-full rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-3 text-sm text-[#0B3558]">
              <option value="">Unassigned</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <label className="mb-1 block text-sm font-black text-[#60798F]">Backup cleaner</label>
            <select value={backup} onChange={e => setBackup(e.target.value)} className="mb-5 w-full rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-3 text-sm text-[#0B3558]">
              <option value="">Unassigned</option>
              {staff.filter(s => s.id !== primary).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {error && <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
            {msg && <div className="mb-4 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{msg}</div>}

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 rounded-[8px] border border-[#B9CFDE] py-3 text-sm font-black text-[#0B3558] transition hover:bg-[#DDECF5]">Cancel</button>
              <button onClick={activate} disabled={saving || !price} className="flex-1 rounded-[8px] bg-[#0B3558] py-3 text-sm font-black text-white transition hover:bg-[#164A75] disabled:opacity-50">
                {saving ? 'Saving...' : 'Confirm plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

