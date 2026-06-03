import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth'

export const runtime = 'nodejs'

// The signed-in cleaner's assigned jobs (upcoming + active).
export async function GET() {
  const auth = await requireStaff()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('id, service_type, status, scheduled_date, scheduled_time, address, suburb, bedrooms, bathrooms, extras, notes, photos, covered_by_backup, customers(name, phone), job_completions(start_time, end_time, submitted_at)')
    .eq('staff_id', auth.staff.id)
    .in('status', ['confirmed', 'in_progress'])
    .order('scheduled_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ jobs: data, staffName: auth.staff.name })
}
