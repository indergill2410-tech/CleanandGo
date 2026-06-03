import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { generateUpcomingVisits } from '@/lib/coverage'

export const runtime = 'nodejs'

// Generate the next upcoming visit for each active subscription.
// Callable by an admin, or by a scheduler with the CRON_SECRET bearer token.
async function handle(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const provided = req.headers.get('authorization')
  const isCron = cronSecret && provided === `Bearer ${cronSecret}`

  if (!isCron) {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const result = await generateUpcomingVisits()
  return NextResponse.json({ ok: true, ...result })
}

export const GET = handle
export const POST = handle
