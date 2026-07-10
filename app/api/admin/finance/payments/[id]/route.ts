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

  const action = typeof body.action === 'string' ? body.action : ''
  const stamp = new Date().toISOString()
  const updates: Record<string, string | null> = {}

  if (action === 'approve') {
    updates.status = 'approved'
    updates.approved_by = auth.staff.id
    updates.approved_at = stamp
  } else if (action === 'mark_paid') {
    updates.status = 'paid'
    updates.approved_by = auth.staff.id
    updates.approved_at = stamp
    updates.paid_by = auth.staff.id
    updates.paid_at = stamp
    if (typeof body.paymentReference === 'string') updates.payment_reference = body.paymentReference.trim() || null
  } else if (action === 'cancel') {
    updates.status = 'cancelled'
    updates.cancelled_at = stamp
  } else {
    return NextResponse.json({ error: 'Invalid payment action' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('staff_payments')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payment: data })
}
