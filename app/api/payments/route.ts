import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

// Admin-only: payments with booking + customer context, plus revenue totals.
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('payments')
    .select('id, amount_cents, status, captured_at, created_at, stripe_payment_intent_id, bookings(service_type, scheduled_date, customers(name, email))')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const succeeded = (data || []).filter(p => p.status === 'succeeded')
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const totals = {
    grossCents: succeeded.reduce((s, p) => s + (p.amount_cents || 0), 0),
    monthCents: succeeded.filter(p => new Date(p.captured_at || p.created_at) >= monthStart).reduce((s, p) => s + (p.amount_cents || 0), 0),
    count: succeeded.length,
  }

  return NextResponse.json({ payments: data || [], totals })
}
