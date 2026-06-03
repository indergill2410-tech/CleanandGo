import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { sendAdminNewApplicationEmail } from '@/lib/email'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Uploaded docs are server-generated storage paths: <uuid>.<ext>
const DOC_PATH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|jpeg|png)$/i
const validDoc = (v: unknown) => v === undefined || v === null || v === '' || (typeof v === 'string' && DOC_PATH_RE.test(v))

// Public: a cleaner applies to join the team.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name, email, phone, suburbs, experience, availability, hasAbn, rightToWork,
      resumeUrl, hasPoliceCheck, policeCheckUrl, hasWwcc, wwccUrl,
    } = body

    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const trimmedEmail = typeof email === 'string' ? email.trim() : ''
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : ''

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      return NextResponse.json({ error: 'Name, email and phone are required' }, { status: 400 })
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (!validDoc(resumeUrl) || !validDoc(policeCheckUrl) || !validDoc(wwccUrl)) {
      return NextResponse.json({ error: 'Invalid document reference' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const trimmedSuburbs = typeof suburbs === 'string' ? suburbs.trim() || null : null

    const { error } = await supabase.from('job_applications').insert({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      suburbs: trimmedSuburbs,
      experience: typeof experience === 'string' ? experience.trim() || null : null,
      availability: typeof availability === 'string' ? availability.trim() || null : null,
      has_abn: !!hasAbn,
      right_to_work: !!rightToWork,
      resume_url: resumeUrl || null,
      has_police_check: !!hasPoliceCheck,
      police_check_url: policeCheckUrl || null,
      has_wwcc: !!hasWwcc,
      wwcc_url: wwccUrl || null,
      status: 'new',
    })

    if (error) {
      console.error('Application insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase.from('notifications').insert([{
      type: 'new_application',
      title: 'New Cleaner Application',
      message: `${trimmedName} applied to join the team (${trimmedSuburbs || 'area not specified'}).`,
      read: false,
    }])

    // Notify the admin by email too.
    await sendAdminNewApplicationEmail({
      name: trimmedName, email: trimmedEmail, phone: trimmedPhone,
      suburbs: trimmedSuburbs || undefined,
      availability: typeof availability === 'string' ? availability.trim() : undefined,
      hasAbn: !!hasAbn, rightToWork: !!rightToWork,
      hasPoliceCheck: !!hasPoliceCheck, hasWwcc: !!hasWwcc,
    }).catch(e => console.error('Admin application email failed:', e))

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
