import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { sendBookingConfirmationEmail, sendAdminNewBookingEmail } from '@/lib/email'

// Public endpoint: anyone can submit a quote request.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { service, beds, baths, extras, date, time, name, email, phone, address, suburb, notes } = body

    if (!service || !date || !time || !name || !email || !phone || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Upsert customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({ name, email, phone }, { onConflict: 'email' })
      .select()
      .single()

    if (customerError || !customer) {
      console.error('Customer upsert error:', customerError)
      return NextResponse.json({ error: 'Could not save customer' }, { status: 500 })
    }

    // 2. Create booking — no price, admin will quote
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        customer_id: customer.id,
        service_type: service,
        bedrooms: beds,
        bathrooms: baths,
        extras: extras || [],
        address: `${address}${suburb ? ', ' + suburb : ''}`,
        suburb: suburb || '',
        scheduled_date: date,
        scheduled_time: time,
        notes: notes || '',
        status: 'pending',
        price_cents: 0,
      }])
      .select()
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    // 3. Save admin notification
    await supabase.from('notifications').insert([{
      type: 'new_booking',
      title: 'New Quote Request',
      message: `${name} requested a ${service} clean at ${address}, ${suburb}.`,
      booking_id: booking.id,
      read: false,
    }])

    // 4. Send emails (non-blocking — don't fail booking if email fails)
    await Promise.allSettled([
      sendBookingConfirmationEmail({
        customerName: name, customerEmail: email, service,
        date, time, address, suburb, beds, baths, extras: extras || [], bookingId: booking.id,
      }),
      sendAdminNewBookingEmail({
        customerName: name, customerEmail: email, customerPhone: phone, service,
        date, time, address, suburb, beds, baths, extras: extras || [], notes: notes || '', bookingId: booking.id,
      }),
    ])

    return NextResponse.json({ success: true, booking }, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin-only: list all bookings.
export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('bookings')
      .select('*, customers(name, email, phone)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bookings: data })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
