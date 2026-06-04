import { BLOG_POSTS } from '@/lib/content'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// RSS feed for the blog / newsletter.
export async function GET() {
  const items = [...BLOG_POSTS]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((p) => `
    <item>
      <title>${escape(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid>${SITE_URL}/blog/${p.slug}</guid>
      <description>${escape(p.excerpt)}</description>
      <category>${escape(p.category)}</category>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>cleanngo — Cleaning tips &amp; guides</title>
    <link>${SITE_URL}/blog</link>
    <description>Professional cleaning tips, checklists and guides for Australian homes and offices.</description>
    <language>en-AU</language>${items}
  </channel>
</rss>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
