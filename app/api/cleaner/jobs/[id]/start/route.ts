import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth'

export const runtime = 'nodejs'

// Cleaner clocks on to their job: marks it in-progress and records the start time.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireStaff()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = createAdminClient()

  const { data: booking } = await supabase.from('bookings').select('id, staff_id, status').eq('id', id).single()
  if (!booking || booking.staff_id !== auth.staff.id) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  await supabase.from('bookings').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', id)

  // Record the start time once.
  const { data: existing } = await supabase.from('job_completions').select('id, start_time').eq('booking_id', id).maybeSingle()
  if (existing) {
    if (!existing.start_time) {
      await supabase.from('job_completions').update({ start_time: new Date().toISOString() }).eq('id', existing.id)
    }
  } else {
    await supabase.from('job_completions').insert({ booking_id: id, staff_id: auth.staff.id, start_time: new Date().toISOString() })
  }

  return NextResponse.json({ ok: true, status: 'in_progress' })
}
