import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

// Admin-only: move an application through the pipeline. Approving promotes the
// applicant into the staff table as a cleaner.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  let action: string
  try {
    const body = await request.json()
    action = body?.action
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!action || !['reviewing', 'approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: app } = await supabase.from('job_applications').select('*').eq('id', id).single()
  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  if (action === 'reviewing') {
    await supabase.from('job_applications').update({ status: 'reviewing' }).eq('id', id)
    return NextResponse.json({ ok: true, status: 'reviewing' })
  }

  if (action === 'reject') {
    await supabase.from('job_applications').update({ status: 'rejected' }).eq('id', id)
    return NextResponse.json({ ok: true, status: 'rejected' })
  }

  // approve -> create (or reuse) a staff record, then link it.
  let staffId = app.staff_id as string | null
  if (!staffId) {
    const { data: existing } = await supabase.from('staff').select('id').eq('email', app.email).maybeSingle()
    if (existing) {
      staffId = existing.id
    } else {
      const { data: created, error: staffError } = await supabase
        .from('staff')
        .insert({ name: app.name, email: app.email, phone: app.phone, suburb: app.suburbs, role: 'cleaner', status: 'active' })
        .select('id')
        .single()
      if (staffError || !created) {
        console.error('Staff create error:', staffError)
        return NextResponse.json({ error: 'Could not create staff record' }, { status: 500 })
      }
      staffId = created.id
    }
  }

  await supabase.from('job_applications').update({ status: 'approved', staff_id: staffId }).eq('id', id)
  return NextResponse.json({ ok: true, status: 'approved', staffId })
}
