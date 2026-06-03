import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Public: a customer pays for a booking that has been quoted. The amount is
// derived from the booking server-side — never from the request body — so it
// can't be tampered with. Returns the PaymentIntent client secret for Stripe.js.
export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, price_cents, status, customers(email)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (!booking.price_cents || booking.price_cents <= 0) {
      return NextResponse.json({ error: 'Booking has not been quoted yet' }, { status: 409 })
    }
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return NextResponse.json({ error: `Booking is ${booking.status}` }, { status: 409 })
    }

    const intent = await getStripe().paymentIntents.create({
      amount: booking.price_cents,
      currency: 'aud',
      automatic_payment_methods: { enabled: true },
      metadata: { booking_id: booking.id },
    })

    return NextResponse.json({ clientSecret: intent.client_secret, amount: booking.price_cents })
  } catch (err) {
    console.error('create-intent error:', err)
    return NextResponse.json({ error: 'Could not create payment' }, { status: 500 })
  }
}
