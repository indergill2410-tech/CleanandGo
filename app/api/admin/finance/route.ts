import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const optional = (value: unknown) => clean(value) || null
const centsFromDollars = (value: unknown) => {
  if (typeof value === 'number') return Math.round(value * 100)
  const text = clean(value).replace(/[$,\s]/g, '')
  if (!text) return 0
  const parsed = Number(text)
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0
}
const dateOrNull = (value: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(clean(value)) ? clean(value) : null
const now = () => new Date().toISOString()

function startOfWeek() {
  const date = new Date()
  date.setDate(date.getDate() - date.getDay())
  date.setHours(0, 0, 0, 0)
  return date
}

function startOfMonth() {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const [staffResult, profileResult, agreementResult, paymentResult, expenseResult] = await Promise.all([
    supabase.from('staff').select('id, name, email, phone, role, status, suburb, created_at').order('name', { ascending: true }),
    supabase.from('contractor_profiles').select('*').order('updated_at', { ascending: false }),
    supabase.from('staff_agreements').select('id, staff_id, agreement_type, version, title, accepted_at').order('accepted_at', { ascending: false }),
    supabase.from('staff_payments').select('id, staff_id, booking_id, pay_period_start, pay_period_end, hours_worked, rate_cents, adjustment_cents, amount_cents, payment_method, payment_reference, status, notes, created_at, approved_at, paid_at, cancelled_at, staff(name, email)').order('created_at', { ascending: false }).limit(200),
    supabase.from('business_expenses').select('id, expense_at, category, vendor, amount_cents, gst_included, payment_method, receipt_url, booking_id, staff_id, notes, created_at, staff(name)').order('expense_at', { ascending: false }).limit(200),
  ])

  const firstError = [staffResult.error, profileResult.error, agreementResult.error, paymentResult.error, expenseResult.error].find(Boolean)
  if (firstError) return NextResponse.json({ error: firstError.message }, { status: 500 })

  const profilesByStaff = new Map((profileResult.data || []).map((profile) => [profile.staff_id, profile]))
  const agreementsByStaff = new Map<string, unknown[]>()
  for (const agreement of agreementResult.data || []) {
    const bucket = agreementsByStaff.get(agreement.staff_id) || []
    bucket.push(agreement)
    agreementsByStaff.set(agreement.staff_id, bucket)
  }

  const contractorStaff = (staffResult.data || []).map((staff) => ({
    ...staff,
    contractor_profile: profilesByStaff.get(staff.id) || null,
    agreements: agreementsByStaff.get(staff.id) || [],
  }))

  const weekStart = startOfWeek().toISOString()
  const monthStart = startOfMonth().toISOString()
  const payments = paymentResult.data || []
  const expenses = expenseResult.data || []
  const sum = (rows: { amount_cents?: number | null }[]) => rows.reduce((total, row) => total + (row.amount_cents || 0), 0)

  return NextResponse.json({
    staff: contractorStaff,
    payments,
    expenses,
    metrics: {
      pendingStaffPaymentCents: sum(payments.filter((row) => row.status !== 'paid' && row.status !== 'cancelled')),
      paidStaffThisWeekCents: sum(payments.filter((row) => row.status === 'paid' && row.paid_at && row.paid_at >= weekStart)),
      paidStaffThisMonthCents: sum(payments.filter((row) => row.status === 'paid' && row.paid_at && row.paid_at >= monthStart)),
      expensesThisWeekCents: sum(expenses.filter((row) => row.expense_at >= weekStart)),
      expensesThisMonthCents: sum(expenses.filter((row) => row.expense_at >= monthStart)),
      incompleteOnboarding: contractorStaff.filter((staff) => staff.role === 'cleaner' && staff.status === 'active' && staff.contractor_profile?.onboarding_status !== 'approved').length,
    },
  })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const kind = clean(body.kind)
  const supabase = createAdminClient()

  if (kind === 'payment') {
    const staffId = clean(body.staffId)
    if (!staffId) return NextResponse.json({ error: 'Staff member is required' }, { status: 400 })

    const hoursWorked = Number(body.hoursWorked || 0)
    const rateCents = centsFromDollars(body.rate)
    const adjustmentCents = centsFromDollars(body.adjustment)
    const explicitAmountCents = centsFromDollars(body.amount)
    const computedAmountCents = Math.round((Number.isFinite(hoursWorked) ? hoursWorked : 0) * rateCents) + adjustmentCents
    const amountCents = explicitAmountCents || computedAmountCents
    if (amountCents <= 0) return NextResponse.json({ error: 'Payment amount must be greater than zero' }, { status: 400 })

    const { data: profile } = await supabase.from('contractor_profiles').select('abn').eq('staff_id', staffId).maybeSingle()
    const status = ['draft', 'approved', 'paid'].includes(clean(body.status)) ? clean(body.status) : 'draft'
    const stamp = now()

    const { data, error } = await supabase
      .from('staff_payments')
      .insert({
        staff_id: staffId,
        booking_id: optional(body.bookingId),
        timesheet_id: optional(body.timesheetId),
        abn: profile?.abn || null,
        pay_period_start: dateOrNull(body.payPeriodStart),
        pay_period_end: dateOrNull(body.payPeriodEnd),
        hours_worked: Number.isFinite(hoursWorked) && hoursWorked > 0 ? hoursWorked : null,
        rate_cents: rateCents || null,
        adjustment_cents: adjustmentCents,
        amount_cents: amountCents,
        payment_method: ['bank_transfer', 'cash', 'other'].includes(clean(body.paymentMethod)) ? clean(body.paymentMethod) : 'bank_transfer',
        payment_reference: optional(body.paymentReference),
        status,
        notes: optional(body.notes),
        created_by: auth.staff.id,
        approved_by: status === 'approved' || status === 'paid' ? auth.staff.id : null,
        paid_by: status === 'paid' ? auth.staff.id : null,
        approved_at: status === 'approved' || status === 'paid' ? stamp : null,
        paid_at: status === 'paid' ? stamp : null,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ payment: data }, { status: 201 })
  }

  if (kind === 'expense') {
    const amountCents = centsFromDollars(body.amount)
    if (amountCents <= 0) return NextResponse.json({ error: 'Expense amount must be greater than zero' }, { status: 400 })

    const category = ['fuel', 'supplies', 'equipment', 'ads', 'contractor', 'software', 'insurance', 'refunds', 'other'].includes(clean(body.category)) ? clean(body.category) : 'other'
    const paymentMethod = ['card', 'bank_transfer', 'cash', 'other'].includes(clean(body.paymentMethod)) ? clean(body.paymentMethod) : 'card'

    const { data, error } = await supabase
      .from('business_expenses')
      .insert({
        expense_at: clean(body.expenseAt) ? new Date(clean(body.expenseAt)).toISOString() : now(),
        category,
        vendor: optional(body.vendor),
        amount_cents: amountCents,
        gst_included: body.gstIncluded === true,
        payment_method: paymentMethod,
        receipt_url: optional(body.receiptUrl),
        booking_id: optional(body.bookingId),
        staff_id: optional(body.staffId),
        notes: optional(body.notes),
        created_by: auth.staff.id,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ expense: data }, { status: 201 })
  }

  return NextResponse.json({ error: 'Invalid finance record type' }, { status: 400 })
}
