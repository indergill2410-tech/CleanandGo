import { NextResponse } from 'next/server'
import { getSupabasePublicConfig, supabaseProjectRefFromUrl } from '@/lib/supabase/project'

export async function GET() {
  const supabase = getSupabasePublicConfig()

  return NextResponse.json({
    status: 'ok',
    app: 'cleanngo',
    version: '1.0.0',
    checks: {
      supabasePublicConfig: supabase.ok,
      supabaseProjectRef: supabaseProjectRefFromUrl(supabase.url),
      supabaseAdminKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      resendApiKey: Boolean(process.env.RESEND_API_KEY),
      resendFromEmail: Boolean(process.env.RESEND_FROM_EMAIL),
    },
    timestamp: new Date().toISOString(),
  })
}
