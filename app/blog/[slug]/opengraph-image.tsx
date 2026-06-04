import { ImageResponse } from 'next/og'
import { getPost } from '@/lib/content'

export const runtime = 'nodejs'
export const alt = 'cleanngo article'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  const title = post?.title ?? 'cleanngo'
  const category = post?.category ?? 'Cleaning tips'

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 70, background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4A7FA5, #7BA7C7)' }}>
            <svg width="32" height="32" viewBox="0 0 100 100"><path d="M50 6 Q57 43 94 50 Q57 57 50 94 Q43 57 6 50 Q43 43 50 6 Z" fill="#fff" /></svg>
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>cleanngo</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#7BA7C7', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 18 }}>{category}</div>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)' }}>cleanngo.com.au</div>
      </div>
    ),
    { ...size }
  )
}
