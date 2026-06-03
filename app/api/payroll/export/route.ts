import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Weekly payroll export to Xero AU.
// Scheduled on Render as a Cron Job that calls this endpoint with:
//   Authorization: Bearer $CRON_SECRET
// Accepts GET (scheduler-friendly) and POST.
async function handle(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const provided = req.headers.get('authorization')
  if (!cronSecret || provided !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // 1. Pull this week's un-synced timesheets, with staff details for grouping.
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // back to Sunday
  weekStart.setHours(0, 0, 0, 0)

  const { data: timesheets, error } = await supabase
    .from('timesheets')
    .select('id, staff_id, hours_worked, hourly_rate, staff(name, xero_employee_id)')
    .gte('date', weekStart.toISOString().slice(0, 10))
    .eq('xero_synced', false)

  if (error) {
    console.error('Payroll fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 2. Aggregate hours per staff member.
  const byStaff = new Map<string, { name: string; xeroId: string | null; hours: number }>()
  for (const t of timesheets ?? []) {
    // @ts-expect-error - staff is an embedded relation
    const name: string = t.staff?.name ?? 'Unknown'
    // @ts-expect-error - staff is an embedded relation
    const xeroId: string | null = t.staff?.xero_employee_id ?? null
    const existing = byStaff.get(t.staff_id) ?? { name, xeroId, hours: 0 }
    existing.hours += Number(t.hours_worked) || 0
    byStaff.set(t.staff_id, existing)
  }

  // 3. TODO: POST aggregated timesheets to the Xero Payroll AU API and trigger
  //    the pay run, then mark the rows xero_synced = true.
  //    Reference: https://developer.xero.com/documentation/api/payrollau/integration-guide

  return NextResponse.json({
    success: true,
    week_starting: weekStart.toISOString().slice(0, 10),
    timesheet_count: timesheets?.length ?? 0,
    staff: Array.from(byStaff.values()),
  })
}

export const GET = handle
export const POST = handle
