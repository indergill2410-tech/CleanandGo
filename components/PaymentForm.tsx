'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

function CheckoutForm({ amountCents, returnPath, ctaLabel }: { amountCents: number; returnPath: string; ctaLabel?: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${returnPath}`,
      },
    })

    // If we get here there was an immediate error; otherwise the customer is
    // redirected to return_url and the webhook records the payment.
    if (error) {
      setError(error.message || 'Payment failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full py-3.5 rounded-xl bg-white text-[#0B3558] font-bold hover:bg-white/90 transition disabled:opacity-50"
      >
        {submitting ? 'Processing…' : ctaLabel || `Pay $${(amountCents / 100).toFixed(2)}`}
      </button>
    </form>
  )
}

/**
 * Mounts Stripe Elements for a client secret. `returnPath` is where Stripe
 * redirects after confirmation (e.g. /track?id=… or /account).
 */
export default function PaymentForm({
  clientSecret,
  amountCents,
  returnPath,
  ctaLabel,
}: {
  clientSecret: string
  amountCents: number
  returnPath: string
  ctaLabel?: string
}) {
  if (!stripePromise) {
    return (
      <div className="text-white/60 text-sm text-center">
        Payments are not configured. Please contact us to pay.
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: 'night', labels: 'floating' } }}
    >
      <CheckoutForm amountCents={amountCents} returnPath={returnPath} ctaLabel={ctaLabel} />
    </Elements>
  )
}
