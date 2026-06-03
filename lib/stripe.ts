import Stripe from 'stripe'

// Lazily instantiate so importing this module (e.g. during `next build`)
// doesn't throw when STRIPE_SECRET_KEY isn't present.
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return _stripe
}

export function calculatePrice({
  serviceType,
  bedrooms,
  bathrooms,
}: {
  serviceType: 'recurring' | 'oneoff' | 'endoflease'
  bedrooms: number
  bathrooms: number
}): number {
  const basePrices = { recurring: 120, oneoff: 180, endoflease: 400 }
  const base = basePrices[serviceType]
  return base + (bedrooms - 1) * 30 + (bathrooms - 1) * 20
}
