import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { sendQuoteReadyEmail } from '@/lib/email'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { id } = await params
    const { price, note } = await request.json()

    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Valid price required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Update booking with quoted price
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        price_cents: Math.round(price * 100),
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, customers(name, email, phone)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Save customer notification
    await supabase.from('notifications').insert([{
      type: 'quote_sent',
      title: 'Quote Ready',
      message: `Your ${booking.service_type} has been quoted at $${price}.`,
      booking_id: id,
      customer_email: booking.customers?.email,
      read: false,
    }])

    // Send quote email to customer
    if (booking.customers?.email) {
      await sendQuoteReadyEmail({
        customerName: booking.customers.name,
        customerEmail: booking.customers.email,
        service: booking.service_type,
        date: booking.scheduled_date,
        address: booking.address,
        suburb: booking.suburb,
        price,
        note: note || '',
        bookingId: id,
      })
    }

    return NextResponse.json({ success: true, booking, price_quoted: price })
  } catch (err) {
    console.error('Quote API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
