import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

// Admin-only: change a staff member's role or status.
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

  const updates: Record<string, string> = {}
  if (body.role !== undefined) {
    if (body.role !== 'admin' && body.role !== 'cleaner') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    updates.role = body.role
  }
  if (body.status !== undefined) {
    if (body.status !== 'active' && body.status !== 'inactive') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    updates.status = body.status
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  // Don't let an admin lock themselves out (demote/deactivate their own account).
  if (id === auth.staff.id && (updates.role === 'cleaner' || updates.status === 'inactive')) {
    return NextResponse.json({ error: 'You cannot demote or deactivate your own account' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('staff').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
