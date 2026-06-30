'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BriefcaseBusiness, CalendarDays, Camera, CheckCircle2, Clock, MapPin, ShieldCheck, UserRound } from 'lucide-react'
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

type ProfileJob = {
  id: string
  status: string
  scheduled_date: string
  covered_by_backup: boolean
  job_completions?: { before_photos: string[] | null; after_photos: string[] | null; submitted_at: string | null }[] | null
}

type CleanerProfile = {
  staff: { name: string; email: string; phone: string | null; suburb: string | null; role: string; status: string }
  jobs: ProfileJob[]
  timesheets: { id: string; date: string; hours_worked: number; hourly_rate: number; xero_synced: boolean }[]
}

const SERVICE_LABELS: Record<string, string> = {
  recurring: 'Recurring clean',
  oneoff: 'One-off clean',
  endoflease: 'End-of-lease clean',
}

const dateLabel = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const timeLabel = (time?: string | null) => time ? time.slice(0, 5) : 'Time pending'

export default function CleanerPortal() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [profile, setProfile] = useState<CleanerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState('')
  const [before, setBefore] = useState<Record<string, string[]>>({})
  const [after, setAfter] = useState<Record<string, string[]>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const [jobsRes, profileRes] = await Promise.all([
      fetch('/api/cleaner/jobs'),
      fetch('/api/cleaner/profile'),
    ])
    if (jobsRes.status === 401 || jobsRes.status === 403 || profileRes.status === 401 || profileRes.status === 403) {
      router.push('/login?redirectTo=/cleaner')
      return
    }
    const jobsData = await jobsRes.json()
    const profileData = await profileRes.json()
    setJobs(jobsData.jobs || [])
    setProfile(profileData)
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => {
    const all = profile?.jobs || []
    const completed = all.filter((job) => job.status === 'completed').length
    const upcoming = all.filter((job) => ['confirmed', 'in_progress'].includes(job.status)).length
    const backup = all.filter((job) => job.covered_by_backup).length
    const proof = all.filter((job) => {
      const done = job.job_completions?.[0]
      return (done?.before_photos || []).length > 0 || (done?.after_photos || []).length > 0
    }).length
    return { completed, upcoming, backup, proof }
  }, [profile])

  const start = async (id: string) => {
    setBusy(id)
    await fetch(`/api/cleaner/jobs/${id}/start`, { method: 'POST' })
    await load()
    setExpanded(id)
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
    router.push('/login?tab=staff')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F4F7FA] text-[#0B3558]">Loading your workboard...</div>
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-[#0B3558]">
      <header className="border-b border-[#DCE5ED] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-sm font-bold text-[#1D7ED0]">cleanngo home</Link>
            <h1 className="mt-2 text-3xl font-black">Cleaner workboard</h1>
            <p className="mt-1 text-[#60798F]">Your assigned jobs, proof uploads, and profile details.</p>
          </div>
          <button onClick={signOut} className="w-fit rounded-full border border-[#DCE5ED] px-5 py-3 text-sm font-black text-[#60798F]">Sign out</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-[8px] border border-[#DCE5ED] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#0B3558] text-white">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xl font-black">{profile?.staff.name}</div>
                <div className="text-sm font-bold text-[#60798F] capitalize">{profile?.staff.role} · {profile?.staff.status}</div>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-[#60798F]">
              <div>{profile?.staff.email}</div>
              <div>{profile?.staff.phone || 'Phone not set'}</div>
              <div>{profile?.staff.suburb || 'Primary area not set'}</div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active jobs', value: stats.upcoming, icon: CalendarDays },
              { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
              { label: 'Backup jobs', value: stats.backup, icon: ShieldCheck },
              { label: 'Proof sets', value: stats.proof, icon: Camera },
            ].map((item) => (
              <div key={item.label} className="rounded-[8px] border border-[#DCE5ED] bg-white p-4 shadow-sm">
                <item.icon className="h-5 w-5 text-[#1D7ED0]" />
                <div className="mt-3 text-2xl font-black">{item.value}</div>
                <div className="text-xs font-bold text-[#60798F]">{item.label}</div>
              </div>
            ))}
          </section>

          <section className="rounded-[8px] border border-[#DCE5ED] bg-white p-5 shadow-sm">
            <h2 className="font-black">Professional standard</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#60798F]">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Arrive on time and start the job in-app.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Upload before and after photos for proof.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Leave clear notes for admin when anything changes.</li>
            </ul>
          </section>
        </aside>

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Today and upcoming</p>
              <h2 className="text-2xl font-black">Assigned jobs</h2>
            </div>
            <span className="text-sm font-bold text-[#60798F]">{jobs.length} active job{jobs.length === 1 ? '' : 's'}</span>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-[8px] border border-[#DCE5ED] bg-white p-10 text-center text-[#60798F]">No jobs assigned right now.</div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <article key={job.id} className="overflow-hidden rounded-[8px] border border-[#DCE5ED] bg-white shadow-sm">
                  <button onClick={() => setExpanded(expanded === job.id ? null : job.id)} className="w-full p-5 text-left">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-lg font-black">{SERVICE_LABELS[job.service_type] || job.service_type}</div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#60798F]">
                          <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{dateLabel(job.scheduled_date)}</span>
                          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{timeLabel(job.scheduled_time)}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.suburb || job.address}</span>
                        </div>
                      </div>
                      <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${job.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {job.status === 'in_progress' ? 'In progress' : 'Ready to start'}
                      </span>
                    </div>
                  </button>

                  {expanded === job.id && (
                    <div className="border-t border-[#DCE5ED] p-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-[8px] bg-[#F4F7FA] p-4">
                          <BriefcaseBusiness className="h-5 w-5 text-[#1D7ED0]" />
                          <div className="mt-3 text-sm text-[#60798F]">Customer</div>
                          <div className="font-black">{job.customers?.name || 'Customer'}</div>
                          <div className="text-sm text-[#60798F]">{job.customers?.phone || 'No phone'}</div>
                        </div>
                        <div className="rounded-[8px] bg-[#F4F7FA] p-4">
                          <MapPin className="h-5 w-5 text-[#1D7ED0]" />
                          <div className="mt-3 text-sm text-[#60798F]">Address</div>
                          <div className="font-black">{job.address}</div>
                        </div>
                        <div className="rounded-[8px] bg-[#F4F7FA] p-4">
                          <ShieldCheck className="h-5 w-5 text-[#1D7ED0]" />
                          <div className="mt-3 text-sm text-[#60798F]">Scope</div>
                          <div className="font-black">{job.bedrooms ?? '?'} bed · {job.bathrooms ?? '?'} bath</div>
                          {job.covered_by_backup && <div className="text-sm font-bold text-amber-700">Backup coverage</div>}
                        </div>
                      </div>

                      {(job.extras?.length || job.notes) && (
                        <div className="mt-4 rounded-[8px] bg-[#F4F7FA] p-4 text-sm text-[#60798F]">
                          {job.extras && job.extras.length > 0 && <div><span className="font-black text-[#0B3558]">Extras:</span> {job.extras.join(', ')}</div>}
                          {job.notes && <div className="mt-2"><span className="font-black text-[#0B3558]">Notes:</span> {job.notes}</div>}
                        </div>
                      )}

                      {job.status === 'confirmed' ? (
                        <button onClick={() => start(job.id)} disabled={busy === job.id} className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-4 font-black text-white disabled:opacity-50">
                          Start job
                        </button>
                      ) : (
                        <div className="mt-5 space-y-4">
                          <PhotoUpload label="Before photos" urls={before[job.id] || []} onChange={urls => setBefore(current => ({ ...current, [job.id]: urls }))} />
                          <PhotoUpload label="After photos" urls={after[job.id] || []} onChange={urls => setAfter(current => ({ ...current, [job.id]: urls }))} />
                          <textarea rows={3} placeholder="Completion notes for admin..." value={notes[job.id] || ''}
                            onChange={event => setNotes(current => ({ ...current, [job.id]: event.target.value }))}
                            className="w-full rounded-xl border border-[#DCE5ED] px-4 py-3 text-sm" />
                          <button onClick={() => complete(job.id)} disabled={busy === job.id} className="w-full rounded-xl bg-[#0B3558] px-5 py-4 font-black text-white disabled:opacity-50">
                            Mark job complete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
