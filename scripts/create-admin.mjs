#!/usr/bin/env node
/**
 * Create or promote Cleanngo admins.
 *
 * Usage:
 *   node scripts/create-admin.mjs <email> <password> "<Full Name>"
 *   ADMIN_PASSWORD="<password>" node scripts/create-admin.mjs --default-admins
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PROJECT_REF, and
 * SUPABASE_SERVICE_ROLE_KEY in the env.
 */
import { createClient } from '@supabase/supabase-js'

const DEFAULT_ADMINS = [
  { email: 'fizaadrees879@gmail.com', name: 'Fiza Adrees' },
  { email: 'indergill2410@gmail.com', name: 'Inder Gill' },
]
const REQUIRED_TABLES = ['staff', 'customers', 'bookings', 'notifications']
const PLACEHOLDER_REFS = new Set(['placeholder', 'your-project-ref', 'your_supabase_project_ref'])

const args = process.argv.slice(2)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const expectedProjectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || process.env.SUPABASE_PROJECT_REF
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function usage() {
  console.error([
    'Usage:',
    '  node scripts/create-admin.mjs <email> <password> "<Full Name>"',
    '  ADMIN_PASSWORD="<password>" node scripts/create-admin.mjs --default-admins',
  ].join('\n'))
}

function projectRefFromUrl(value) {
  if (!value) return null
  try {
    const hostname = new URL(value).hostname
    const suffix = '.supabase.co'
    if (!hostname.endsWith(suffix)) return null
    const projectRef = hostname.slice(0, -suffix.length)
    return PLACEHOLDER_REFS.has(projectRef) ? null : projectRef
  } catch {
    return null
  }
}

function assertProject() {
  const actualProjectRef = projectRefFromUrl(url)

  if (!url || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
    process.exit(1)
  }
  if (!actualProjectRef) {
    console.error('NEXT_PUBLIC_SUPABASE_URL must be a hosted Supabase project URL.')
    process.exit(1)
  }
  if (!expectedProjectRef || PLACEHOLDER_REFS.has(expectedProjectRef)) {
    console.error(`Missing NEXT_PUBLIC_SUPABASE_PROJECT_REF. Set it to ${actualProjectRef} after verifying this is the intended Cleanngo Supabase project.`)
    process.exit(1)
  }
  if (actualProjectRef !== expectedProjectRef) {
    console.error(`Project guard failed: URL points to ${actualProjectRef}, but NEXT_PUBLIC_SUPABASE_PROJECT_REF is ${expectedProjectRef}.`)
    process.exit(1)
  }
}

function adminTargets() {
  if (args.includes('--default-admins') || args.includes('--admins')) {
    const password = process.env.ADMIN_PASSWORD || process.env.CLEANNGO_ADMIN_PASSWORD
    if (!password) {
      console.error('Missing ADMIN_PASSWORD for --default-admins. Keep the password in your shell env, not in git.')
      process.exit(1)
    }
    return DEFAULT_ADMINS.map((admin) => ({ ...admin, password }))
  }

  const [email, password, name = 'Admin'] = args
  if (!email || !password) {
    usage()
    process.exit(1)
  }
  return [{ email, password, name }]
}

assertProject()

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function verifySchema() {
  const checks = await Promise.all(REQUIRED_TABLES.map(async (table) => {
    const { error } = await supabase.from(table).select('id').limit(1)
    return { table, error }
  }))

  const missing = checks.filter(({ error }) => error)
  if (missing.length > 0) {
    console.error('Supabase schema guard failed. This does not look like the Cleanngo app database.')
    missing.forEach(({ table, error }) => console.error(`- ${table}: ${error.message}`))
    process.exit(1)
  }
}

async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase()
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail)
    if (user || data.users.length < 1000) return user
    page += 1
  }
}

async function createOrPromoteAdmin({ email, password, name }) {
  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  let userId

  if (created.error) {
    if (!/already.*registered|exists/i.test(created.error.message)) {
      throw new Error(`Failed to create auth user for ${email}: ${created.error.message}`)
    }

    const existingUser = await findUserByEmail(email)
    if (!existingUser) throw new Error(`User ${email} exists but could not be found.`)

    userId = existingUser.id
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })
    if (updateError) throw new Error(`Failed to refresh password for ${email}: ${updateError.message}`)

    console.log(`${email}: existing auth user found, password refreshed, promoting to admin.`)
  } else {
    userId = created.data.user.id
    console.log(`${email}: created auth user.`)
  }

  const { error: staffError } = await supabase
    .from('staff')
    .upsert(
      { user_id: userId, name, email, role: 'admin', status: 'active' },
      { onConflict: 'email' }
    )

  if (staffError) throw new Error(`Failed to create staff row for ${email}: ${staffError.message}`)

  console.log(`${email}: active admin ready. Sign in at /login.`)
}

await verifySchema()

for (const target of adminTargets()) {
  await createOrPromoteAdmin(target)
}
