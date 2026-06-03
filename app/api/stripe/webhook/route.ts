import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

// Stripe needs the raw request body to verify the signature.
export const runtime = 'nodejs'

// Records the payment against its booking. The booking id is carried on the
// PaymentIntent metadata (set when the intent is created).
async function recordPayment(intent: Stripe.PaymentIntent, status: 'captured' | 'failed') {
  const supabase = createAdminClient()
  const bookingId = intent.metadata?.booking_id || null

  await supabase
    .from('payments')
    .upsert(
      {
        booking_id: bookingId,
        stripe_payment_intent_id: intent.id,
        stripe_customer_id: typeof intent.customer === 'string' ? intent.customer : null,
        amount_cents: intent.amount,
        status,
        captured_at: status === 'captured' ? new Date().toISOString() : null,
      },
      { onConflict: 'stripe_payment_intent_id' }
    )

  // On success, confirm the booking if it is still pending.
  if (status === 'captured' && bookingId) {
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('status', 'pending')
  }
}

// Recurring plans: flip the subscription to active once its first invoice is
// paid, and back to a flagged state if a renewal payment fails.
async function syncSubscriptionStatus(stripeSubscriptionId: string, status: 'active' | 'paused') {
  if (!stripeSubscriptionId) return
  const supabase = createAdminClient()
  await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', stripeSubscriptionId)
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await recordPayment(event.data.object as Stripe.PaymentIntent, 'captured')
        break
      case 'payment_intent.payment_failed':
        await recordPayment(event.data.object as Stripe.PaymentIntent, 'failed')
        break
      case 'invoice.paid': {
        const inv = event.data.object as unknown as { id: string; subscription?: string }
        if (inv.subscription) await syncSubscriptionStatus(inv.subscription, 'active')
        // Mark any matching ad-hoc invoice paid.
        await createAdminClient()
          .from('invoices')
          .update({ status: 'paid' })
          .eq('stripe_invoice_id', inv.id)
        break
      }
      case 'invoice.payment_failed': {
        const sub = (event.data.object as unknown as { subscription?: string }).subscription
        if (sub) await syncSubscriptionStatus(sub, 'paused')
        break
      }
      case 'customer.subscription.deleted': {
        const subId = (event.data.object as Stripe.Subscription).id
        const supabase = createAdminClient()
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subId)
        break
      }
      default:
        // Unhandled event types are acknowledged but ignored.
        break
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
