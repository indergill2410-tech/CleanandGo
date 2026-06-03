import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCustomer } from '@/lib/auth'
import { pauseSubscription, resumeSubscription, cancelSubscription } from '@/lib/subscriptions'

export const runtime = 'nodejs'

// Customer self-service: pause, resume, or cancel their own plan.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCustomer()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const { action } = await request.json()
  if (!['pause', 'resume', 'cancel'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, customer_id, stripe_subscription_id, status')
    .eq('id', id)
    .single()

  if (!sub || sub.customer_id !== auth.customer.id) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  try {
    if (sub.stripe_subscription_id) {
      if (action === 'pause') await pauseSubscription(sub.stripe_subscription_id)
      else if (action === 'resume') await resumeSubscription(sub.stripe_subscription_id)
      else await cancelSubscription(sub.stripe_subscription_id)
    }
  } catch (err) {
    console.error('Stripe action error:', err)
    return NextResponse.json({ error: 'Could not update subscription with payment provider' }, { status: 502 })
  }

  const nextStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'cancelled'
  await supabase
    .from('subscriptions')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ ok: true, status: nextStatus })
}
