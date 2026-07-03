import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionUser } from '@/lib/auth'

// Returns the signed-in user's role so the UI can route them to the right home
// (admin -> /admin, cleaner -> /cleaner, otherwise customer).
export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ role: null })

    const supabase = createAdminClient()
    const { data: staff, error } = await supabase
      .from('staff')
      .select('role, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) return NextResponse.json({ error: 'Could not verify user role' }, { status: 503 })
    if (staff && staff.status === 'active') {
      return NextResponse.json({ role: staff.role }) // 'admin' | 'cleaner'
    }
    return NextResponse.json({ role: 'customer' })
  } catch (error) {
    console.error('Role lookup failed:', error)
    return NextResponse.json({ error: 'Authentication service is temporarily unavailable' }, { status: 503 })
  }
}
