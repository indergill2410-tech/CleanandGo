'use client'
import { useState } from 'react'

const MOCK_JOBS = [
  { id: '1', address: '42 Chapel St, South Yarra', time: '9:00 AM', service: 'Recurring', status: 'confirmed', beds: 3, baths: 2 },
  { id: '2', address: '18 Bridge Rd, Richmond', time: '1:00 PM', service: 'End of Lease', status: 'pending', beds: 2, baths: 1 },
]

const CHECKLIST = [
  'Vacuum all floors', 'Mop hard floors', 'Clean bathrooms', 'Clean kitchen benches',
  'Wipe appliances', 'Empty bins', 'Dust surfaces', 'Clean windows (inside)',
]

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  pending:   'bg-amber-100 text-amber-700',
  inprogress:'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
}

export default function CleanerPortal() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [clocked, setClocked] = useState<Record<string, boolean>>({})

  const toggleCheck = (key: string) => setChecked(c => ({ ...c, [key]: !c[key] }))
  const completedCount = Object.values(checked).filter(Boolean).length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Clean&amp;Go Staff</div>
            <div className="text-white/50 text-xs">Wednesday, 3 June 2026</div>
          </div>
          <div className="w-10 h-10 rounded-full gradient-cta flex items-center justify-center text-white font-bold">A</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-24 pb-12">
        {/* Today summary */}
        <div className="glass-strong rounded-2xl p-5 mb-6">
          <div className="text-white/60 text-sm mb-1">Today\'s jobs</div>
          <div className="text-4xl font-bold text-white">{MOCK_JOBS.length}</div>
          <div className="text-white/50 text-xs mt-1">Next: {MOCK_JOBS[0].address} at {MOCK_JOBS[0].time}</div>
        </div>

        <h2 className="text-white font-semibold mb-4">My Jobs</h2>
        <div className="space-y-4">
          {MOCK_JOBS.map(job => (
            <div key={job.id} className="glass rounded-2xl overflow-hidden">
              {/* Job header */}
              <button
                onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold text-sm mb-1">{job.address}</div>
                    <div className="text-white/60 text-xs">{job.time} · {job.service} · {job.beds}bed/{job.baths}bath</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[job.status]}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <span className="text-white/40 text-xs">{expanded === job.id ? '▲' : '▼'}</span>
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === job.id && (
                <div className="px-5 pb-5 border-t border-white/10">
                  {/* Clock in/out */}
                  <div className="my-4">
                    <button
                      onClick={() => setClocked(c => ({ ...c, [job.id]: !c[job.id] }))}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                        clocked[job.id]
                          ? 'bg-red-500/80 text-white'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {clocked[job.id] ? '🔴 Clock Out' : '🟢 Clock In'}
                    </button>
                  </div>

                  {/* Checklist */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/70 text-sm">Checklist</span>
                      <span className="text-white/50 text-xs">{completedCount}/{CHECKLIST.length}</span>
                    </div>
                    <div className="space-y-2">
                      {CHECKLIST.map((item, i) => {
                        const key = `${job.id}-${i}`
                        return (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              checked[key]
                                ? 'bg-green-500 border-green-500'
                                : 'border-white/30'
                            }`}>
                              {checked[key] && <span className="text-white text-xs">✓</span>}
                            </div>
                            <input type="checkbox" className="hidden" onChange={() => toggleCheck(key)} />
                            <span className={`text-sm ${
                              checked[key] ? 'text-white/40 line-through' : 'text-white/80'
                            }`}>{item}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Photo upload */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {['Before', 'After'].map(label => (
                      <div key={label}
                        className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:bg-white/10 transition"
                      >
                        <div className="text-2xl mb-1">📷</div>
                        <div className="text-white/50 text-xs">{label} photo</div>
                      </div>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Notes for admin..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none mb-4"
                  />

                  <button className="w-full py-3 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition">
                    ✅ Mark Job Complete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
