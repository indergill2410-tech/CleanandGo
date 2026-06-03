import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

type Agg = { bookings: number; completed: number; upcoming: number; spentCents: number; lastDate: string | null }

// Admin-only: customers with booking aggregates.
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const [{ data: customers, error: cErr }, { data: bookings, error: bErr }] = await Promise.all([
    supabase.from('customers').select('id, name, email, phone, created_at, stripe_customer_id').order('created_at', { ascending: false }),
    supabase.from('bookings').select('customer_id, status, price_cents, scheduled_date'),
  ])
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })
  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 })

  const agg = new Map<string, Agg>()
  for (const b of bookings || []) {
    if (!b.customer_id) continue
    const a = agg.get(b.customer_id) || { bookings: 0, completed: 0, upcoming: 0, spentCents: 0, lastDate: null }
    a.bookings++
    if (b.status === 'completed') { a.completed++; a.spentCents += b.price_cents || 0 }
    if (['pending', 'confirmed', 'in_progress'].includes(b.status)) a.upcoming++
    if (b.scheduled_date && (!a.lastDate || b.scheduled_date > a.lastDate)) a.lastDate = b.scheduled_date
    agg.set(b.customer_id, a)
  }

  const result = (customers || []).map(c => ({
    ...c,
    ...(agg.get(c.id) || { bookings: 0, completed: 0, upcoming: 0, spentCents: 0, lastDate: null }),
  }))

  return NextResponse.json({ customers: result })
}
