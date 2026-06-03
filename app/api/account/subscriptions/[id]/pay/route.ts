import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCustomer } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

// Returns the client secret to complete the first (or an outstanding) payment
// on the customer's own subscription.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCustomer()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = createAdminClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, customer_id, stripe_subscription_id, price_cents')
    .eq('id', id)
    .single()

  if (!sub || sub.customer_id !== auth.customer.id) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }
  if (!sub.stripe_subscription_id) {
    return NextResponse.json({ error: 'Plan not yet priced' }, { status: 409 })
  }

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id, {
    expand: ['latest_invoice.payment_intent'],
  })

  const invoice = subscription.latest_invoice as Stripe.Invoice | null
  const pi = (invoice as unknown as { payment_intent?: Stripe.PaymentIntent } | null)?.payment_intent

  if (!pi || pi.status === 'succeeded') {
    return NextResponse.json({ paid: true })
  }

  return NextResponse.json({
    paid: false,
    clientSecret: pi.client_secret,
    amountCents: sub.price_cents ?? pi.amount,
  })
}
