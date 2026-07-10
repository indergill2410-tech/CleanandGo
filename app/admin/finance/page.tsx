'use client'
import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Banknote, CheckCircle2, CircleDollarSign, ClipboardCheck, Plus, ReceiptText, Search, XCircle } from 'lucide-react'

type Staff = {
  id: string
  name: string
  email: string
  role: string
  status: string
  contractor_profile: ContractorProfile | null
  agreements: { agreement_type: string; accepted_at: string }[]
}

type ContractorProfile = {
  onboarding_status: string
  legal_name: string | null
  abn: string | null
  gst_registered: boolean | null
  bank_account_name: string | null
  bsb: string | null
  account_number: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  admin_notes: string | null
}

type Payment = {
  id: string
  staff_id: string
  amount_cents: number
  status: string
  hours_worked: number | null
  rate_cents: number | null
  adjustment_cents: number
  payment_method: string
  payment_reference: string | null
  pay_period_start: string | null
  pay_period_end: string | null
  notes: string | null
  created_at: string
  approved_at: string | null
  paid_at: string | null
}

type Expense = {
  id: string
  expense_at: string
  category: string
  vendor: string | null
  amount_cents: number
  gst_included: boolean
  payment_method: string
  receipt_url: string | null
  staff_id: string | null
  notes: string | null
}

type Metrics = {
  pendingStaffPaymentCents: number
  paidStaffThisWeekCents: number
  paidStaffThisMonthCents: number
  expensesThisWeekCents: number
  expensesThisMonthCents: number
  incompleteOnboarding: number
}

const paymentDefaults = {
  staffId: '',
  payPeriodStart: '',
  payPeriodEnd: '',
  hoursWorked: '',
  rate: '',
  adjustment: '',
  amount: '',
  paymentMethod: 'bank_transfer',
  paymentReference: '',
  status: 'draft',
  notes: '',
}

const expenseDefaults = {
  expenseAt: '',
  category: 'supplies',
  vendor: '',
  amount: '',
  gstIncluded: false,
  paymentMethod: 'card',
  receiptUrl: '',
  staffId: '',
  notes: '',
}

const money = (cents?: number | null) => `$${((cents || 0) / 100).toFixed(2)}`
const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString() : 'Not set'
const dateTimeLabel = (value?: string | null) => value ? new Date(value).toLocaleString() : 'Not set'

