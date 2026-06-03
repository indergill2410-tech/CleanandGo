import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type StaffRecord = {
  id: string
  user_id: string
  name: string
  email: string
  role: string
  status: string
}

type AuthResult =
  | { ok: true; userId: string; staff: StaffRecord }
  | { ok: false; status: 401 | 403; error: string }

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
  const user = await getSessionUser()
  if (!user) return { ok: false, status: 401, error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: staff } = await admin
    .from('staff')
    .select('id, user_id, name, email, role, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff || staff.role !== 'admin' || staff.status !== 'active') {
    return { ok: false, status: 403, error: 'Admin access required' }
  }

  return { ok: true, userId: user.id, staff: staff as StaffRecord }
}

/**
 * Guards a staff-only route (cleaner or admin). Verifies the caller is signed
 * in AND has an active `staff` row.
 */
export async function requireStaff(): Promise<AuthResult> {
  const user = await getSessionUser()
  if (!user) return { ok: false, status: 401, error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: staff } = await admin
    .from('staff')
    .select('id, user_id, name, email, role, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff || staff.status !== 'active') {
    return { ok: false, status: 403, error: 'Staff access required' }
  }

  return { ok: true, userId: user.id, staff: staff as StaffRecord }
}
