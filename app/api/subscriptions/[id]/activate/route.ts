import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { createRecurringSubscription, cancelSubscription, type Frequency } from '@/lib/subscriptions'

export const runtime = 'nodejs'

// Admin-only: set the per-visit price, assign the primary + backup cleaner, and
// create the Stripe subscription. Returns the first-payment client secret so the
// customer can confirm their card; the invoice.paid webhook flips status to active.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { id } = await params
    const { price, primaryStaffId, backupStaffId } = await request.json()

    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Valid price required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*, customers(id, name, email, stripe_customer_id)')
      .eq('id', id)
      .single()

    if (subError || !sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const customer = sub.customers as { id: string; name: string; email: string; stripe_customer_id: string | null } | null
    if (!customer?.email) {
      return NextResponse.json({ error: 'Subscription has no customer email' }, { status: 409 })
    }

    const priceCents = Math.round(price * 100)

    const { stripeCustomerId, stripeSubscriptionId, clientSecret } = await createRecurringSubscription({
      customerEmail: customer.email,
      customerName: customer.name,
      priceCents,
      frequency: sub.frequency as Frequency,
      propertyType: sub.property_type as 'home' | 'office',
      existingStripeCustomerId: sub.stripe_customer_id || customer.stripe_customer_id,
      metadata: { subscription_id: id },
    })

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        price_cents: priceCents,
        primary_staff_id: primaryStaffId || null,
        backup_staff_id: backupStaffId || null,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Subscription update error:', updateError)
      // Don't leave an orphaned Stripe subscription behind.
      try {
        await cancelSubscription(stripeSubscriptionId)
      } catch (cancelErr) {
        console.error('Failed to cancel orphaned Stripe subscription:', cancelErr)
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Cache the Stripe customer id on the customer for reuse (avoids duplicates).
    if (stripeCustomerId && stripeCustomerId !== customer.stripe_customer_id) {
      await supabase.from('customers').update({ stripe_customer_id: stripeCustomerId }).eq('id', customer.id)
    }

    await supabase.from('notifications').insert([{
      type: 'plan_quoted',
      title: 'Plan Priced',
      message: `${customer.name}'s ${sub.frequency} plan was priced at $${price}/visit.`,
      customer_email: customer.email,
      read: false,
    }])

    return NextResponse.json({ success: true, clientSecret, priceCents })
  } catch (err) {
    console.error('Activate subscription error:', err)
    return NextResponse.json({ error: 'Could not activate subscription' }, { status: 500 })
  }
}
