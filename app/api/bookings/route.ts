import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { service, beds, baths, extras, date, time, frequency, name, email, phone, address, suburb, notes } = body

    if (!service || !date || !time || !name || !email || !phone || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Upsert customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({ name, email, phone }, { onConflict: 'email' })
      .select()
      .single()

    if (customerError) console.error('Customer upsert error:', customerError)

    // 2. Create booking — no price, status = pending_quote
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        customer_id: customer?.id,
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
        price_cents: 0, // No price — admin will quote
      }])
      .select()
      .single()

    if (bookingError) {
      console.error('Booking insert error:', bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    // 3. Create admin notification
    const supabaseAdmin = await createClient()
    await supabaseAdmin.from('notifications').insert([{
      type: 'new_booking',
      title: 'New Quote Request',
      message: `${name} requested a ${service === 'endoflease' ? 'End of Lease' : service === 'recurring' ? 'Recurring Clean' : 'One-Off Clean'} at ${address}, ${suburb}. ${beds} bed / ${baths} bath.`,
      booking_id: booking.id,
      read: false,
    }]).select()
    // Don't fail if notifications table doesn't exist yet

    return NextResponse.json({ success: true, booking }, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('bookings')
      .select(`*, customers(name, email, phone)`)
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