export default function AdminFinancePage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [query, setQuery] = useState('')
  const [paymentForm, setPaymentForm] = useState(paymentDefaults)
  const [expenseForm, setExpenseForm] = useState(expenseDefaults)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const staffName = useMemo(() => new Map(staff.map((member) => [member.id, member.name])), [staff])
  const cleaners = staff.filter((member) => member.role === 'cleaner')
  const filteredStaff = cleaners.filter((member) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [member.name, member.email, member.contractor_profile?.abn, member.contractor_profile?.legal_name].filter(Boolean).some((value) => String(value).toLowerCase().includes(q))
  })

  const load = async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/finance')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Could not load finance.'); return }
      setStaff(data.staff || [])
      setPayments(data.payments || [])
      setExpenses(data.expenses || [])
      setMetrics(data.metrics || null)
    } catch {
      setError('Network error while loading finance.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy('payment')
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'payment', ...paymentForm }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Payment save failed'); return }
      setPaymentForm(paymentDefaults)
      setMessage('Staff payment saved with timestamps.')
      await load()
    } catch {
      setError('Network error while saving payment.')
    } finally {
      setBusy('')
    }
  }

  const createExpense = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy('expense')
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/admin/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'expense', ...expenseForm }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Expense save failed'); return }
      setExpenseForm(expenseDefaults)
      setMessage('Business expense saved.')
      await load()
    } catch {
      setError('Network error while saving expense.')
    } finally {
      setBusy('')
    }
  }

  const paymentAction = async (id: string, action: 'approve' | 'mark_paid' | 'cancel') => {
    const paymentReference = action === 'mark_paid' ? window.prompt('Payment reference, optional') || '' : ''
    setBusy(id)
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/admin/finance/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, paymentReference }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Payment update failed'); return }
      setMessage(action === 'mark_paid' ? 'Payment marked paid with timestamp.' : 'Payment updated.')
      await load()
    } catch {
      setError('Network error while updating payment.')
    } finally {
      setBusy('')
    }
  }

  const setContractorStatus = async (staffId: string, status: 'approved' | 'blocked') => {
    const adminNotes = window.prompt(status === 'approved' ? 'Approval note, optional' : 'Why is onboarding blocked?') || ''
    setBusy(staffId)
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/admin/contractors/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Onboarding update failed'); return }
      setMessage(status === 'approved' ? 'Contractor onboarding approved.' : 'Contractor onboarding blocked.')
      await load()
    } catch {
      setError('Network error while updating contractor.')
    } finally {
      setBusy('')
    }
  }

  if (loading) {
    return <section className="flex min-h-[70vh] items-center justify-center px-4 text-[#0B3558]">Loading finance...</section>
  }

  return (
    <section className="px-4 py-5 text-[#0B3558] sm:px-6 lg:px-8">
      <header className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D7ED0]">Finance</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Staff pay, business spending, and onboarding checks</h1>
          <p className="mt-2 text-sm font-bold text-[#60798F]">Approve cleaner payments, record expenses, and keep contractor details ready before work is assigned.</p>
        </div>
      </header>

      <div className="py-5">
        {error && <Alert tone="error">{error}</Alert>}
        {message && <Alert tone="success">{message}</Alert>}

        <section className="mb-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Metric label="Pending staff pay" value={money(metrics?.pendingStaffPaymentCents)} icon={CircleDollarSign} />
          <Metric label="Paid this week" value={money(metrics?.paidStaffThisWeekCents)} icon={Banknote} />
          <Metric label="Paid this month" value={money(metrics?.paidStaffThisMonthCents)} icon={Banknote} />
          <Metric label="Expenses week" value={money(metrics?.expensesThisWeekCents)} icon={ReceiptText} />
          <Metric label="Expenses month" value={money(metrics?.expensesThisMonthCents)} icon={ReceiptText} />
          <Metric label="Onboarding open" value={String(metrics?.incompleteOnboarding || 0)} icon={ClipboardCheck} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <Panel title="Contractor readiness">
              <label className="mb-4 flex min-h-11 max-w-md items-center gap-2 rounded-full border border-[#B9CFDE] bg-[#F8FAFC] px-4">
                <Search className="h-4 w-4 text-[#60798F]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cleaner, ABN, email" className="w-full bg-transparent text-sm outline-none" />
              </label>
              <div className="space-y-3">
                {filteredStaff.map((member) => {
                  const profile = member.contractor_profile
                  const agreementsOk = member.agreements.length >= 5
                  const bankOk = Boolean(profile?.bsb && profile?.account_number && profile?.bank_account_name)
                  const abnOk = Boolean(profile?.abn)
                  return (
                    <article key={member.id} className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FAFC] p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-black">{member.name}</h3>
                            <Status status={profile?.onboarding_status || 'missing'} />
                          </div>
                          <div className="mt-1 text-sm text-[#60798F]">{member.email}</div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs font-black">
                            <Chip ok={abnOk} label={profile?.abn ? `ABN ${profile.abn}` : 'ABN missing'} />
                            <Chip ok={bankOk} label={bankOk ? 'Bank ready' : 'Bank missing'} />
                            <Chip ok={agreementsOk} label={`${member.agreements.length}/5 agreements`} />
                            <Chip ok={Boolean(profile?.emergency_contact_name && profile?.emergency_contact_phone)} label="Emergency contact" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setContractorStatus(member.id, 'approved')} disabled={busy === member.id || !profile} className="inline-flex min-h-10 items-center gap-1 rounded-full bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-50">
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </button>
                          <button onClick={() => setContractorStatus(member.id, 'blocked')} disabled={busy === member.id || !profile} className="inline-flex min-h-10 items-center gap-1 rounded-full border border-red-200 px-4 text-sm font-black text-red-600 disabled:opacity-50">
                            <XCircle className="h-4 w-4" />
                            Block
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </Panel>

            <Panel title="Staff payments">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.12em] text-[#60798F]">
                    <tr>
                      <th className="py-2">Cleaner</th>
                      <th className="py-2">Period</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Timestamps</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5ED]">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="py-3 font-black">{staffName.get(payment.staff_id) || 'Cleaner'}</td>
                        <td className="py-3 text-[#60798F]">{dateLabel(payment.pay_period_start)} to {dateLabel(payment.pay_period_end)}</td>
                        <td className="py-3 font-black">{money(payment.amount_cents)}</td>
                        <td className="py-3"><Status status={payment.status} /></td>
                        <td className="py-3 text-xs text-[#60798F]">
                          <div>Created: {dateTimeLabel(payment.created_at)}</div>
                          <div>Approved: {dateTimeLabel(payment.approved_at)}</div>
                          <div>Paid: {dateTimeLabel(payment.paid_at)}</div>
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            {payment.status === 'draft' && <SmallButton onClick={() => paymentAction(payment.id, 'approve')} disabled={busy === payment.id}>Approve</SmallButton>}
                            {payment.status !== 'paid' && payment.status !== 'cancelled' && <SmallButton onClick={() => paymentAction(payment.id, 'mark_paid')} disabled={busy === payment.id}>Paid</SmallButton>}
                            {payment.status !== 'cancelled' && payment.status !== 'paid' && <SmallButton onClick={() => paymentAction(payment.id, 'cancel')} disabled={busy === payment.id}>Cancel</SmallButton>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length === 0 && <div className="rounded-[8px] bg-[#EAF6FC] p-6 text-center text-sm text-[#60798F]">No staff payments recorded yet.</div>}
              </div>
            </Panel>

            <Panel title="Business expenses">
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <article key={expense.id} className="flex flex-col gap-3 rounded-[8px] border border-[#B9CFDE] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-black">{expense.vendor || expense.category}</div>
                      <div className="mt-1 text-sm text-[#60798F]">{dateTimeLabel(expense.expense_at)} · {expense.category} · {expense.payment_method}</div>
                      {expense.notes && <div className="mt-1 text-sm text-[#60798F]">{expense.notes}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black">{money(expense.amount_cents)}</div>
                      <div className="text-xs font-bold text-[#60798F]">{expense.gst_included ? 'GST included' : 'GST not marked'}</div>
                    </div>
                  </article>
                ))}
                {expenses.length === 0 && <div className="rounded-[8px] bg-[#EAF6FC] p-6 text-center text-sm text-[#60798F]">No expenses recorded yet.</div>}
              </div>
            </Panel>
          </section>

          <aside className="space-y-6">
            <Panel title="Add staff payment">
              <form onSubmit={createPayment} className="space-y-3">
                <Select label="Cleaner" value={paymentForm.staffId} onChange={(value) => setPaymentForm((current) => ({ ...current, staffId: value }))} required>
                  <option value="">Choose cleaner</option>
                  {cleaners.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Period start" type="date" value={paymentForm.payPeriodStart} onChange={(value) => setPaymentForm((current) => ({ ...current, payPeriodStart: value }))} />
                  <Field label="Period end" type="date" value={paymentForm.payPeriodEnd} onChange={(value) => setPaymentForm((current) => ({ ...current, payPeriodEnd: value }))} />
                  <Field label="Hours" value={paymentForm.hoursWorked} onChange={(value) => setPaymentForm((current) => ({ ...current, hoursWorked: value }))} />
                  <Field label="Rate $" value={paymentForm.rate} onChange={(value) => setPaymentForm((current) => ({ ...current, rate: value }))} />
                  <Field label="Adjustment $" value={paymentForm.adjustment} onChange={(value) => setPaymentForm((current) => ({ ...current, adjustment: value }))} />
                  <Field label="Total override $" value={paymentForm.amount} onChange={(value) => setPaymentForm((current) => ({ ...current, amount: value }))} />
                </div>
                <Select label="Method" value={paymentForm.paymentMethod} onChange={(value) => setPaymentForm((current) => ({ ...current, paymentMethod: value }))}>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </Select>
                <Select label="Initial status" value={paymentForm.status} onChange={(value) => setPaymentForm((current) => ({ ...current, status: value }))}>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </Select>
                <Field label="Payment reference" value={paymentForm.paymentReference} onChange={(value) => setPaymentForm((current) => ({ ...current, paymentReference: value }))} />
                <TextArea label="Notes" value={paymentForm.notes} onChange={(value) => setPaymentForm((current) => ({ ...current, notes: value }))} />
                <button type="submit" disabled={busy === 'payment'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B3558] px-5 text-sm font-black text-white disabled:opacity-50">
                  <Plus className="h-4 w-4" />
                  Save payment
                </button>
              </form>
            </Panel>

            <Panel title="Add business expense">
              <form onSubmit={createExpense} className="space-y-3">
                <Field label="Expense date/time" type="datetime-local" value={expenseForm.expenseAt} onChange={(value) => setExpenseForm((current) => ({ ...current, expenseAt: value }))} />
                <Select label="Category" value={expenseForm.category} onChange={(value) => setExpenseForm((current) => ({ ...current, category: value }))}>
                  <option value="fuel">Fuel</option>
                  <option value="supplies">Supplies</option>
                  <option value="equipment">Equipment</option>
                  <option value="ads">Ads</option>
                  <option value="contractor">Contractor</option>
                  <option value="software">Software</option>
                  <option value="insurance">Insurance</option>
                  <option value="refunds">Refunds</option>
                  <option value="other">Other</option>
                </Select>
                <Field label="Vendor" value={expenseForm.vendor} onChange={(value) => setExpenseForm((current) => ({ ...current, vendor: value }))} />
                <Field label="Amount $" value={expenseForm.amount} onChange={(value) => setExpenseForm((current) => ({ ...current, amount: value }))} required />
                <label className="flex min-h-11 items-center gap-3 rounded-[8px] border border-[#B9CFDE] bg-[#F8FAFC] px-4 text-sm font-bold text-[#60798F]">
                  <input type="checkbox" checked={expenseForm.gstIncluded} onChange={(event) => setExpenseForm((current) => ({ ...current, gstIncluded: event.target.checked }))} className="h-4 w-4 accent-[#1D7ED0]" />
                  GST included
                </label>
                <Select label="Method" value={expenseForm.paymentMethod} onChange={(value) => setExpenseForm((current) => ({ ...current, paymentMethod: value }))}>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </Select>
                <Field label="Receipt URL" value={expenseForm.receiptUrl} onChange={(value) => setExpenseForm((current) => ({ ...current, receiptUrl: value }))} />
                <Select label="Linked cleaner" value={expenseForm.staffId} onChange={(value) => setExpenseForm((current) => ({ ...current, staffId: value }))}>
                  <option value="">None</option>
                  {cleaners.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </Select>
                <TextArea label="Notes" value={expenseForm.notes} onChange={(value) => setExpenseForm((current) => ({ ...current, notes: value }))} />
                <button type="submit" disabled={busy === 'expense'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B3558] px-5 text-sm font-black text-white disabled:opacity-50">
                  <Plus className="h-4 w-4" />
                  Save expense
                </button>
              </form>
            </Panel>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-black">{title}</h2>
      {children}
    </section>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CircleDollarSign }) {
  return (
    <section className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-4 shadow-sm">
      <Icon className="h-5 w-5 text-[#1D7ED0]" />
      <div className="mt-3 text-xl font-black">{value}</div>
      <div className="text-xs font-bold text-[#60798F]">{label}</div>
    </section>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-[#60798F]">{label}{required ? ' *' : ''}</span>
      <input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-[8px] border border-[#B9CFDE] px-3 text-sm outline-none focus:border-[#1D7ED0]" />
    </label>
  )
}

function Select({ label, value, onChange, required = false, children }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-[#60798F]">{label}{required ? ' *' : ''}</span>
      <select value={value} required={required} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-[8px] border border-[#B9CFDE] px-3 text-sm outline-none focus:border-[#1D7ED0]">
        {children}
      </select>
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-[#60798F]">{label}</span>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-[8px] border border-[#B9CFDE] px-3 py-2 text-sm outline-none focus:border-[#1D7ED0]" />
    </label>
  )
}

function Status({ status }: { status: string }) {
  const style = status === 'paid' || status === 'approved' ? 'bg-emerald-100 text-emerald-800' : status === 'submitted' ? 'bg-blue-100 text-blue-800' : status === 'cancelled' || status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
  return <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black capitalize ${style}`}><BadgeCheck className="h-3.5 w-3.5" />{status.replace('_', ' ')}</span>
}

function Chip({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`rounded-full px-2 py-1 ${ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{label}</span>
}

function SmallButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button onClick={onClick} disabled={disabled} className="rounded-full border border-[#B9CFDE] px-3 py-1.5 text-xs font-black text-[#0B3558] disabled:opacity-50">{children}</button>
}

function Alert({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  const style = tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return <div className={`mb-4 rounded-[8px] border px-4 py-3 text-sm font-bold ${style}`}>{children}</div>
}


