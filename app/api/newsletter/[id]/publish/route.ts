import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

// Admin: approve a draft — publishes it to the blog.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, slug, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, ...data })
}
