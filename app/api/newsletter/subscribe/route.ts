import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public: opt in to the newsletter (footer form, blog, signup).
export async function POST(request: Request) {
  let body: { email?: string; name?: string; source?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 })
  }

  const supabase = createAdminClient()
  // Re-subscribe if they previously unsubscribed; otherwise insert.
  const { error } = await supabase.from('newsletter_subscribers').upsert(
    {
      email,
      name: typeof body.name === 'string' ? body.name.trim() || null : null,
      status: 'subscribed',
      source: body.source === 'signup' ? 'signup' : 'footer',
      unsubscribed_at: null,
    },
    { onConflict: 'email' }
  )
  if (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Could not subscribe' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
