'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BadgeCheck, Banknote, BriefcaseBusiness, CheckCircle2, ClipboardCheck, FileText, ShieldCheck, UserRound } from 'lucide-react'

type AgreementTemplate = {
  type: string
  version: string
  title: string
  summary: string
  body: string
}

type AcceptedAgreement = {
  id: string
  agreement_type: string
  version: string
  title: string
  accepted_at: string
}

type ContractorProfile = {
  legal_name: string | null
  preferred_name: string | null
  date_of_birth: string | null
  residential_address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relation: string | null
  abn: string | null
  business_name: string | null
  gst_registered: boolean | null
  bank_name: string | null
  bank_account_name: string | null
  bsb: string | null
  account_number: string | null
  insurance_url: string | null
  police_check_number: string | null
  police_check_expiry: string | null
  wwcc_number: string | null
  wwcc_expiry: string | null
  driver_licence: string | null
  vehicle_available: boolean | null
  vehicle_registration: string | null
  service_areas: string | null
  availability: string | null
  onboarding_status: string
  submitted_at: string | null
  approved_at: string | null
}

type Payment = {
  id: string
  amount_cents: number
  status: string
  pay_period_start: string | null
  pay_period_end: string | null
  payment_reference: string | null
  paid_at: string | null
}

const emptyForm = {
  legalName: '',
  preferredName: '',
  dateOfBirth: '',
  residentialAddress: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  abn: '',
  businessName: '',
  gstRegistered: false,
  bankName: '',
  bankAccountName: '',
  bsb: '',
  accountNumber: '',
  insuranceUrl: '',
  policeCheckNumber: '',
  policeCheckExpiry: '',
  wwccNumber: '',
  wwccExpiry: '',
  driverLicence: '',
  vehicleAvailable: false,
  vehicleRegistration: '',
  serviceAreas: '',
  availability: '',
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`
const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString() : 'Not set'
const maskAccount = (value: string) => value.length <= 3 ? value : `${'*'.repeat(Math.max(0, value.length - 3))}${value.slice(-3)}`

export default function CleanerOnboardingPage() {
  const [form, setForm] = useState(emptyForm)
  const [profile, setProfile] = useState<ContractorProfile | null>(null)
  const [templates, setTemplates] = useState<AgreementTemplate[]>([])
  const [agreements, setAgreements] = useState<AcceptedAgreement[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const acceptedTypes = useMemo(() => new Set(agreements.map((agreement) => agreement.agreement_type)), [agreements])
  const missingAgreements = templates.filter((template) => !acceptedTypes.has(template.type))
  const essentialsDone = Boolean(form.legalName && form.residentialAddress && form.emergencyContactName && form.emergencyContactPhone && form.abn && form.bankAccountName && form.bsb && form.accountNumber)
  const readyToSubmit = essentialsDone && missingAgreements.length === 0

  const load = async () => {
    setError('')
    try {
      const res = await fetch('/api/cleaner/onboarding')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Could not load onboarding.'); return }
      setProfile(data.profile || null)
      setTemplates(data.agreementTemplates || [])
      setAgreements(data.agreements || [])
      setPayments(data.payments || [])
      if (data.profile) {
        setForm({
          legalName: data.profile.legal_name || '',
          preferredName: data.profile.preferred_name || '',
          dateOfBirth: data.profile.date_of_birth || '',
          residentialAddress: data.profile.residential_address || '',
          emergencyContactName: data.profile.emergency_contact_name || '',
          emergencyContactPhone: data.profile.emergency_contact_phone || '',
          emergencyContactRelation: data.profile.emergency_contact_relation || '',
          abn: data.profile.abn || '',
          businessName: data.profile.business_name || '',
          gstRegistered: !!data.profile.gst_registered,
          bankName: data.profile.bank_name || '',
          bankAccountName: data.profile.bank_account_name || '',
          bsb: data.profile.bsb || '',
          accountNumber: data.profile.account_number || '',
          insuranceUrl: data.profile.insurance_url || '',
          policeCheckNumber: data.profile.police_check_number || '',
          policeCheckExpiry: data.profile.police_check_expiry || '',
          wwccNumber: data.profile.wwcc_number || '',
          wwccExpiry: data.profile.wwcc_expiry || '',
          driverLicence: data.profile.driver_licence || '',
          vehicleAvailable: !!data.profile.vehicle_available,
          vehicleRegistration: data.profile.vehicle_registration || '',
          serviceAreas: data.profile.service_areas || '',
          availability: data.profile.availability || '',
        })
      }
    } catch {
      setError('Network error while loading onboarding.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (key: keyof typeof emptyForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }))

  const save = async (submit = false) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/cleaner/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submit }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Save failed'); return }
      setProfile(data.profile)
      setMessage(submit ? 'Onboarding submitted for admin review.' : 'Onboarding details saved.')
    } catch {
      setError('Network error while saving.')
    } finally {
      setSaving(false)
    }
  }

  const acceptAgreement = async (agreementType: string) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/cleaner/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreementType, accepted: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Could not accept agreement'); return }
      setAgreements((current) => [data.agreement, ...current.filter((agreement) => agreement.agreement_type !== agreementType)])
      setMessage('Agreement accepted and timestamped.')
    } catch {
      setError('Network error while accepting agreement.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] text-[#0B3558]">Loading onboarding...</main>
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-[#0B3558]">
      <header className="border-b border-[#DCE5ED] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link href="/cleaner" className="inline-flex items-center gap-2 text-sm font-black text-[#1D7ED0]">
            <ArrowLeft className="h-4 w-4" />
            Cleaner workboard
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">Contractor onboarding</h1>
              <p className="mt-1 text-[#60798F]">ABN, payment details, emergency contact and required agreements.</p>
            </div>
            <StatusBadge status={profile?.onboarding_status || 'incomplete'} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_330px]">
        <section className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          {message && <Alert tone="success">{message}</Alert>}

          <Panel title="Identity and emergency" icon={UserRound}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Legal name" value={form.legalName} onChange={(value) => set('legalName', value)} required />
              <Field label="Preferred name" value={form.preferredName} onChange={(value) => set('preferredName', value)} />
              <Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => set('dateOfBirth', value)} />
              <Field label="Residential address" value={form.residentialAddress} onChange={(value) => set('residentialAddress', value)} required />
              <Field label="Emergency contact" value={form.emergencyContactName} onChange={(value) => set('emergencyContactName', value)} required />
              <Field label="Emergency phone" value={form.emergencyContactPhone} onChange={(value) => set('emergencyContactPhone', value)} required />
              <Field label="Relationship" value={form.emergencyContactRelation} onChange={(value) => set('emergencyContactRelation', value)} />
            </div>
          </Panel>

          <Panel title="ABN and payment details" icon={Banknote}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ABN" value={form.abn} onChange={(value) => set('abn', value)} required />
              <Field label="Business name" value={form.businessName} onChange={(value) => set('businessName', value)} />
              <label className="flex min-h-11 items-center gap-3 rounded-[8px] border border-[#DCE5ED] bg-[#F8FAFC] px-4 text-sm font-bold text-[#60798F]">
                <input type="checkbox" checked={form.gstRegistered} onChange={(event) => set('gstRegistered', event.target.checked)} className="h-4 w-4 accent-[#1D7ED0]" />
                GST registered
              </label>
              <Field label="Bank name" value={form.bankName} onChange={(value) => set('bankName', value)} />
              <Field label="Account name" value={form.bankAccountName} onChange={(value) => set('bankAccountName', value)} required />
              <Field label="BSB" value={form.bsb} onChange={(value) => set('bsb', value)} required />
              <Field label="Account number" value={form.accountNumber} onChange={(value) => set('accountNumber', value)} required />
            </div>
            {form.accountNumber && <p className="mt-3 text-xs font-bold text-[#60798F]">Saved account preview: {maskAccount(form.accountNumber)}</p>}
          </Panel>

          <Panel title="Compliance and availability" icon={ShieldCheck}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Insurance document URL" value={form.insuranceUrl} onChange={(value) => set('insuranceUrl', value)} />
              <Field label="Police check number" value={form.policeCheckNumber} onChange={(value) => set('policeCheckNumber', value)} />
              <Field label="Police check expiry" type="date" value={form.policeCheckExpiry} onChange={(value) => set('policeCheckExpiry', value)} />
              <Field label="WWCC number" value={form.wwccNumber} onChange={(value) => set('wwccNumber', value)} />
              <Field label="WWCC expiry" type="date" value={form.wwccExpiry} onChange={(value) => set('wwccExpiry', value)} />
              <Field label="Driver licence" value={form.driverLicence} onChange={(value) => set('driverLicence', value)} />
              <label className="flex min-h-11 items-center gap-3 rounded-[8px] border border-[#DCE5ED] bg-[#F8FAFC] px-4 text-sm font-bold text-[#60798F]">
                <input type="checkbox" checked={form.vehicleAvailable} onChange={(event) => set('vehicleAvailable', event.target.checked)} className="h-4 w-4 accent-[#1D7ED0]" />
                Vehicle available
              </label>
              <Field label="Vehicle registration" value={form.vehicleRegistration} onChange={(value) => set('vehicleRegistration', value)} />
              <TextArea label="Service areas" value={form.serviceAreas} onChange={(value) => set('serviceAreas', value)} />
              <TextArea label="Availability" value={form.availability} onChange={(value) => set('availability', value)} />
            </div>
          </Panel>

          <Panel title="Agreements" icon={FileText}>
            <div className="space-y-3">
              {templates.map((template) => {
                const accepted = acceptedTypes.has(template.type)
                return (
                  <article key={template.type} className="rounded-[8px] border border-[#DCE5ED] bg-[#F8FAFC] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-black">{template.title}</h3>
                        <p className="mt-1 text-sm text-[#60798F]">{template.summary}</p>
                      </div>
                      {accepted ? (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Accepted
                        </span>
                      ) : (
                        <button onClick={() => acceptAgreement(template.type)} disabled={saving} className="min-h-10 rounded-full bg-[#0B3558] px-4 text-sm font-black text-white disabled:opacity-50">Accept</button>
                      )}
                    </div>
                    <details className="mt-3 text-sm text-[#60798F]">
                      <summary className="cursor-pointer font-black text-[#1D7ED0]">Read agreement</summary>
                      <pre className="mt-3 whitespace-pre-wrap rounded-[8px] bg-white p-4 text-xs leading-5 text-[#0B3558]">{template.body}</pre>
                    </details>
                  </article>
                )
              })}
            </div>
          </Panel>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => save(false)} disabled={saving} className="min-h-12 rounded-xl border border-[#DCE5ED] bg-white px-5 text-sm font-black text-[#0B3558] disabled:opacity-50">Save draft</button>
            <button onClick={() => save(true)} disabled={saving || !readyToSubmit} className="min-h-12 rounded-xl bg-[#0B3558] px-5 text-sm font-black text-white disabled:opacity-50">Submit for admin review</button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[8px] border border-[#DCE5ED] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-black"><ClipboardCheck className="h-5 w-5 text-[#1D7ED0]" />Readiness</h2>
            <div className="mt-4 space-y-2">
              <CheckRow label="Required profile details" ok={essentialsDone} />
              <CheckRow label="Required agreements" ok={missingAgreements.length === 0} />
              <CheckRow label="Admin approved" ok={profile?.onboarding_status === 'approved'} />
            </div>
            <p className="mt-4 text-sm text-[#60798F]">Required details and agreements must be complete before admin can confidently assign and pay work.</p>
          </section>

          <section className="rounded-[8px] border border-[#DCE5ED] bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-black"><BriefcaseBusiness className="h-5 w-5 text-[#1D7ED0]" />Recent payments</h2>
            <div className="mt-4 space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-[#60798F]">No contractor payments recorded yet.</p>
              ) : payments.slice(0, 6).map((payment) => (
                <div key={payment.id} className="rounded-[8px] bg-[#F4F7FA] p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black">{money(payment.amount_cents)}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-black capitalize text-[#60798F]">{payment.status}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#60798F]">{dateLabel(payment.pay_period_start)} to {dateLabel(payment.pay_period_end)}</div>
                  {payment.payment_reference && <div className="mt-1 text-xs font-bold text-[#60798F]">Ref: {payment.payment_reference}</div>}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof UserRound; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[#DCE5ED] bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><Icon className="h-5 w-5 text-[#1D7ED0]" />{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-[#60798F]">{label}{required ? ' *' : ''}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-[8px] border border-[#DCE5ED] px-3 text-sm outline-none focus:border-[#1D7ED0]" />
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block sm:col-span-2">
      <span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-[#60798F]">{label}</span>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-[8px] border border-[#DCE5ED] px-3 py-2 text-sm outline-none focus:border-[#1D7ED0]" />
    </label>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = status === 'approved' ? 'bg-emerald-100 text-emerald-800' : status === 'submitted' ? 'bg-blue-100 text-blue-800' : status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
  return <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black capitalize ${style}`}><BadgeCheck className="h-4 w-4" />{status}</span>
}

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[#F4F7FA] px-3 py-2 text-sm">
      <span className="font-bold text-[#60798F]">{label}</span>
      <span className={`font-black ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>{ok ? 'Done' : 'Needed'}</span>
    </div>
  )
}

function Alert({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const style = tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return <div className={`rounded-[8px] border px-4 py-3 text-sm font-bold ${style}`}>{children}</div>
}
