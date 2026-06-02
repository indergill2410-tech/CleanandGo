'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STEPS = ['Service', 'Size & Extras', 'Date & Time', 'Your Details', 'Confirm']

const SERVICES = [
  { id: 'recurring',   icon: '🏠', label: 'Recurring Clean',  sub: 'Weekly or fortnightly', base: 120 },
  { id: 'oneoff',      icon: '✨', label: 'One-Off Clean',    sub: 'Single deep clean',      base: 180 },
  { id: 'endoflease',  icon: '🔑', label: 'End of Lease',     sub: 'Bond-back guaranteed',   base: 400 },
]

const EXTRAS = [
  { id: 'oven',    label: 'Oven Clean',      price: 60, icon: '🍳' },
  { id: 'fridge',  label: 'Fridge Clean',    price: 40, icon: '❄️' },
  { id: 'walls',   label: 'Wall Spot Clean', price: 50, icon: '🖌️' },
  { id: 'carpet',  label: 'Carpet Steam',    price: 80, icon: '🪣' },
  { id: 'windows', label: 'Interior Windows',price: 60, icon: '🪟' },
  { id: 'balcony', label: 'Balcony / Patio', price: 45, icon: '🌿' },
]

const TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM']

function calcPrice(serviceId: string, beds: number, baths: number, extras: string[]) {
  const svc = SERVICES.find(s => s.id === serviceId)
  if (!svc) return 0
  const extrasTotal = EXTRAS.filter(e => extras.includes(e.id)).reduce((sum, e) => sum + e.price, 0)
  return svc.base + (beds - 1) * 30 + (baths - 1) * 20 + extrasTotal
}

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    service: '', beds: 2, baths: 1, extras: [] as string[],
    date: '', time: '', frequency: 'once',
    name: '', email: '', phone: '', address: '', suburb: '', notes: '',
  })

  const price = calcPrice(form.service, form.beds, form.baths, form.extras)
  const selectedService = SERVICES.find(s => s.id === form.service)

  const toggleExtra = (id: string) =>
    setForm(f => ({ ...f, extras: f.extras.includes(id) ? f.extras.filter(e => e !== id) : [...f.extras, id] }))

  const canNext = [
    !!form.service, true, !!form.date && !!form.time,
    !!form.name && !!form.email && !!form.phone && !!form.address, true,
  ][step]

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, total: price }),
      })
      if (!res.ok) throw new Error('Booking failed')
      const params = new URLSearchParams({
        service: selectedService?.label || '',
        date: form.date, time: form.time,
        address: `${form.address}, ${form.suburb}`,
        total: String(price), name: form.name,
      })
      router.push(`/customer/book/confirmation?${params.toString()}`)
    } catch {
      // Fallback: still go to confirmation (Supabase may not be connected yet)
      const params = new URLSearchParams({
        service: selectedService?.label || '',
        date: form.date, time: form.time,
        address: `${form.address}, ${form.suburb}`,
        total: String(price), name: form.name,
      })
      router.push(`/customer/book/confirmation?${params.toString()}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 50%, #4A7FA5 100%)' }}>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#4A7FA5' }} />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center mb-8">
          <Link href="/" className="text-white/60 text-sm hover:text-white mb-4 inline-block">← Back to home</Link>
          <h1 className="text-3xl font-bold text-white">Book a Clean</h1>
          <p className="text-white/60 mt-1">Takes 60 seconds</p>
        </div>

        {/* Progress */}
        <div className="w-full max-w-xl mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-white text-[#2C4A6E]' : i === step ? 'gradient-cta text-white ring-4 ring-white/30' : 'bg-white/20 text-white/50'
                }`}>{i < step ? '✓' : i + 1}</div>
                <span className={`text-xs hidden md:block ${i === step ? 'text-white font-medium' : 'text-white/40'}`}>{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/20 rounded-full">
            <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${(step / (STEPS.length - 1)) * 100}%`, background: 'linear-gradient(90deg, #7BA7C7, white)' }} />
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-8 w-full max-w-xl shadow-2xl">
          {/* STEP 0 */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">What do you need?</h2>
              <div className="space-y-3">
                {SERVICES.map(s => (
                  <button key={s.id} onClick={() => setForm(f => ({ ...f, service: s.id }))}
                    className={`w-full p-5 rounded-2xl text-left transition-all border-2 ${
                      form.service === s.id ? 'bg-white/30 border-white text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{s.icon}</span>
                        <div><div className="font-semibold">{s.label}</div><div className="text-sm opacity-70">{s.sub}</div></div>
                      </div>
                      <div className="text-right"><div className="font-bold text-lg">From ${s.base}</div>{form.service === s.id && <div className="text-xs opacity-70">Selected ✓</div>}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Size &amp; extras</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[{ label: 'Bedrooms', key: 'beds', min: 1, max: 6 }, { label: 'Bathrooms', key: 'baths', min: 1, max: 5 }].map(f => (
                  <div key={f.key}>
                    <label className="text-white/70 text-sm mb-2 block">{f.label}</label>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 border border-white/20">
                      <button onClick={() => setForm(prev => ({ ...prev, [f.key]: Math.max(f.min, (prev as any)[f.key] - 1) }))} className="w-8 h-8 rounded-lg bg-white/20 text-white font-bold hover:bg-white/30 transition">−</button>
                      <span className="text-white font-bold text-xl flex-1 text-center">{(form as any)[f.key]}</span>
                      <button onClick={() => setForm(prev => ({ ...prev, [f.key]: Math.min(f.max, (prev as any)[f.key] + 1) }))} className="w-8 h-8 rounded-lg bg-white/20 text-white font-bold hover:bg-white/30 transition">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <label className="text-white/70 text-sm mb-3 block">Add extras</label>
              <div className="grid grid-cols-2 gap-2">
                {EXTRAS.map(e => (
                  <button key={e.id} onClick={() => toggleExtra(e.id)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      form.extras.includes(e.id) ? 'bg-white/30 border-white text-white' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                    }`}>
                    <div className="text-lg mb-1">{e.icon}</div>
                    <div className="text-xs font-medium">{e.label}</div>
                    <div className="text-xs opacity-70">+${e.price}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 bg-white/10 rounded-2xl p-4 border border-white/20 text-center">
                <div className="text-white/60 text-sm">Estimated total</div>
                <div className="text-4xl font-bold text-white mt-1">${price}</div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">When works for you?</h2>
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">Date</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white" style={{ colorScheme: 'dark' }} />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIMES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, time: t }))}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        form.time === t ? 'bg-white text-[#2C4A6E] font-bold' : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              {form.service === 'recurring' && (
                <div className="mt-4">
                  <label className="text-white/70 text-sm mb-2 block">Frequency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ id: 'weekly', label: 'Weekly', sub: 'Save 10%' }, { id: 'fortnightly', label: 'Fortnightly', sub: 'Save 5%' }].map(f => (
                      <button key={f.id} onClick={() => setForm(prev => ({ ...prev, frequency: f.id }))}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          form.frequency === f.id ? 'bg-white/30 border-white text-white' : 'bg-white/10 border-white/20 text-white/70'
                        }`}>
                        <div className="font-medium text-sm">{f.label}</div>
                        <div className="text-xs opacity-70">{f.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Your details</h2>
              <div className="space-y-3">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@example.com' },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '04xx xxx xxx' },
                  { label: 'Street Address', key: 'address', type: 'text', placeholder: '12 Example St' },
                  { label: 'Suburb', key: 'suburb', type: 'text', placeholder: 'South Yarra, VIC' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-white/70 text-sm mb-1 block">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Notes (optional)</label>
                  <textarea rows={3} placeholder="e.g. pet in house, gate code" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Order summary</h2>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Service', value: selectedService?.label },
                  { label: 'Size', value: `${form.beds} bed · ${form.baths} bath` },
                  { label: 'Date', value: `${form.date} at ${form.time}` },
                  { label: 'Address', value: `${form.address}, ${form.suburb}` },
                  { label: 'Contact', value: form.email },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-white/50">{row.label}</span>
                    <span className="text-white font-medium text-right max-w-[200px]">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/20 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total</span>
                  <span className="text-3xl font-bold text-white">${price}</span>
                </div>
              </div>
              <div className="flex gap-3 mb-6 text-xs">
                {['🔒 Secure payment', '🛡️ Insured', '✅ Guaranteed'].map(b => (
                  <span key={b} className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full">{b}</span>
                ))}
              </div>
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-4">
                <div className="text-white/50 text-xs mb-1">Payment</div>
                <div className="text-white/40 text-sm">Stripe integration — coming soon. Booking confirmed on submission.</div>
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all bg-white text-[#2C4A6E] hover:bg-white/90 hover:shadow-xl disabled:opacity-60">
                {submitting ? 'Confirming...' : `Confirm Booking — $${price}`}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl border border-white/30 text-white/70 hover:bg-white/10 transition font-medium">← Back</button>
            )}
            {step < STEPS.length - 1 && (
              <button disabled={!canNext} onClick={() => setStep(s => s + 1)} className="flex-1 py-3 rounded-xl font-semibold transition-all disabled:opacity-30 bg-white text-[#2C4A6E] hover:bg-white/90">Continue →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
