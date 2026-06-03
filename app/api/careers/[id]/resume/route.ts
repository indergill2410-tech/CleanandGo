import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

const DOC_COLUMN: Record<string, string> = {
  resume: 'resume_url',
  police: 'police_check_url',
  wwcc: 'wwcc_url',
}

// Admin-only: redirect to a short-lived signed URL for an applicant document
// (resume / police check / WWCC) stored in the private resumes bucket.
// ?doc=resume|police|wwcc — defaults to resume.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const doc = new URL(request.url).searchParams.get('doc') || 'resume'
  const column = DOC_COLUMN[doc]
  if (!column) return NextResponse.json({ error: 'Unknown document' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: app } = await supabase.from('job_applications').select(column).eq('id', id).single()
  const path = (app as Record<string, string | null> | null)?.[column]
  if (!path) return NextResponse.json({ error: 'No document on file' }, { status: 404 })

  const { data, error } = await supabase.storage.from('resumes').createSignedUrl(path, 120)
  if (error || !data) return NextResponse.json({ error: 'Could not generate link' }, { status: 500 })

  return NextResponse.redirect(data.signedUrl)
}
