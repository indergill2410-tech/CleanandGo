import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCustomer } from '@/lib/auth'

// The signed-in customer's plans + available credits.
export async function GET() {
  const auth = await requireCustomer()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()

  const [{ data: subscriptions }, { data: credits }, { data: invoices }, { data: bookings }, { data: conversations }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, property_type, frequency, address, suburb, state, postcode, status, price_cents, preferred_day, preferred_time, stripe_subscription_id, primary_staff:primary_staff_id(name, phone, suburb), backup_staff:backup_staff_id(name, phone, suburb)')
      .eq('customer_id', auth.customer.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('account_credits')
      .select('id, amount_cents, reason, status, created_at')
      .eq('customer_id', auth.customer.id)
      .eq('status', 'available'),
    supabase
      .from('invoices')
      .select('id, amount_cents, description, status, hosted_invoice_url, created_at')
      .eq('customer_id', auth.customer.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('id, service_type, status, scheduled_date, scheduled_time, address, suburb, state, postcode, bedrooms, bathrooms, extras, notes, photos, price_cents, covered_by_backup, staff:staff_id(name, phone, suburb), job_completions(start_time, end_time, submitted_at, before_photos, after_photos, notes)')
      .eq('customer_id', auth.customer.id)
      .is('subscription_id', null)
      .order('scheduled_date', { ascending: false })
      .limit(50),
    supabase
      .from('conversations')
      .select('id, subject, booking_id, last_message_at')
      .eq('customer_id', auth.customer.id)
      .order('last_message_at', { ascending: false }),
  ])

  return NextResponse.json({
    customer: { name: auth.customer.name, email: auth.customer.email, phone: auth.customer.phone },
    subscriptions: subscriptions || [],
    credits: credits || [],
    invoices: invoices || [],
    bookings: bookings || [],
    conversations: conversations || [],
  })
}
