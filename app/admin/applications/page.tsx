'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Application = {
  id: string
  name: string
  email: string
  phone: string
  suburbs: string | null
  experience: string | null
  availability: string | null
  has_abn: boolean
  right_to_work: boolean
  resume_url: string | null
  status: string
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  new:       'bg-amber-500/20 text-amber-300',
  reviewing: 'bg-blue-500/20 text-blue-300',
  approved:  'bg-green-500/20 text-green-300',
  rejected:  'bg-red-500/20 text-red-300',
}

export default function AdminApplications() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')

  const load = async () => {
    try {
      const data = await fetch('/api/careers/apply').then(r => r.json())
      setApps(data.applications || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const act = async (id: string, action: 'reviewing' | 'approve' | 'reject') => {
    if (action === 'approve' && !confirm('Approve this applicant and add them as a cleaner?')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/careers/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data.error || `Action failed: ${res.statusText}`)
      } else if (action === 'approve' && data.emailed === false && data.inviteLink) {
        // Email couldn't be sent — give the admin the invite link to share.
        prompt('Approved. Email could not be sent — copy this set-password link for the cleaner:', data.inviteLink)
      }
    } catch (e) {
      console.error(e)
      alert('A network error occurred. Please try again.')
    } finally {
      await load()
      setBusy('')
    }
  }

  return (
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Cleaner Applications</h1>
          <p className="text-white/50 mt-1">Review applicants and approve them into your team.</p>
        </div>

        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : apps.length === 0 ? (
          <div className="glass-strong rounded-2xl p-10 text-center text-white/60">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {apps.map(a => (
              <div key={a.id} className="glass-strong rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{a.name}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_STYLES[a.status] || 'bg-white/10 text-white/60'}`}>{a.status}</span>
                  </div>
                  <span className="text-white/40 text-xs" suppressHydrationWarning>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-white/60 text-sm">{a.email} · {a.phone}</div>
                <div className="text-white/40 text-xs mt-1">
                  Area: {a.suburbs || '—'} · Availability: {a.availability || '—'} · ABN: {a.has_abn ? 'yes' : 'no'} · Right to work: {a.right_to_work ? 'yes' : 'no'}
                </div>
                {a.experience && <div className="text-white/50 text-sm mt-2 italic">“{a.experience}”</div>}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {a.resume_url && (
                    <a href={`/api/careers/${a.id}/resume`} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-white/10">Resume ↗</a>
                  )}
                  {a.status !== 'approved' && (
                    <>
                      {a.status === 'new' && (
                        <button onClick={() => act(a.id, 'reviewing')} disabled={busy === a.id} className="text-sm px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">Mark reviewing</button>
                      )}
                      <button onClick={() => act(a.id, 'approve')} disabled={busy === a.id} className="text-sm px-4 py-2 rounded-full bg-white text-[#2C4A6E] font-semibold hover:bg-white/90 disabled:opacity-50">Approve &amp; add as cleaner</button>
                      <button onClick={() => act(a.id, 'reject')} disabled={busy === a.id} className="text-sm px-4 py-2 rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10 disabled:opacity-50">Reject</button>
                    </>
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
