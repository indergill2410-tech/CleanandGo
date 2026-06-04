import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { getAnthropic, hasAnthropic } from '@/lib/anthropic'

export const runtime = 'nodejs'
export const maxDuration = 120

type Section = { heading?: string; paragraphs?: string[]; bullets?: string[] }
type Draft = { title: string; excerpt: string; category: string; keywords: string[]; readTime?: string; sections: Section[] }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70)
}

// Authorised either by the cron secret (Bearer) or an admin session.
async function authorise(request: Request) {
  const auth = request.headers.get('authorization')
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true
  const admin = await requireAdmin()
  return admin.ok
}

// Research the web with Claude and draft a newsletter post (saved as a DRAFT).
export async function POST(request: Request) {
  if (!(await authorise(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasAnthropic()) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 503 })
  }

  const today = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
  const prompt = `You are the content writer for cleanngo, an Australia-wide home and office cleaning service. Research the web for a timely, genuinely useful topic for our weekly customer newsletter for ${today} — think seasonal cleaning advice, current home-care trends in Australia, bond/end-of-lease tips, or health/allergen angles. Use recent, reputable sources.

Then write one original newsletter article in Australian English. It must be practical and specific (not generic filler), friendly, and ~500-700 words. Do not invent statistics; only cite facts you found.

Respond with ONLY a JSON object (no markdown, no commentary) in exactly this shape:
{
  "title": "string (compelling, <70 chars)",
  "excerpt": "string (1 sentence summary)",
  "category": "string (e.g. Cleaning Tips, Seasonal, End of Lease)",
  "keywords": ["3-6 short SEO keywords"],
  "readTime": "X min read",
  "sections": [
    { "heading": "optional string", "paragraphs": ["..."], "bullets": ["optional list items"] }
  ]
}`

  let text = ''
  try {
    const msg = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
      messages: [{ role: 'user', content: prompt }],
    })
    text = msg.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('\n').trim()
  } catch (e) {
    console.error('Anthropic generate error:', e)
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }

  // Extract the JSON object from the response.
  let draft: Draft
  try {
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
    draft = JSON.parse(json)
  } catch {
    return NextResponse.json({ error: 'Could not parse generated draft' }, { status: 502 })
  }
  if (!draft?.title || !Array.isArray(draft.sections)) {
    return NextResponse.json({ error: 'Generated draft was incomplete' }, { status: 502 })
  }

  const supabase = createAdminClient()
  let slug = slugify(draft.title)
  const { data: clash } = await supabase.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
  if (clash) slug = `${slug}-${Date.now().toString().slice(-5)}`

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug,
      title: draft.title.slice(0, 200),
      excerpt: draft.excerpt || null,
      category: draft.category || 'Newsletter',
      keywords: Array.isArray(draft.keywords) ? draft.keywords.slice(0, 8) : [],
      read_time: draft.readTime || '4 min read',
      sections: draft.sections,
      source: 'newsletter',
      status: 'draft',
    })
    .select('id, slug, title')
    .single()

  if (error) {
    console.error('Draft insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Flag it for the admin.
  await supabase.from('notifications').insert([{
    type: 'newsletter_draft',
    title: 'Weekly newsletter draft ready',
    message: `“${data.title}” is ready to review, approve and send.`,
    read: false,
  }])

  return NextResponse.json({ ok: true, ...data }, { status: 201 })
}
