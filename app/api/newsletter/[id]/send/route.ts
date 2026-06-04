import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { sendNewsletterEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const maxDuration = 120

// Admin: email a post to all opted-in subscribers (auto-publishes if needed).
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = createAdminClient()

  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  // Ensure it's published so the "Read on the blog" link works.
  if (post.status !== 'published') {
    await supabase.from('blog_posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id)
  }

  const { data: subs } = await supabase
    .from('newsletter_subscribers')
    .select('email, token')
    .eq('status', 'subscribed')

  const recipients = subs || []
  let sent = 0
  // Send in small batches to be gentle on the email API.
  for (let i = 0; i < recipients.length; i += 20) {
    const batch = recipients.slice(i, i + 20)
    const results = await Promise.allSettled(
      batch.map((s) =>
        sendNewsletterEmail({
          to: s.email,
          token: s.token,
          title: post.title,
          excerpt: post.excerpt,
          sections: post.sections,
          slug: post.slug,
        })
      )
    )
    sent += results.filter((r) => r.status === 'fulfilled').length
  }

  return NextResponse.json({ ok: true, sent, total: recipients.length })
}
