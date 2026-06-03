import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const MAX_BYTES = 8 * 1024 * 1024 // 8MB
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png']
const BUCKET = 'resumes'

// Public: upload a single resume to the PRIVATE resumes bucket. Returns the
// storage path (not a public URL) — admins view it later via a signed URL.
export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Resume must be a PDF, JPG or PNG' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Resume must be 8MB or smaller' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const path = `${crypto.randomUUID()}.${ext}`

    const supabase = createAdminClient()
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
    if (error) {
      console.error('Resume upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    return NextResponse.json({ path })
  } catch (err) {
    console.error('Resume upload API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
