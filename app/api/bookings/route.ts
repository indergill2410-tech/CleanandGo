import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { service, beds, baths, extras, date, time, frequency, name, email, phone, address, suburb, notes, total } = body

    // Validate required fields
    if (!service || !date || !time || !name || !email || !phone || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          service_type: service,
          bedrooms: beds,
          bathrooms: baths,
          extras: extras,
          date,
          time,
          frequency,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          address,
          suburb,
          notes,
          total_price: total,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, booking: data }, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bookings: data })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
