import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// resume_url is a server-generated storage path: <uuid>.<ext>
const RESUME_PATH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|jpeg|png)$/i

// Public: a cleaner applies to join the team.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, suburbs, experience, availability, hasAbn, rightToWork, resumeUrl } = body

    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const trimmedEmail = typeof email === 'string' ? email.trim() : ''
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : ''

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      return NextResponse.json({ error: 'Name, email and phone are required' }, { status: 400 })
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (resumeUrl && (typeof resumeUrl !== 'string' || !RESUME_PATH_RE.test(resumeUrl))) {
      return NextResponse.json({ error: 'Invalid resume reference' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from('job_applications').insert({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      suburbs: typeof suburbs === 'string' ? suburbs.trim() || null : null,
      experience: typeof experience === 'string' ? experience.trim() || null : null,
      availability: typeof availability === 'string' ? availability.trim() || null : null,
      has_abn: !!hasAbn,
      right_to_work: !!rightToWork,
      resume_url: resumeUrl || null,
      status: 'new',
    })

    if (error) {
      console.error('Application insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('notifications').insert([{
      type: 'new_application',
      title: 'New Cleaner Application',
      message: `${trimmedName} applied to join the team (${suburbs || 'area not specified'}).`,
      read: false,
    }])

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Careers apply error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin-only: list applications.
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ applications: data })
}
