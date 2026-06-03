import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

// Admin-only: timesheet entries with staff names + per-staff totals.
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('timesheets')
    .select('id, date, hours_worked, hourly_rate, xero_synced, booking_id, staff(name)')
    .order('date', { ascending: false })
    .limit(300)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data || []) as unknown as { id: string; date: string; hours_worked: number | null; staff: { name: string } | null }[]
  const byStaff = new Map<string, number>()
  let totalHours = 0
  for (const r of rows) {
    const h = Number(r.hours_worked) || 0
    totalHours += h
    const name = r.staff?.name || 'Unassigned'
    byStaff.set(name, (byStaff.get(name) || 0) + h)
  }

  return NextResponse.json({
    timesheets: data || [],
    totals: {
      totalHours: Math.round(totalHours * 100) / 100,
      byStaff: [...byStaff.entries()].map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 })),
    },
  })
}
