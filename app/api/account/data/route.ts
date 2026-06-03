import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCustomer } from '@/lib/auth'

// The signed-in customer's plans + available credits.
export async function GET() {
  const auth = await requireCustomer()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()

  const [{ data: subscriptions }, { data: credits }, { data: invoices }] = await Promise.all([
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
  ])

  return NextResponse.json({
    customer: { name: auth.customer.name, email: auth.customer.email },
    subscriptions: subscriptions || [],
    credits: credits || [],
    invoices: invoices || [],
  })
}
