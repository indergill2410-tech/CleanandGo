import { NextRequest, NextResponse } from 'next/server'

// Stripe webhook handler
// Processes: payment_intent.succeeded, payment_intent.payment_failed
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  // TODO: Verify webhook signature using STRIPE_WEBHOOK_SECRET
  // TODO: Handle payment_intent.succeeded → mark booking as paid in Supabase
  // TODO: Handle payment_intent.payment_failed → notify customer

  console.log('Stripe webhook received', { sig: sig?.slice(0, 20) })
  return NextResponse.json({ received: true })
}
