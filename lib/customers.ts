import type { createAdminClient } from '@/lib/supabase/admin'

type AdminClient = ReturnType<typeof createAdminClient>

export type CustomerInput = { name: string; email: string; phone?: string }

/**
 * Resolve a customer by email, creating one only if none exists.
 *
 * We deliberately do NOT upsert/overwrite: these helpers run on public,
 * unauthenticated endpoints, so overwriting an existing customer's name/phone
 * would let anyone tamper with another person's record. Existing records are
 * returned untouched (a missing phone is backfilled, never overwritten).
 */
export async function getOrCreateCustomer(supabase: AdminClient, { name, email, phone }: CustomerInput) {
  const { data: existing, error: selectError } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (selectError) return { customer: null, error: selectError }

  if (existing) {
    if (!existing.phone && phone) {
      await supabase.from('customers').update({ phone }).eq('id', existing.id)
      existing.phone = phone
    }
    return { customer: existing, error: null }
  }

  const { data: created, error: insertError } = await supabase
    .from('customers')
    .insert({ name, email, phone })
    .select('*')
    .single()

  return { customer: created, error: insertError }
}

/**
 * Create a Supabase auth account for a customer (with their chosen password)
 * and link it to their customer record. Best-effort: returns false (without
 * throwing) if the email already has an account, so it never blocks a booking.
 */
export async function createCustomerAccount(
  supabase: AdminClient,
  customerId: string,
  email: string,
  password: string
): Promise<boolean> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error || !data?.user) {
    // Most commonly: the email is already registered. Leave it to them to log in.
    return false
  }
  await supabase.from('customers').update({ user_id: data.user.id }).eq('id', customerId)
  return true
}
