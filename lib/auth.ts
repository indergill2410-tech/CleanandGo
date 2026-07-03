import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type StaffRecord = {
  id: string
  user_id: string
  name: string
  email: string
  phone: string | null
  suburb: string | null
  role: string
  status: string
}

type AuthResult =
  | { ok: true; userId: string; staff: StaffRecord }
  | { ok: false; status: 401 | 403 | 503; error: string }

/**
 * Returns the currently signed-in Supabase user, or null.
 * Reads the session from the request cookies (anon SSR client).
 */
export async function getSessionUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Guards an admin-only route. Verifies the caller is signed in AND has a
 * matching `staff` row with role = 'admin'. The staff lookup uses the
 * service-role client so it isn't blocked by RLS.
 */
export async function requireAdmin(): Promise<AuthResult> {
  let user
  try {
    user = await getSessionUser()
  } catch (error) {
    return authUnavailable('Admin session lookup failed', error)
  }
  if (!user) return { ok: false, status: 401, error: 'Not authenticated' }

  let staff: StaffRecord | null = null
  try {
    const admin = createAdminClient()
    const result = await admin
      .from('staff')
      .select('id, user_id, name, email, phone, suburb, role, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (result.error) return authUnavailable('Admin staff lookup failed', result.error)
    staff = result.data as StaffRecord | null
  } catch (error) {
    return authUnavailable('Admin staff lookup failed', error)
  }

  if (!staff || staff.role !== 'admin' || staff.status !== 'active') {
    return { ok: false, status: 403, error: 'Admin access required' }
  }

  return { ok: true, userId: user.id, staff }
}

/**
 * Guards a staff-only route (cleaner or admin). Verifies the caller is signed
 * in AND has an active `staff` row.
 */
export async function requireStaff(): Promise<AuthResult> {
  let user
  try {
    user = await getSessionUser()
  } catch (error) {
    return authUnavailable('Staff session lookup failed', error)
  }
  if (!user) return { ok: false, status: 401, error: 'Not authenticated' }

  let staff: StaffRecord | null = null
  try {
    const admin = createAdminClient()
    const result = await admin
      .from('staff')
      .select('id, user_id, name, email, phone, suburb, role, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (result.error) return authUnavailable('Staff lookup failed', result.error)
    staff = result.data as StaffRecord | null
  } catch (error) {
    return authUnavailable('Staff lookup failed', error)
  }

  if (!staff || staff.status !== 'active') {
    return { ok: false, status: 403, error: 'Staff access required' }
  }

  return { ok: true, userId: user.id, staff }
}

export type CustomerRecord = {
  id: string
  user_id: string
  name: string
  email: string
  phone: string | null
}

type CustomerAuthResult =
  | { ok: true; userId: string; customer: CustomerRecord }
  | { ok: false; status: 401 | 403 | 503; error: string }

function authUnavailable(context: string, error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    String((error as { digest?: unknown }).digest).includes('DYNAMIC_SERVER_USAGE')
  ) {
    throw error
  }

  console.error(`${context}:`, error)
  return { ok: false as const, status: 503 as const, error: 'Authentication service is temporarily unavailable' }
}

/**
 * Guards a customer-account route. Verifies the caller is signed in AND has a
 * matching `customers` row linked to their auth user.
 */
export async function requireCustomer(): Promise<CustomerAuthResult> {
  let user
  try {
    user = await getSessionUser()
  } catch (error) {
    return authUnavailable('Customer session lookup failed', error)
  }
  if (!user) return { ok: false, status: 401, error: 'Not authenticated' }

  let customer: CustomerRecord | null = null
  try {
    const admin = createAdminClient()
    const result = await admin
      .from('customers')
      .select('id, user_id, name, email, phone')
      .eq('user_id', user.id)
      .maybeSingle()

    if (result.error) return authUnavailable('Customer lookup failed', result.error)
    customer = result.data as CustomerRecord | null
  } catch (error) {
    return authUnavailable('Customer lookup failed', error)
  }

  if (!customer) {
    return { ok: false, status: 403, error: 'Customer account required' }
  }

  return { ok: true, userId: user.id, customer }
}
