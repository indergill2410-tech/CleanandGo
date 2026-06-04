import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { sendBookingConfirmedEmail, sendCleanerAssignedEmail, sendMissedVisitCreditEmail } from '@/lib/email'

export const runtime = 'nodejs'

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

  // Missed-visit guarantee: a missed visit issues an account credit for its value.
  if (updates.status === 'missed' && data.customer_id && data.price_cents > 0) {
    const { data: existing } = await supabase
      .from('account_credits')
      .select('id')
      .eq('booking_id', id)
      .maybeSingle()
    if (!existing) {
      await supabase.from('account_credits').insert({
        customer_id: data.customer_id,
        subscription_id: data.subscription_id ?? null,
        booking_id: id,
        amount_cents: data.price_cents,
        reason: 'Missed visit — reliability guarantee',
        status: 'available',
      })
    }
  }

  // Notify the people affected by this change (best-effort).
  try {
    const { data: full } = await supabase
      .from('bookings')
      .select('service_type, scheduled_date, scheduled_time, address, suburb, price_cents, customers(name, email), staff:staff_id(name, email)')
      .eq('id', id)
      .single()
    const cust = full?.customers as unknown as { name: string; email: string } | null
    const cleaner = full?.staff as unknown as { name: string; email: string } | null
    const when = { service: full?.service_type ?? '', date: full?.scheduled_date ?? '', time: (full?.scheduled_time ?? '').slice(0, 5), address: full?.address ?? '', suburb: full?.suburb ?? '' }
    const assigned = 'staff_id' in updates && !!updates.staff_id
    const confirmedNow = updates.status === 'confirmed'

    const jobs: Promise<unknown>[] = []
    if ((assigned || confirmedNow) && cust?.email) {
      jobs.push(sendBookingConfirmedEmail({ customerName: cust.name, customerEmail: cust.email, cleanerName: cleaner?.name, ...when }))
    }
    if (assigned && cleaner?.email) {
      jobs.push(sendCleanerAssignedEmail({ cleanerName: cleaner.name, cleanerEmail: cleaner.email, ...when }))
    }
    if (updates.status === 'missed' && cust?.email) {
      jobs.push(sendMissedVisitCreditEmail({ customerName: cust.name, customerEmail: cust.email, date: when.date, creditAmount: (full?.price_cents ?? 0) / 100 }))
    }
    await Promise.allSettled(jobs)
  } catch (e) {
    console.error('Booking notification email failed:', e)
  }

  return NextResponse.json({ booking: data })
}
