import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

// Admin: newsletter posts (drafts + published) and the subscriber count.
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const [{ data: posts }, { count }] = await Promise.all([
    supabase.from('blog_posts').select('id, slug, title, excerpt, category, status, read_time, published_at, created_at, sections').order('created_at', { ascending: false }),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'subscribed'),
  ])

  return NextResponse.json({
    drafts: (posts || []).filter((p) => p.status === 'draft'),
    published: (posts || []).filter((p) => p.status === 'published'),
    subscriberCount: count || 0,
  })
}
