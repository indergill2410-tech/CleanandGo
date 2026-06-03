import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

// Admin-only: redirect to a short-lived signed URL for the applicant's resume
// (stored in the private resumes bucket).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = createAdminClient()
  const { data: app } = await supabase.from('job_applications').select('resume_url').eq('id', id).single()
  if (!app?.resume_url) return NextResponse.json({ error: 'No resume on file' }, { status: 404 })

  const { data, error } = await supabase.storage.from('resumes').createSignedUrl(app.resume_url, 120)
  if (error || !data) return NextResponse.json({ error: 'Could not generate link' }, { status: 500 })

  return NextResponse.redirect(data.signedUrl)
}
