import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

// Admin-only: bill a customer any amount. Creates a Stripe invoice, finalizes
// it, and emails the hosted payment link. The customer can also pay it from
// their account. The invoice.paid webhook marks it paid.
export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { customerEmail, customerName, amount, description, daysUntilDue } = await request.json()

    if (!customerEmail || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Customer email and a positive amount are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find or create the customer record.
    const { data: customer } = await supabase
      .from('customers')
      .upsert({ name: customerName || customerEmail, email: customerEmail }, { onConflict: 'email' })
      .select('id, name, email, stripe_customer_id')
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Could not resolve customer' }, { status: 500 })
    }

    const stripe = getStripe()

    // Reuse or create the Stripe customer.
    let stripeCustomerId = customer.stripe_customer_id
    if (!stripeCustomerId) {
      const sc = await stripe.customers.create({ email: customer.email, name: customer.name })
      stripeCustomerId = sc.id
      await supabase.from('customers').update({ stripe_customer_id: stripeCustomerId }).eq('id', customer.id)
    }

    const amountCents = Math.round(amount * 100)

    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      amount: amountCents,
      currency: 'aud',
      description: description || 'cleanngo cleaning service',
    })

    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: daysUntilDue ?? 7,
      description: description || undefined,
      metadata: { customer_id: customer.id },
    })

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
    await stripe.invoices.sendInvoice(invoice.id) // emails the hosted payment link

    await supabase.from('invoices').insert({
      customer_id: customer.id,
      amount_cents: amountCents,
      description: description || null,
      status: 'open',
      stripe_invoice_id: finalized.id,
      hosted_invoice_url: finalized.hosted_invoice_url,
    })

    await supabase.from('notifications').insert([{
      type: 'invoice_sent',
      title: 'Invoice Sent',
      message: `Invoiced ${customer.name} $${amount.toFixed(2)}.`,
      customer_email: customer.email,
      read: false,
    }])

    return NextResponse.json({
      success: true,
      hostedInvoiceUrl: finalized.hosted_invoice_url,
      amountCents,
    })
  } catch (err) {
    console.error('Invoice error:', err)
    return NextResponse.json({ error: 'Could not create invoice' }, { status: 500 })
  }
}

// Admin-only: list recent invoices.
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, customers(name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invoices: data })
}
