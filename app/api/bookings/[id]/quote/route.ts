import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Admin sends a quote for a booking
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { price, note } = await request.json()

    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Valid price required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Update booking with quoted price
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        price_cents: Math.round(price * 100),
        status: 'confirmed',
        notes: note ? `[QUOTE NOTE] ${note}` : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`*, customers(name, email, phone)`)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify customer
    await supabase.from('notifications').insert([{
      type: 'quote_sent',
      title: 'Your Quote is Ready',
      message: `Your ${booking.service_type} has been quoted at $${price}. Log in to accept or ask a question.`,
      booking_id: id,
      customer_email: booking.customers?.email,
      read: false,
    }])

    return NextResponse.json({ success: true, booking, price_quoted: price })
  } catch (err) {
    console.error('Quote API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
