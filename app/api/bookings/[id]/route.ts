import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

// Fields an admin is allowed to update on a booking. Anything else is ignored
// so callers can't overwrite ids, prices, timestamps, etc. via PATCH.
const UPDATABLE_FIELDS = [
  'staff_id',
  'scheduled_date',
  'scheduled_time',
  'status',
  'notes',
  'address',
  'suburb',
] as const

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(name, email, phone)')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ booking: data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const body = await request.json()

  // Whitelist the fields that can be changed.
  const updates: Record<string, unknown> = {}
  for (const key of UPDATABLE_FIELDS) {
    if (key in body) updates[key] = body[key]
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }
  updates.updated_at = new Date().toISOString()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ booking: data })
}
