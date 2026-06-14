import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type ConversationRow = {
  id: string
  subject: string | null
  customer_id: string | null
  booking_id: string | null
  last_message_at: string | null
  created_at: string
}

type MessageRow = {
  id: string
  conversation_id: string
  sender_type: string
  body: string
  read_by_admin_at: string | null
  created_at: string
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()

  const [
    bookingsResult,
    staffResult,
    applicationsResult,
    notificationsResult,
    invoicesResult,
    paymentsResult,
    conversationsResult,
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, customers(id, name, email, phone, created_at, marketing_opt_in), staff:staff_id(id, name, email, phone, suburb, role, status), original_staff:original_staff_id(id, name, email, phone, suburb), job_completions(start_time, end_time, submitted_at, before_photos, after_photos, notes)')
      .order('created_at', { ascending: false })
      .limit(150),
    supabase
      .from('staff')
      .select('id, name, email, phone, role, status, suburb, created_at')
      .order('name', { ascending: true }),
    supabase
      .from('job_applications')
      .select('id, name, email, phone, suburbs, status, created_at, right_to_work, has_police_check, has_wwcc')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('notifications')
      .select('id, type, title, message, booking_id, customer_email, read, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('invoices')
      .select('id, customer_id, amount_cents, description, status, hosted_invoice_url, created_at, customers(name, email)')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('payments')
      .select('id, booking_id, amount_cents, status, captured_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('conversations')
      .select('id, subject, customer_id, booking_id, last_message_at, created_at')
      .order('last_message_at', { ascending: false })
      .limit(100),
  ])

  const firstError = [
    bookingsResult.error,
    staffResult.error,
    applicationsResult.error,
    notificationsResult.error,
    invoicesResult.error,
    paymentsResult.error,
    conversationsResult.error,
  ].find(Boolean)

  if (firstError) return NextResponse.json({ error: firstError.message }, { status: 500 })

  const conversations = (conversationsResult.data || []) as ConversationRow[]
  const conversationIds = conversations.map((conversation) => conversation.id)
  let messages: MessageRow[] = []

  if (conversationIds.length > 0) {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_type, body, read_by_admin_at, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    messages = (data || []) as MessageRow[]
  }

  const messagesByConversation = new Map<string, MessageRow[]>()
  for (const message of messages) {
    const bucket = messagesByConversation.get(message.conversation_id) || []
    bucket.push(message)
    messagesByConversation.set(message.conversation_id, bucket)
  }

  const conversationsWithMessages = conversations.map((conversation) => {
    const thread = messagesByConversation.get(conversation.id) || []
    return {
      ...conversation,
      messages: thread,
      unread_admin_count: thread.filter((message) => message.sender_type === 'customer' && !message.read_by_admin_at).length,
      last_message: thread[thread.length - 1] || null,
    }
  })

  const openInvoices = (invoicesResult.data || []).filter((invoice) => invoice.status === 'open')
  const capturedPayments = (paymentsResult.data || []).filter((payment) => ['captured', 'succeeded'].includes(payment.status))

  return NextResponse.json({
    bookings: bookingsResult.data || [],
    staff: staffResult.data || [],
    applications: applicationsResult.data || [],
    notifications: notificationsResult.data || [],
    invoices: invoicesResult.data || [],
    payments: paymentsResult.data || [],
    conversations: conversationsWithMessages,
    metrics: {
      unreadNotifications: (notificationsResult.data || []).filter((notification) => !notification.read).length,
      unreadMessages: conversationsWithMessages.reduce((sum, conversation) => sum + conversation.unread_admin_count, 0),
      openInvoiceCents: openInvoices.reduce((sum, invoice) => sum + (invoice.amount_cents || 0), 0),
      capturedPaymentCents: capturedPayments.reduce((sum, payment) => sum + (payment.amount_cents || 0), 0),
    },
  })
}
