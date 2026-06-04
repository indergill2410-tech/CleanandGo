'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PhotoUpload from '@/components/PhotoUpload'

type Job = {
  id: string
  service_type: string
  status: string
  scheduled_date: string
  scheduled_time: string
  address: string
  suburb: string | null
  bedrooms: number | null
  bathrooms: number | null
  extras: string[] | null
  notes: string | null
  covered_by_backup: boolean
  customers?: { name: string; phone: string } | null
}

const SERVICE_LABELS: Record<string, string> = {
  recurring: 'Recurring Clean', oneoff: 'One-Off Clean', endoflease: 'End of Lease',
}

export default function CleanerPortal() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [staffName, setStaffName] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState('')
  const [before, setBefore] = useState<Record<string, string[]>>({})
  const [after, setAfter] = useState<Record<string, string[]>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const res = await fetch('/api/cleaner/jobs')
    if (res.status === 401 || res.status === 403) { router.push('/login?redirectTo=/cleaner'); return }
    const data = await res.json()
    setJobs(data.jobs || [])
    setStaffName(data.staffName || '')
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const start = async (id: string) => {
    setBusy(id)
    await fetch(`/api/cleaner/jobs/${id}/start`, { method: 'POST' })
    await load()
    setBusy('')
  }

  const complete = async (id: string) => {
    setBusy(id)
    await fetch(`/api/cleaner/jobs/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beforePhotos: before[id] || [], afterPhotos: after[id] || [], notes: notes[id] || '' }),
    })
    setExpanded(null)
    await load()
    setBusy('')
  }

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  const next = jobs[0]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <div className="text-white font-bold">cleanngo Staff</div>
            <div className="text-white/50 text-xs">{staffName}</div>
          </div>
          <button onClick={signOut} className="text-white/60 text-sm hover:text-white">Sign out</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-24 pb-12">
        <div className="glass-strong rounded-2xl p-5 mb-6">
          <div className="text-white/60 text-sm mb-1">My active jobs</div>
          <div className="text-4xl font-bold text-white">{jobs.length}</div>
          {next && <div className="text-white/50 text-xs mt-1">Next: {next.address} · {next.scheduled_date} {next.scheduled_time?.slice(0, 5)}</div>}
        </div>

        <h2 className="text-white font-semibold mb-4">My Jobs</h2>

        {loading ? (
          <div className="text-white/50 text-center py-10">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-white/50">No jobs assigned right now.</div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(expanded === job.id ? null : job.id)} className="w-full p-5 text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">{job.address}</div>
                      <div className="text-white/60 text-xs">
                        {job.scheduled_date} {job.scheduled_time?.slice(0, 5)} · {SERVICE_LABELS[job.service_type] || job.service_type} · {job.bedrooms ?? '?'}bed/{job.bathrooms ?? '?'}bath
                      </div>
                      {job.covered_by_backup && <div className="text-amber-300 text-xs mt-1">🛟 Backup coverage</div>}
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${job.status === 'in_progress' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {job.status === 'in_progress' ? 'In progress' : 'Confirmed'}
                    </span>
                  </div>
                </button>

                {expanded === job.id && (
                  <div className="px-5 pb-5 border-t border-white/10 space-y-4 pt-4">
                    <div className="text-white/60 text-sm">
                      <div>{job.customers?.name}{job.customers?.phone ? ` · ${job.customers.phone}` : ''}</div>
                      {job.extras && job.extras.length > 0 && <div className="text-white/40 text-xs mt-1">Extras: {job.extras.join(', ')}</div>}
                      {job.notes && <div className="mt-2 bg-white/5 rounded-xl p-3 text-white/70 text-sm">{job.notes}</div>}
                    </div>

                    {job.status === 'confirmed' ? (
                      <button onClick={() => start(job.id)} disabled={busy === job.id}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50">
                        🟢 Start job
                      </button>
                    ) : (
                      <>
                        <PhotoUpload label="Before photos" urls={before[job.id] || []} onChange={u => setBefore(b => ({ ...b, [job.id]: u }))} />
                        <PhotoUpload label="After photos" urls={after[job.id] || []} onChange={u => setAfter(a => ({ ...a, [job.id]: u }))} />
                        <textarea rows={2} placeholder="Notes for admin…" value={notes[job.id] || ''}
                          onChange={e => setNotes(n => ({ ...n, [job.id]: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none" />
                        <button onClick={() => complete(job.id)} disabled={busy === job.id}
                          className="w-full py-3 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition disabled:opacity-50">
                          ✅ Mark job complete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
