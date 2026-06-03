import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Public: look up a single booking by its (unguessable) UUID for the customer
// tracking page. Returns only the fields needed to show status + pay.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createAdminClient()
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, service_type, scheduled_date, scheduled_time, address, suburb, status, price_cents, customers(name)')
    .eq('id', id)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Has this booking been paid (a captured payment exists)?
  const { data: payment } = await supabase
    .from('payments')
    .select('status')
    .eq('booking_id', id)
    .eq('status', 'captured')
    .maybeSingle()

  // @ts-expect-error - customers is an embedded relation
  const customerName: string | null = booking.customers?.name ?? null

  return NextResponse.json({
    booking: {
      id: booking.id,
      service_type: booking.service_type,
      scheduled_date: booking.scheduled_date,
      scheduled_time: booking.scheduled_time,
      address: booking.address,
      suburb: booking.suburb,
      status: booking.status,
      price_cents: booking.price_cents,
      customer_name: customerName,
    },
    paid: !!payment,
  })
}
