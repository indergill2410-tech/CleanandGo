import { NextResponse } from 'next/server'
import { requireCustomer, requireStaff } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCustomerMessageNotificationEmail } from '@/lib/message-email'

export const runtime = 'nodejs'

type Conversation = {
  id: string
  subject: string | null
  customer_id: string | null
  booking_id: string | null
  last_message_at: string | null
  created_at: string
}

type Message = {
  id: string
  conversation_id: string
  sender_type: string
  body: string
  created_at: string
}

const cleanBody = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

async function conversationsWithMessages(customerId?: string, bookingId?: string) {
  const supabase = createAdminClient()
  let query = supabase
    .from('conversations')
    .select('id, subject, customer_id, booking_id, last_message_at, created_at')
    .order('last_message_at', { ascending: false })

  if (customerId) query = query.eq('customer_id', customerId)
  if (bookingId) query = query.eq('booking_id', bookingId)

  const { data: conversations, error } = await query
  if (error) return { error }

  const ids = (conversations || []).map((c) => c.id)
  if (ids.length === 0) return { conversations: [] }

  const { data: messages, error: messageError } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_type, body, created_at')
    .in('conversation_id', ids)
    .order('created_at', { ascending: true })

  if (messageError) return { error: messageError }

  const byConversation = new Map<string, Message[]>()
  for (const message of (messages || []) as Message[]) {
    const bucket = byConversation.get(message.conversation_id) || []
    bucket.push(message)
    byConversation.set(message.conversation_id, bucket)
  }

  return {
    conversations: ((conversations || []) as Conversation[]).map((conversation) => ({
      ...conversation,
      messages: byConversation.get(conversation.id) || [],
    })),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('bookingId') || undefined
  const supabase = createAdminClient()

  const staffAuth = await requireStaff()
  if (staffAuth.ok && staffAuth.staff.role === 'admin') {
    const result = await conversationsWithMessages(undefined, bookingId)
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
    const ids = (result.conversations || []).map((conversation) => conversation.id)
    if (ids.length > 0) {
      await supabase
        .from('messages')
        .update({ read_by_admin_at: new Date().toISOString() })
        .in('conversation_id', ids)
        .eq('sender_type', 'customer')
        .is('read_by_admin_at', null)
    }
    return NextResponse.json({ conversations: result.conversations })
  }

  const customerAuth = await requireCustomer()
  if (!customerAuth.ok) return NextResponse.json({ error: customerAuth.error }, { status: customerAuth.status })

  const result = await conversationsWithMessages(customerAuth.customer.id)
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  const ids = (result.conversations || []).map((conversation) => conversation.id)
  if (ids.length > 0) {
    await supabase
      .from('messages')
      .update({ read_by_customer_at: new Date().toISOString() })
      .in('conversation_id', ids)
      .eq('sender_type', 'admin')
      .is('read_by_customer_at', null)
  }
  return NextResponse.json({ conversations: result.conversations })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const messageBody = cleanBody(body.body)
  if (!messageBody) return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  if (messageBody.length > 2000) return NextResponse.json({ error: 'Message is too long' }, { status: 400 })

  const supabase = createAdminClient()
  const staffAuth = await requireStaff()

  if (staffAuth.ok && staffAuth.staff.role === 'admin') {
    const bookingId = cleanBody(body.bookingId)
    if (!bookingId) return NextResponse.json({ error: 'Booking is required' }, { status: 400 })

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, customer_id, service_type, customers(name, email)')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking?.customer_id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const customer = booking.customers as unknown as { name: string; email: string } | null
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('customer_id', booking.customer_id)
      .maybeSingle()

    let conversationId = existing?.id as string | undefined
    if (!conversationId) {
      const { data: created, error: createError } = await supabase
        .from('conversations')
        .insert({
          booking_id: bookingId,
          customer_id: booking.customer_id,
          subject: `Booking message: ${booking.service_type}`,
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      if (createError || !created) return NextResponse.json({ error: createError?.message || 'Could not create conversation' }, { status: 500 })
      conversationId = created.id
    }
    if (!conversationId) return NextResponse.json({ error: 'Could not resolve conversation' }, { status: 500 })
    const confirmedConversationId = conversationId

    const now = new Date().toISOString()
    const { error: messageError } = await supabase.from('messages').insert({
      conversation_id: confirmedConversationId,
      sender_type: 'admin',
      sender_user_id: staffAuth.userId,
      sender_staff_id: staffAuth.staff.id,
      body: messageBody,
      read_by_admin_at: now,
    })
    if (messageError) return NextResponse.json({ error: messageError.message }, { status: 500 })

    await supabase.from('conversations').update({ last_message_at: now, updated_at: now }).eq('id', confirmedConversationId)

    if (customer?.email) {
      await sendCustomerMessageNotificationEmail({
        customerName: customer.name || 'there',
        customerEmail: customer.email,
        conversationId: confirmedConversationId,
      }).catch((error) => console.error('Customer message email failed:', error))
    }

    return NextResponse.json({ ok: true, conversationId: confirmedConversationId })
  }

  const customerAuth = await requireCustomer()
  if (!customerAuth.ok) return NextResponse.json({ error: customerAuth.error }, { status: customerAuth.status })

  const conversationId = cleanBody(body.conversationId)
  if (!conversationId) return NextResponse.json({ error: 'Conversation is required' }, { status: 400 })

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('customer_id', customerAuth.customer.id)
    .maybeSingle()
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  const now = new Date().toISOString()
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_type: 'customer',
    sender_user_id: customerAuth.userId,
    body: messageBody,
    read_by_customer_at: now,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('conversations').update({ last_message_at: now, updated_at: now }).eq('id', conversationId)
  await supabase.from('notifications').insert({
    type: 'customer_message',
    title: 'Customer replied',
    message: `${customerAuth.customer.name} replied to a message.`,
    read: false,
  })

  return NextResponse.json({ ok: true, conversationId })
}
