import { NextResponse } from 'next/server'
import { requireCustomer } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const SERVICE_LABELS: Record<string, string> = {
  oven_fridge: 'Oven or fridge reset',
  recurring_plan: 'Recurring cleaning plan',
  office_airbnb: 'Office or Airbnb support',
  reschedule: 'Booking change',
  priority: 'Priority service request',
  custom: 'Service request',
}

export async function POST(request: Request) {
  const auth = await requireCustomer()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const requestType = clean(body.requestType) || 'custom'
  const message = clean(body.message)
  const bookingId = clean(body.bookingId) || null
  const label = SERVICE_LABELS[requestType] || SERVICE_LABELS.custom

  if (!message) return NextResponse.json({ error: 'Please add a short note.' }, { status: 400 })
  if (message.length > 1600) return NextResponse.json({ error: 'Please keep the note under 1600 characters.' }, { status: 400 })

  const supabase = createAdminClient()

  if (bookingId) {
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, customer_id')
      .eq('id', bookingId)
      .eq('customer_id', auth.customer.id)
      .maybeSingle()

    if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 500 })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const now = new Date().toISOString()
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({
      customer_id: auth.customer.id,
      booking_id: bookingId,
      subject: bookingId ? `${label} for booking` : label,
      last_message_at: now,
    })
    .select('id')
    .single()

  if (conversationError || !conversation) {
    return NextResponse.json({ error: conversationError?.message || 'Could not create request' }, { status: 500 })
  }

  const { error: messageError } = await supabase.from('messages').insert({
    conversation_id: conversation.id,
    sender_type: 'customer',
    sender_user_id: auth.userId,
    body: message,
    read_by_customer_at: now,
  })

  if (messageError) return NextResponse.json({ error: messageError.message }, { status: 500 })

  await supabase.from('notifications').insert({
    type: 'customer_service_request',
    title: label,
    message: `${auth.customer.name} requested: ${message.slice(0, 220)}`,
    booking_id: bookingId,
    customer_email: auth.customer.email,
    read: false,
  })

  return NextResponse.json({ ok: true, conversationId: conversation.id })
}
