import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { assertSupabaseProjectUrl } from './project'

/**
 * Server-only Supabase client using the service-role key.
 *
 * This bypasses Row Level Security, so it must NEVER be imported into client
 * components or exposed to the browser. Use it for trusted server-side work:
 * public booking creation, admin dashboard reads/writes, webhook handlers, etc.
 * Always pair admin-only operations with an authorization check (see lib/auth).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin credentials: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }
  assertSupabaseProjectUrl(url, 'Supabase admin client')

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
