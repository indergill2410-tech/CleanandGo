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
    <div className="min-h-screen bg-[#EFF7FC] px-4 py-5 text-[#0B3558] sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">Back to overview</Link>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-[#0B3558]">Timesheets</h1>
          <p className="mt-1 text-sm font-bold text-[#60798F]">Hours logged when cleaners complete jobs. Use this for weekly payroll review.</p>
        </div>

        <div className="mb-6 rounded-[8px] border border-[#CFE0ED] bg-white p-5 shadow-sm">
          <div className="mb-3 text-sm font-bold text-[#60798F]">Total hours logged: <span className="text-lg font-black text-[#0B3558]">{totals.totalHours}</span></div>
          <div className="flex flex-wrap gap-2">
            {totals.byStaff.map(s => (
              <span key={s.name} className="rounded-full bg-[#EFF7FC] px-3 py-1 text-sm font-bold text-[#0B3558]">{s.name}: <b>{s.hours}h</b></span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-[#60798F]">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-[8px] border border-[#CFE0ED] bg-white p-12 text-center text-[#60798F] shadow-sm">No timesheet entries yet.</div>
        ) : (
          <div className="space-y-2">
            {rows.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-[8px] border border-[#CFE0ED] bg-white p-4 shadow-sm">
                <div>
                  <div className="font-black text-[#0B3558]">{r.staff?.name || 'Unassigned'}</div>
                  <div className="text-xs text-[#60798F]">{r.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-black text-[#0B3558]">{Number(r.hours_worked || 0)}h</div>
                    {r.hourly_rate != null && <div className="text-xs text-[#60798F]">${Number(r.hourly_rate)}/h</div>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-black ${r.xero_synced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
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
