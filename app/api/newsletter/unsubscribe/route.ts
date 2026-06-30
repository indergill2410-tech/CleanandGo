import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/seo'

export const runtime = 'nodejs'

// Public: one-click unsubscribe via the token in every newsletter email.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (token) {
    const supabase = createAdminClient()
    await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
      .eq('token', token)
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed — cleanngo</title></head>
<body style="margin:0;font-family:-apple-system,Segoe UI,sans-serif;background:#0B3558;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;">
<div style="max-width:420px;padding:32px;">
  <div style="font-size:40px;margin-bottom:12px;">👋</div>
  <h1 style="font-size:22px;margin:0 0 8px;">You’ve been unsubscribed</h1>
  <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">You won’t receive any more marketing emails from cleanngo. You can re-subscribe any time from our website.</p>
  <a href="${SITE_URL}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#fff;color:#0B3558;font-weight:700;border-radius:10px;text-decoration:none;">Back to cleanngo</a>
</div></body></html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
