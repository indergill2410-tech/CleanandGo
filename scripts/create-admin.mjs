#!/usr/bin/env node
/**
 * Create (or promote) the first admin.
 *
 * Usage:
 *   node scripts/create-admin.mjs <email> <password> "<Full Name>"
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env
 * (e.g. `set -a && source .env.local && set +a`).
 */
import { createClient } from '@supabase/supabase-js'

const [email, password, name = 'Admin'] = process.argv.slice(2)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> "<Full Name>"')
  process.exit(1)
}
if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// 1. Find or create the auth user.
let userId
const created = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: name },
})

if (created.error) {
  if (!/already.*registered|exists/i.test(created.error.message)) {
    console.error('Failed to create auth user:', created.error.message)
    process.exit(1)
  }
  // Already exists — look them up.
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) { console.error(error.message); process.exit(1) }
  userId = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())?.id
  if (!userId) { console.error('User exists but could not be found.'); process.exit(1) }
  console.log('Auth user already existed — promoting to admin.')
} else {
  userId = created.data.user.id
  console.log('Created auth user.')
}

// 2. Upsert the admin staff row.
const { error: staffError } = await supabase
  .from('staff')
  .upsert(
    { user_id: userId, name, email, role: 'admin', status: 'active' },
    { onConflict: 'email' }
  )

if (staffError) {
  console.error('Failed to create staff row:', staffError.message)
  process.exit(1)
}

console.log(`✅ ${email} is now an active admin. Sign in at /login.`)
