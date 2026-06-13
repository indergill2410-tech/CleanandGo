import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const auth = await requireStaff()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const [{ data: jobs, error: jobsError }, { data: timesheets, error: timesheetError }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, service_type, status, scheduled_date, scheduled_time, address, suburb, bedrooms, bathrooms, covered_by_backup, price_cents, job_completions(start_time, end_time, submitted_at, before_photos, after_photos)')
      .eq('staff_id', auth.staff.id)
      .order('scheduled_date', { ascending: false })
      .limit(80),
    supabase
      .from('timesheets')
      .select('id, date, hours_worked, hourly_rate, xero_synced')
      .eq('staff_id', auth.staff.id)
      .order('date', { ascending: false })
      .limit(20),
  ])

  if (jobsError) return NextResponse.json({ error: jobsError.message }, { status: 500 })
  if (timesheetError) return NextResponse.json({ error: timesheetError.message }, { status: 500 })

  return NextResponse.json({
    staff: {
      id: auth.staff.id,
      name: auth.staff.name,
      email: auth.staff.email,
      phone: auth.staff.phone,
      suburb: auth.staff.suburb,
      role: auth.staff.role,
      status: auth.staff.status,
    },
    jobs: jobs || [],
    timesheets: timesheets || [],
  })
}
