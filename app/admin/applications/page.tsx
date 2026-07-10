'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, FileText, Mail, Phone, Search, ShieldCheck, UserPlus } from 'lucide-react'

type Application = {
  id: string
  name: string
  email: string
  phone: string
  suburbs: string | null
  experience: string | null
  availability: string | null
  tfn: string | null
  abn: string | null
  has_abn: boolean
  right_to_work: boolean
  resume_url: string | null
  has_police_check: boolean
  police_check_url: string | null
  has_wwcc: boolean
  wwcc_url: string | null
  status: string
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-amber-100 text-amber-800 border-amber-200',
  reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
}

const FILTERS = ['all', 'new', 'reviewing', 'approved', 'rejected']

export default function AdminApplications() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const load = async () => {
    try {
      const data = await fetch('/api/careers/apply').then(r => r.json())
      setApps(data.applications || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return apps.filter((app) => {
      const matchesStatus = filter === 'all' || app.status === filter
      const matchesQuery = !q || [app.name, app.email, app.phone, app.suburbs, app.availability].some((value) => value?.toLowerCase().includes(q))
      return matchesStatus && matchesQuery
    })
  }, [apps, filter, query])

  const counts = useMemo(() => ({
    total: apps.length,
    new: apps.filter(app => app.status === 'new').length,
    reviewing: apps.filter(app => app.status === 'reviewing').length,
    approved: apps.filter(app => app.status === 'approved').length,
  }), [apps])

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
        prompt('Approved. Email could not be sent. Copy this set-password link for the cleaner:', data.inviteLink)
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
    <main className="min-h-screen bg-[#EAF6FC] text-[#0B3558]">
      <header className="border-b border-[#B9CFDE] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-black text-[#1D7ED0]">
            <ArrowLeft className="h-4 w-4" />
            Operations dashboard
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">Cleaner applications</h1>
              <p className="mt-1 text-[#60798F]">Review, verify, and onboard applicants into staff login.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total', value: counts.total },
                { label: 'New', value: counts.new },
                { label: 'Reviewing', value: counts.reviewing },
                { label: 'Approved', value: counts.approved },
              ].map((item) => (
                <div key={item.label} className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FAFC] px-4 py-3">
                  <div className="text-2xl font-black">{item.value}</div>
                  <div className="text-xs font-bold text-[#60798F]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="mb-5 flex flex-col gap-3 rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-black ${filter === item ? 'bg-[#0B3558] text-white' : 'bg-[#EAF6FC] text-[#60798F]'}`}>
                {item === 'all' ? 'All applicants' : item}
              </button>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-2 rounded-full border border-[#B9CFDE] bg-[#F8FAFC] px-4 lg:w-80">
            <Search className="h-4 w-4 text-[#60798F]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, area, phone" className="w-full bg-transparent text-sm outline-none" />
          </label>
        </section>

        {loading ? (
          <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-10 text-center text-[#60798F]">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-10 text-center text-[#60798F]">No applications in this view.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => (
              <article key={app.id} className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black">{app.name}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${STATUS_STYLES[app.status] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>{app.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#60798F]">
                      <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{app.email}</span>
                      <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" />{app.phone}</span>
                      <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />{app.suburbs || 'Area not supplied'}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#60798F]" suppressHydrationWarning>{new Date(app.created_at).toLocaleDateString()}</div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <InfoTile label="Availability" value={app.availability || 'Not supplied'} />
                  <InfoTile label="Right to work" value={app.right_to_work ? 'Verified yes' : 'Needs review'} />
                  <InfoTile label="TFN" value={app.tfn ? 'Supplied' : 'Missing'} />
                  <InfoTile label="ABN" value={app.abn || 'Not supplied'} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {app.has_police_check && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800"><ShieldCheck className="h-3.5 w-3.5" />Police check</span>}
                  {app.has_wwcc && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800"><BadgeCheck className="h-3.5 w-3.5" />WWCC</span>}
                </div>

                {app.experience && <div className="mt-4 rounded-[8px] bg-[#EAF6FC] p-4 text-sm text-[#60798F]">{app.experience}</div>}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {app.resume_url && <DocLink href={`/api/careers/${app.id}/resume?doc=resume`} label="Resume" />}
                  {app.police_check_url && <DocLink href={`/api/careers/${app.id}/resume?doc=police`} label="Police check" />}
                  {app.wwcc_url && <DocLink href={`/api/careers/${app.id}/resume?doc=wwcc`} label="WWCC" />}
                  {app.status !== 'approved' && (
                    <>
                      {app.status === 'new' && (
                        <button onClick={() => act(app.id, 'reviewing')} disabled={busy === app.id} className="min-h-11 rounded-full border border-[#B9CFDE] px-4 text-sm font-black text-[#0B3558] disabled:opacity-50">Mark reviewing</button>
                      )}
                      <button onClick={() => act(app.id, 'approve')} disabled={busy === app.id} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0B3558] px-5 text-sm font-black text-white disabled:opacity-50">
                        <UserPlus className="h-4 w-4" />
                        Approve cleaner
                      </button>
                      <button onClick={() => act(app.id, 'reject')} disabled={busy === app.id} className="min-h-11 rounded-full border border-red-200 px-4 text-sm font-black text-red-600 disabled:opacity-50">Reject</button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-[#EAF6FC] p-4">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-[#60798F]">{label}</div>
      <div className="mt-1 font-black">{value}</div>
    </div>
  )
}

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#B9CFDE] px-4 text-sm font-black text-[#0B3558] hover:border-[#1D7ED0]">
      <FileText className="h-4 w-4" />
      {label}
    </a>
  )
}

