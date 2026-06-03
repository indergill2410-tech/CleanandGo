import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { provisionStaffLogin } from '@/lib/onboarding'
import { sendStaffInviteEmail } from '@/lib/email'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Admin-only: list staff. Defaults to active only (for assignment dropdowns);
// pass ?all=true for the full team-management view.
export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const all = new URL(request.url).searchParams.get('all') === 'true'
  const supabase = createAdminClient()
  let query = supabase
    .from('staff')
    .select('id, name, email, phone, role, status, suburb, user_id, created_at')
    .order('name', { ascending: true })
  if (!all) query = query.eq('status', 'active')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}

// Admin-only: add a staff member (admin or cleaner). Provisions their login and
// emails a set-password invite; returns the link if email isn't configured.
export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const suburb = typeof body.suburb === 'string' ? body.suburb.trim() : ''
  const role = body.role === 'admin' ? 'admin' : 'cleaner'

  if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: existingStaff } = await supabase
    .from('staff')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (existingStaff) {
    return NextResponse.json({ error: 'A staff member with this email already exists' }, { status: 400 })
  }

  const provisioned = await provisionStaffLogin(supabase, email)
  if ('error' in provisioned) {
    console.error('Provision login error:', provisioned.error)
    return NextResponse.json({ error: 'Could not create login account' }, { status: 500 })
  }
  const { userId, actionLink } = provisioned

  const { error } = await supabase
    .from('staff')
    .upsert(
      { name, email, phone: phone || null, suburb: suburb || null, role, status: 'active', user_id: userId },
      { onConflict: 'email' }
    )
  if (error) {
    console.error('Staff upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let emailed = false
  try {
    await sendStaffInviteEmail({ name, email, actionLink, role })
    emailed = true
  } catch (e) {
    console.error('Invite email failed:', e)
  }

  return NextResponse.json({ ok: true, emailed, inviteLink: emailed ? undefined : actionLink })
}
