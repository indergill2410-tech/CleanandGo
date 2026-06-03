'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Row = { id: string; date: string; hours_worked: number | null; hourly_rate: number | null; xero_synced: boolean; staff: { name: string } | null }
type Totals = { totalHours: number; byStaff: { name: string; hours: number }[] }

export default function AdminTimesheets() {
  const [rows, setRows] = useState<Row[]>([])
  const [totals, setTotals] = useState<Totals>({ totalHours: 0, byStaff: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/timesheets').then(r => r.json()).then(d => {
      setRows(d.timesheets || [])
      if (d.totals) setTotals(d.totals)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Timesheets</h1>
          <p className="text-white/50 mt-1">Hours logged when cleaners complete jobs. The weekly payroll export feeds from here.</p>
        </div>

        <div className="glass-strong rounded-2xl p-5 mb-6">
          <div className="text-white/60 text-sm mb-3">Total hours logged: <span className="text-white font-bold text-lg">{totals.totalHours}</span></div>
          <div className="flex flex-wrap gap-2">
            {totals.byStaff.map(s => (
              <span key={s.name} className="text-sm bg-white/10 rounded-full px-3 py-1 text-white/80">{s.name}: <b>{s.hours}h</b></span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center text-white/40">No timesheet entries yet.</div>
        ) : (
          <div className="space-y-2">
            {rows.map(r => (
              <div key={r.id} className="glass-strong rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-white font-semibold">{r.staff?.name || 'Unassigned'}</div>
                  <div className="text-white/40 text-xs">{r.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white font-bold">{Number(r.hours_worked || 0)}h</div>
                    {r.hourly_rate != null && <div className="text-white/40 text-xs">${Number(r.hourly_rate)}/h</div>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.xero_synced ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {r.xero_synced ? 'synced' : 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
