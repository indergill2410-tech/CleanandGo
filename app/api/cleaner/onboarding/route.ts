import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/auth'
import { AGREEMENT_TEMPLATES, REQUIRED_AGREEMENT_TYPES, getAgreementTemplate, type AgreementType } from '@/lib/agreements'

export const runtime = 'nodejs'

const digitsOnly = (value: string) => value.replace(/\D/g, '')
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const optional = (value: unknown) => clean(value) || null
const bool = (value: unknown) => value === true
const dateOrNull = (value: unknown) => {
  const text = clean(value)
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null
}

function validateProfileInput(body: Record<string, unknown>) {
  const abn = digitsOnly(clean(body.abn))
  const bsb = digitsOnly(clean(body.bsb))
  const accountNumber = digitsOnly(clean(body.accountNumber))

  if (abn && abn.length !== 11) return { error: 'Enter an 11 digit ABN' }
  if (bsb && bsb.length !== 6) return { error: 'Enter a 6 digit BSB' }
  if (accountNumber && (accountNumber.length < 4 || accountNumber.length > 10)) {
    return { error: 'Enter a valid account number' }
  }

  return { abn, bsb, accountNumber }
}

export async function GET() {
  const auth = await requireStaff()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const [{ data: profile, error: profileError }, { data: agreements, error: agreementError }, { data: payments, error: paymentError }] = await Promise.all([
    supabase.from('contractor_profiles').select('*').eq('staff_id', auth.staff.id).maybeSingle(),
    supabase.from('staff_agreements').select('id, agreement_type, version, title, accepted_at').eq('staff_id', auth.staff.id).order('accepted_at', { ascending: false }),
    supabase.from('staff_payments').select('id, amount_cents, status, pay_period_start, pay_period_end, payment_method, payment_reference, created_at, approved_at, paid_at').eq('staff_id', auth.staff.id).order('created_at', { ascending: false }).limit(20),
  ])

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  if (agreementError) return NextResponse.json({ error: agreementError.message }, { status: 500 })
  if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 500 })

  const acceptedTypes = new Set((agreements || []).map((agreement) => agreement.agreement_type))
  const missingAgreementTypes = REQUIRED_AGREEMENT_TYPES.filter((type) => !acceptedTypes.has(type))

  return NextResponse.json({
    staff: auth.staff,
    profile,
    agreements: agreements || [],
    agreementTemplates: AGREEMENT_TEMPLATES,
    missingAgreementTypes,
    payments: payments || [],
  })
}

export async function PATCH(request: Request) {
  const auth = await requireStaff()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validated = validateProfileInput(body)
  if ('error' in validated) return NextResponse.json({ error: validated.error }, { status: 400 })

  const submit = bool(body.submit)
  const now = new Date().toISOString()
  const payload = {
    staff_id: auth.staff.id,
    legal_name: optional(body.legalName),
    preferred_name: optional(body.preferredName),
    date_of_birth: dateOrNull(body.dateOfBirth),
    residential_address: optional(body.residentialAddress),
    emergency_contact_name: optional(body.emergencyContactName),
    emergency_contact_phone: optional(body.emergencyContactPhone),
    emergency_contact_relation: optional(body.emergencyContactRelation),
    abn: validated.abn || null,
    business_name: optional(body.businessName),
    gst_registered: bool(body.gstRegistered),
    bank_name: optional(body.bankName),
    bank_account_name: optional(body.bankAccountName),
    bsb: validated.bsb || null,
    account_number: validated.accountNumber || null,
    insurance_url: optional(body.insuranceUrl),
    police_check_number: optional(body.policeCheckNumber),
    police_check_expiry: dateOrNull(body.policeCheckExpiry),
    wwcc_number: optional(body.wwccNumber),
    wwcc_expiry: dateOrNull(body.wwccExpiry),
    driver_licence: optional(body.driverLicence),
    vehicle_available: bool(body.vehicleAvailable),
    vehicle_registration: optional(body.vehicleRegistration),
    service_areas: optional(body.serviceAreas),
    availability: optional(body.availability),
    onboarding_status: submit ? 'submitted' : 'incomplete',
    submitted_at: submit ? now : null,
    updated_at: now,
  }

  if (submit) {
    const required = [
      payload.legal_name,
      payload.residential_address,
      payload.emergency_contact_name,
      payload.emergency_contact_phone,
      payload.abn,
      payload.bank_account_name,
      payload.bsb,
      payload.account_number,
    ]
    if (required.some((value) => !value)) {
      return NextResponse.json({ error: 'Legal name, address, emergency contact, ABN and bank details are required before submitting' }, { status: 400 })
    }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('contractor_profiles')
    .upsert(payload, { onConflict: 'staff_id' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}

export async function POST(request: Request) {
  const auth = await requireStaff()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const agreementType = clean(body.agreementType) as AgreementType
  const template = getAgreementTemplate(agreementType)
  if (!template) return NextResponse.json({ error: 'Invalid agreement type' }, { status: 400 })
  if (body.accepted !== true) return NextResponse.json({ error: 'Agreement must be accepted' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('contractor_profiles')
    .select('legal_name, abn')
    .eq('staff_id', auth.staff.id)
    .maybeSingle()

  const { data, error } = await supabase
    .from('staff_agreements')
    .upsert({
      staff_id: auth.staff.id,
      agreement_type: template.type,
      version: template.version,
      title: template.title,
      agreement_snapshot: template.body,
      staff_name_at_acceptance: profile?.legal_name || auth.staff.name,
      abn_at_acceptance: profile?.abn || null,
      accepted_ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      accepted_user_agent: request.headers.get('user-agent') || null,
      accepted_at: new Date().toISOString(),
    }, { onConflict: 'staff_id,agreement_type,version' })
    .select('id, agreement_type, version, title, accepted_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ agreement: data })
}
