import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth'

export const runtime = 'nodejs'

// Cleaner completes the job: saves before/after photos + notes, marks it
// completed, and logs a timesheet entry.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireStaff()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  let body: { beforePhotos?: string[]; afterPhotos?: string[]; notes?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, staff_id, scheduled_date')
    .eq('id', id)
    .single()
  if (!booking || booking.staff_id !== auth.staff.id) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const now = new Date().toISOString()
  const before = Array.isArray(body.beforePhotos) ? body.beforePhotos.slice(0, 6) : []
  const after = Array.isArray(body.afterPhotos) ? body.afterPhotos.slice(0, 6) : []
  const notes = typeof body.notes === 'string' ? body.notes.trim() : ''

  // Upsert the completion record (created at clock-on, or new here).
  const { data: existing } = await supabase.from('job_completions').select('id, start_time').eq('booking_id', id).maybeSingle()
  let startTime = existing?.start_time as string | null
  if (existing) {
    await supabase.from('job_completions').update({
      end_time: now, before_photos: before, after_photos: after, notes, submitted_at: now,
    }).eq('id', existing.id)
  } else {
    startTime = now
    await supabase.from('job_completions').insert({
      booking_id: id, staff_id: auth.staff.id, start_time: now, end_time: now,
      before_photos: before, after_photos: after, notes, submitted_at: now,
    })
  }

  await supabase.from('bookings').update({ status: 'completed', updated_at: now }).eq('id', id)

  // Log a timesheet entry (hours derived from start→now).
  const hours = startTime ? Math.max(0, (Date.parse(now) - Date.parse(startTime)) / 3_600_000) : 0
  await supabase.from('timesheets').insert({
    staff_id: auth.staff.id,
    booking_id: id,
    date: booking.scheduled_date,
    hours_worked: Math.round(hours * 100) / 100,
    xero_synced: false,
  })

  return NextResponse.json({ ok: true, status: 'completed' })
}
