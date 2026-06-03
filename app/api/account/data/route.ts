import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCustomer } from '@/lib/auth'

// The signed-in customer's plans + available credits.
export async function GET() {
  const auth = await requireCustomer()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()

  const [{ data: subscriptions }, { data: credits }, { data: invoices }, { data: bookings }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, property_type, frequency, address, suburb, status, price_cents, preferred_day, stripe_subscription_id')
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
      .select('id, service_type, status, scheduled_date, scheduled_time, suburb, price_cents')
      .eq('customer_id', auth.customer.id)
      .is('subscription_id', null)
      .order('scheduled_date', { ascending: false })
      .limit(50),
  ])

  return NextResponse.json({
    customer: { name: auth.customer.name, email: auth.customer.email },
    subscriptions: subscriptions || [],
    credits: credits || [],
    invoices: invoices || [],
    bookings: bookings || [],
  })
}
