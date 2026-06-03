import type Stripe from 'stripe'
import { getStripe } from './stripe'

export type Frequency = 'weekly' | 'fortnightly' | 'monthly'

// Map our plan frequency onto a Stripe recurring interval.
export function intervalFor(frequency: Frequency): { interval: 'week' | 'month'; interval_count: number } {
  switch (frequency) {
    case 'weekly':
      return { interval: 'week', interval_count: 1 }
    case 'fortnightly':
      return { interval: 'week', interval_count: 2 }
    case 'monthly':
      return { interval: 'month', interval_count: 1 }
  }
}

/**
 * Create a Stripe subscription billed at the ADMIN-SET per-visit price.
 *
 * Uses an inline `price_data` so each customer's price is bespoke (every job is
 * different) — no fixed catalog price. Returns the first invoice's client
 * secret so the customer can confirm their card with Stripe.js; subsequent
 * cycles are charged automatically.
 */
export async function createRecurringSubscription(opts: {
  customerEmail: string
  customerName: string
  priceCents: number
  frequency: Frequency
  propertyType: 'home' | 'office'
  existingStripeCustomerId?: string | null
  metadata?: Record<string, string>
}): Promise<{ stripeCustomerId: string; stripeSubscriptionId: string; clientSecret: string | null }> {
  const stripe = getStripe()

  // Reuse an existing Stripe customer where possible (by id, then by email)
  // to avoid creating duplicates each time a customer starts a new plan.
  let customerId = opts.existingStripeCustomerId || null
  if (!customerId) {
    const found = await stripe.customers.list({ email: opts.customerEmail, limit: 1 })
    customerId =
      found.data[0]?.id ||
      (await stripe.customers.create({ email: opts.customerEmail, name: opts.customerName })).id
  }

  const { interval, interval_count } = intervalFor(opts.frequency)
  const productId =
    opts.propertyType === 'office'
      ? process.env.STRIPE_PRODUCT_OFFICE
      : process.env.STRIPE_PRODUCT_HOME

  if (!productId) {
    throw new Error('Missing Stripe product id (set STRIPE_PRODUCT_HOME and STRIPE_PRODUCT_OFFICE)')
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price_data: {
          currency: 'aud',
          product: productId,
          unit_amount: opts.priceCents,
          recurring: { interval, interval_count },
        },
      },
    ],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: opts.metadata,
  })

  const invoice = subscription.latest_invoice as Stripe.Invoice | null
  // payment_intent is expanded above.
  const paymentIntent = (invoice as unknown as { payment_intent?: Stripe.PaymentIntent } | null)?.payment_intent

  return {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    clientSecret: paymentIntent?.client_secret ?? null,
  }
}

export async function pauseSubscription(stripeSubscriptionId: string) {
  return getStripe().subscriptions.update(stripeSubscriptionId, {
    pause_collection: { behavior: 'void' },
  })
}

export async function resumeSubscription(stripeSubscriptionId: string) {
  return getStripe().subscriptions.update(stripeSubscriptionId, {
    pause_collection: '',
  })
}

export async function cancelSubscription(stripeSubscriptionId: string) {
  return getStripe().subscriptions.cancel(stripeSubscriptionId)
}
