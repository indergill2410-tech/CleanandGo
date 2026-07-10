'use client'

import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Mail, MapPin, Phone, Plus, ShieldCheck, UserRoundCog, UsersRound } from 'lucide-react'

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
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await fetch('/api/staff?all=true').then((response) => response.json())
      setStaff(data.staff || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const totals = useMemo(() => ({
    all: staff.length,
    cleaners: staff.filter((member) => member.role === 'cleaner').length,
    admins: staff.filter((member) => member.role === 'admin').length,
    active: staff.filter((member) => member.status === 'active').length,
    noLogin: staff.filter((member) => !member.user_id).length,
  }), [staff])

  const add = async (event: React.FormEvent) => {
    event.preventDefault()
    setAdding(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not add staff member.')
        return
      }
      setMessage(data.emailed ? `Invite emailed to ${form.email}.` : 'Created. Email is not configured.')
      if (!data.emailed && data.inviteLink) window.prompt('Set-password link to send manually:', data.inviteLink)
      setForm({ name: '', email: '', phone: '', suburb: '', role: 'cleaner' })
      await load()
    } catch {
      setError('Network error while adding staff.')
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
      if (!res.ok) window.alert(data.error || 'Update failed')
    } catch {
      window.alert('Network error')
    } finally {
      await load()
      setBusy('')
    }
  }

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="rounded-[8px] border border-[#D4E1E8] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1670A8]">Staff hub</p>
          <h1 className="mt-2 text-3xl font-black text-[#102D42]">Cleaner, admin, access, and readiness control</h1>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#5C7180]">Keep the people layer tied to the operating system: who can log in, who is active, who cleans, and who can run the business.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="Staff" value={totals.all} icon={UsersRound} />
            <Stat label="Cleaners" value={totals.cleaners} icon={ShieldCheck} />
            <Stat label="Admins" value={totals.admins} icon={UserRoundCog} />
            <Stat label="Active" value={totals.active} icon={BadgeCheck} />
            <Stat label="No login" value={totals.noLogin} icon={Mail} />
          </div>
        </section>

        <form onSubmit={add} className="rounded-[8px] border border-[#D4E1E8] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-[#102D42]">Invite staff</h2>
          <div className="mt-4 grid gap-3">
            <Field placeholder="Full name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
            <Field type="email" placeholder="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field placeholder="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
              <Field placeholder="Suburb" value={form.suburb} onChange={(value) => setForm((current) => ({ ...current, suburb: value }))} />
            </div>
            <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="min-h-11 rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] px-3 text-sm font-bold text-[#102D42]">
              <option value="cleaner">Cleaner</option>
              <option value="admin">Admin</option>
            </select>
            {error && <div className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div>}
            {message && <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{message}</div>}
            <button type="submit" disabled={adding} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0A2537] px-5 text-sm font-black text-white disabled:opacity-50">
              <Plus className="h-4 w-4" />
              {adding ? 'Adding...' : 'Add and send invite'}
            </button>
          </div>
        </form>
      </div>

      <section className="mt-5 overflow-hidden rounded-[8px] border border-[#D4E1E8] bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-sm font-bold text-[#5C7180]">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-[#5C7180]">No staff members yet.</div>
        ) : staff.map((member) => (
          <article key={member.id} className="grid gap-4 border-b border-[#D4E1E8] p-4 last:border-b-0 xl:grid-cols-[1fr_auto] xl:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-[#102D42]">{member.name}</h2>
                <Status value={member.role} tone={member.role === 'admin' ? 'amber' : 'blue'} />
                <Status value={member.status} tone={member.status === 'active' ? 'green' : 'slate'} />
                {!member.user_id && <Status value="no login" tone="red" />}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-[#5C7180]">
                <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{member.email}</span>
                {member.phone && <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{member.phone}</span>}
                {member.suburb && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{member.suburb}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.role === 'cleaner' ? (
                <Action onClick={() => update(member.id, { role: 'admin' })} disabled={busy === member.id}>Make admin</Action>
              ) : (
                <Action onClick={() => update(member.id, { role: 'cleaner' })} disabled={busy === member.id}>Make cleaner</Action>
              )}
              {member.status === 'active' ? (
                <Action danger onClick={() => update(member.id, { status: 'inactive' })} disabled={busy === member.id}>Deactivate</Action>
              ) : (
                <Action onClick={() => update(member.id, { status: 'active' })} disabled={busy === member.id}>Activate</Action>
              )}
            </div>
          </article>
        ))}
      </section>
    </section>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof UsersRound }) {
  return (
    <div className="rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] p-3">
      <Icon className="h-4 w-4 text-[#1670A8]" />
      <div className="mt-2 text-2xl font-black text-[#102D42]">{value}</div>
      <div className="text-xs font-bold text-[#5C7180]">{label}</div>
    </div>
  )
}

function Field({ value, onChange, placeholder, type = 'text', required = false }: { value: string; onChange: (value: string) => void; placeholder: string; type?: string; required?: boolean }) {
  return <input type={type} value={value} required={required} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-[8px] border border-[#D4E1E8] bg-[#F7FAFC] px-3 text-sm font-bold text-[#102D42] placeholder:text-[#8AA0AC]" />
}

function Status({ value, tone }: { value: string; tone: 'amber' | 'blue' | 'green' | 'slate' | 'red' }) {
  const tones = {
    amber: 'bg-amber-100 text-amber-900',
    blue: 'bg-blue-100 text-blue-900',
    green: 'bg-emerald-100 text-emerald-900',
    slate: 'bg-slate-100 text-slate-700',
    red: 'bg-red-100 text-red-800',
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${tones[tone]}`}>{value}</span>
}

function Action({ children, onClick, disabled, danger = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`min-h-10 rounded-[8px] border px-3 text-sm font-black disabled:opacity-50 ${danger ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-[#D4E1E8] text-[#102D42] hover:bg-[#F7FAFC]'}`}>
      {children}
    </button>
  )
}
