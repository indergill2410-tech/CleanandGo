import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const status = typeof body.status === 'string' ? body.status : ''
  if (!['incomplete', 'submitted', 'approved', 'blocked'].includes(status)) {
    return NextResponse.json({ error: 'Invalid onboarding status' }, { status: 400 })
  }

  const stamp = new Date().toISOString()
  const updates: Record<string, string | null> = {
    onboarding_status: status,
    admin_notes: typeof body.adminNotes === 'string' ? body.adminNotes.trim() || null : null,
    updated_at: stamp,
  }
  if (status === 'approved') {
    updates.approved_at = stamp
    updates.approved_by = auth.staff.id
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('contractor_profiles')
    .update(updates)
    .eq('staff_id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
