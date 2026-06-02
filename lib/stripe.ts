import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

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
