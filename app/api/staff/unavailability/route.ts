import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth'
import { reassignVisitsForUnavailability } from '@/lib/coverage'

export const runtime = 'nodejs'

// A staff member (or admin) flags unavailability for a date. The coverage engine
// immediately reassigns that day's visits to each plan's backup cleaner.
export async function POST(request: Request) {
  const auth = await requireStaff()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { staffId, date, reason } = await request.json()
  // Admins can flag anyone; cleaners can only flag themselves.
  const targetStaffId = auth.staff.role === 'admin' && staffId ? staffId : auth.staff.id

  if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 })

  const supabase = createAdminClient()
  await supabase.from('staff_unavailability').insert({ staff_id: targetStaffId, date, reason: reason || null })

  const result = await reassignVisitsForUnavailability(targetStaffId, date)

  return NextResponse.json({ ok: true, ...result })
}
