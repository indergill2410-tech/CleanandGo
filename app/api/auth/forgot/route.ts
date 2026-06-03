import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPasswordResetEmail } from '@/lib/email'

export const runtime = 'nodejs'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cleanandgo.onrender.com'

// Public: request a password reset. Always returns success (no account
// enumeration). If the email belongs to a user, a reset link is emailed.
export async function POST(request: Request) {
  let email = ''
  try {
    const body = await request.json()
    email = typeof body?.email === 'string' ? body.email.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${APP_URL}/set-password` },
    })
    const link = data?.properties?.action_link
    if (!error && link) {
      await sendPasswordResetEmail({ email, actionLink: link }).catch(e => console.error('Reset email failed:', e))
    }
  } catch (err) {
    // Swallow — never reveal whether the account exists.
    console.error('Forgot-password error:', err)
  }

  return NextResponse.json({ ok: true })
}
