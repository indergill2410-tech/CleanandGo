import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const MAX_FILES = 6
const MAX_BYTES = 8 * 1024 * 1024 // 8MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const BUCKET = 'booking-photos'

// Public: upload up to 6 booking photos. Uploaded server-side with the
// service-role key, returns public URLs to attach to the booking/plan.
export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const files = form.getAll('files').filter((f): f is File => f instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Up to ${MAX_FILES} photos allowed` }, { status: 400 })
    }

    const supabase = createAdminClient()
    const urls: string[] = []

    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        return NextResponse.json({ error: 'Only JPG, PNG, WebP or PDF files are allowed' }, { status: 400 })
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'Each photo must be 8MB or smaller' }, { status: 400 })
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false })

      if (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      urls.push(data.publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (err) {
    console.error('Uploads API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
