import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionUser } from '@/lib/auth'

// Links the signed-in auth user to their customer record (matched by email),
// creating one if needed. Called right after signup/login.
export async function POST() {
  try {
    const user = await getSessionUser()
    if (!user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const supabase = createAdminClient()

    const { data: existing, error: existingError } = await supabase
      .from('customers')
      .select('id, user_id')
      .eq('email', user.email)
      .maybeSingle()

    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })

    if (existing) {
      if (!existing.user_id) {
        const { error } = await supabase.from('customers').update({ user_id: user.id }).eq('id', existing.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ ok: true, customerId: existing.id })
    }

    const { data: created, error } = await supabase
      .from('customers')
      .insert({
        name: (user.user_metadata?.full_name as string) || user.email,
        email: user.email,
        user_id: user.id,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, customerId: created.id })
  } catch (error) {
    console.error('Customer claim failed:', error)
    return NextResponse.json({ error: 'Account service is temporarily unavailable' }, { status: 503 })
  }
}
