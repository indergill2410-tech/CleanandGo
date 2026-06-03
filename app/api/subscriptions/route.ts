import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { getOrCreateCustomer } from '@/lib/customers'
import { sendAdminNewPlanEmail } from '@/lib/email'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public: a customer requests a recurring plan (home or office). Quote-based —
// no price yet; an admin reviews and sets the per-visit fee.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      propertyType, frequency, preferredDay, preferredTime,
      name, email, phone, address, suburb, state, postcode,
      bedrooms, bathrooms, officeSqm, notes, photos,
    } = body

    if (!propertyType || !frequency || !name || !email || !phone || !address || !suburb) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (!['home', 'office'].includes(propertyType)) {
      return NextResponse.json({ error: 'Invalid property type' }, { status: 400 })
    }
    if (!['weekly', 'fortnightly', 'monthly'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { customer, error: customerError } = await getOrCreateCustomer(supabase, { name, email, phone })
    if (customerError || !customer) {
      console.error('Customer resolve error:', customerError)
      return NextResponse.json({ error: 'Could not save customer' }, { status: 500 })
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert([{
        customer_id: customer.id,
        property_type: propertyType,
        frequency,
        preferred_day: preferredDay || null,
        preferred_time: preferredTime || null,
        address,
        suburb,
        state: state || null,
        postcode: postcode || null,
        bedrooms: propertyType === 'home' ? bedrooms ?? null : null,
        bathrooms: propertyType === 'home' ? bathrooms ?? null : null,
        office_sqm: propertyType === 'office' ? officeSqm ?? null : null,
        notes: notes || '',
        photos: Array.isArray(photos) ? photos.slice(0, 6) : [],
        status: 'requested',
      }])
      .select()
      .single()

    if (error) {
      console.error('Subscription insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('notifications').insert([{
      type: 'new_plan_request',
      title: 'New Recurring Plan Request',
      message: `${name} requested a ${frequency} ${propertyType} plan at ${address}, ${suburb}.`,
      read: false,
    }])

    // Always email the admin a summary of the new job.
    const size = propertyType === 'office' ? `${officeSqm ?? '?'} m²` : `${bedrooms ?? '?'} bed · ${bathrooms ?? '?'} bath`
    await sendAdminNewPlanEmail({
      name, email, phone, propertyType, frequency, address, suburb, state, postcode,
      preferredDay, preferredTime, size, notes,
      photosCount: Array.isArray(photos) ? photos.length : 0,
    }).catch(e => console.error('Admin plan email failed:', e))

    return NextResponse.json({ success: true, subscription }, { status: 201 })
  } catch (err) {
    console.error('Subscription API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin-only: list all subscriptions.
export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('subscriptions')
    .select('*, customers(name, email, phone)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ subscriptions: data })
}
