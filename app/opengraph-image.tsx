import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'cleanngo — Professional cleaning, Australia-wide'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #172434 0%, #172434 100%)', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2F7D6B, #8FD8B4)' }}>
            <svg width="44" height="44" viewBox="0 0 100 100"><path d="M50 6 Q57 43 94 50 Q57 57 50 94 Q43 57 6 50 Q43 43 50 6 Z" fill="#fff" /></svg>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>cleanngo</div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700 }}>Your home, spotless. Guaranteed.</div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>Professional cleaning, Australia-wide</div>
      </div>
    ),
    { ...size }
  )
}
