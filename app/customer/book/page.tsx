'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STEPS = ['Service', 'Size & Extras', 'Date & Time', 'Your Details', 'Confirm']

const SERVICES = [
  { id: 'recurring',  icon: '🏠', label: 'Recurring Clean',  sub: 'Weekly or fortnightly regular clean' },
  { id: 'oneoff',     icon: '✨', label: 'One-Off Clean',    sub: 'Single deep clean, any size' },
  { id: 'endoflease', icon: '🔑', label: 'End of Lease',     sub: 'Move-out clean, bond-back focused' },
]

const EXTRAS = [
  { id: 'oven',    label: 'Oven Clean',       icon: '🍳' },
  { id: 'fridge',  label: 'Fridge Clean',     icon: '❄️' },
  { id: 'walls',   label: 'Wall Spot Clean',  icon: '🖌️' },
  { id: 'carpet',  label: 'Carpet Steam',     icon: '🪣' },
  { id: 'windows', label: 'Interior Windows', icon: '🪟' },
  { id: 'balcony', label: 'Balcony / Patio',  icon: '🌿' },
]

const TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM']

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    service: '', beds: 2, baths: 1, extras: [] as string[],
    date: '', time: '', frequency: 'once',
    name: '', email: '', phone: '', address: '', suburb: '', notes: '',
  })

  const selectedService = SERVICES.find(s => s.id === form.service)

  const toggleExtra = (id: string) =>
    setForm(f => ({ ...f, extras: f.extras.includes(id) ? f.extras.filter(e => e !== id) : [...f.extras, id] }))

  const canNext = [
    !!form.service,
    true,
    !!form.date && !!form.time,
    !!form.name && !!form.email && !!form.phone && !!form.address,
    true,
  ][step]

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      const bookingId = data.booking?.id || `REQ-${Date.now().toString().slice(-6)}`
      const params = new URLSearchParams({
        service: selectedService?.label || '',
        date: form.date,
        time: form.time,
        address: `${form.address}, ${form.suburb}`,
        name: form.name,
        bookingId,
      })
      router.push(`/customer/book/confirmation?${params.toString()}`)
    } catch {
      const params = new URLSearchParams({
        service: selectedService?.label || '',
        date: form.date, time: form.time,
        address: `${form.address}, ${form.suburb}`,
        name: form.name,
        bookingId: `REQ-${Date.now().toString().slice(-6)}`,
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
          <h1 className="text-3xl font-bold text-white">Request a Quote</h1>
          <p className="text-white/60 mt-1">Tell us about your job — we'll send a price within the hour</p>
        </div>

        {/* Progress */}
        <div className="w-full max-w-xl mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-white text-[#2C4A6E]' : i === step ? 'bg-white text-[#2C4A6E] ring-4 ring-white/30' : 'bg-white/20 text-white/50'
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

          {/* STEP 0 — Service */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">What do you need?</h2>
              <p className="text-white/50 text-sm mb-6">We'll give you a custom quote based on your job.</p>
              <div className="space-y-3">
                {SERVICES.map(s => (
                  <button key={s.id} onClick={() => setForm(f => ({ ...f, service: s.id }))}
                    className={`w-full p-5 rounded-2xl text-left transition-all border-2 ${
                      form.service === s.id
                        ? 'bg-white/30 border-white text-white'
                        : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                    }`}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{s.icon}</span>
                      <div>
                        <div className="font-semibold">{s.label}</div>
                        <div className="text-sm opacity-70">{s.sub}</div>
                      </div>
                      {form.service === s.id && (
                        <div className="ml-auto text-white/80 text-sm font-medium">Selected ✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {/* No pricing hint */}
              <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">💬</span>
                <p className="text-white/50 text-sm leading-relaxed">No prices shown here — every home is different. We review your job and send a tailored quote, usually within 60 minutes.</p>
              </div>
            </div>
          )}

          {/* STEP 1 — Size & Extras */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Size &amp; extras</h2>
              <p className="text-white/50 text-sm mb-6">This helps us quote accurately.</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[{ label: 'Bedrooms', key: 'beds', min: 1, max: 8 }, { label: 'Bathrooms', key: 'baths', min: 1, max: 6 }].map(f => (
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
              <label className="text-white/70 text-sm mb-3 block">Any extras? (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                {EXTRAS.map(e => (
                  <button key={e.id} onClick={() => toggleExtra(e.id)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      form.extras.includes(e.id)
                        ? 'bg-white/30 border-white text-white'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                    }`}>
                    <div className="text-lg mb-1">{e.icon}</div>
                    <div className="text-xs font-medium">{e.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Preferred date &amp; time</h2>
              <p className="text-white/50 text-sm mb-6">We'll confirm availability when we send your quote.</p>
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">Preferred date</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white" style={{ colorScheme: 'dark' }} />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Preferred start time</label>
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
                    {[{ id: 'weekly', label: 'Weekly' }, { id: 'fortnightly', label: 'Fortnightly' }].map(f => (
                      <button key={f.id} onClick={() => setForm(prev => ({ ...prev, frequency: f.id }))}
                        className={`p-3 rounded-xl border transition-all ${
                          form.frequency === f.id ? 'bg-white/30 border-white text-white' : 'bg-white/10 border-white/20 text-white/70'
                        }`}>
                        <div className="font-medium text-sm">{f.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Details */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your details</h2>
              <p className="text-white/50 text-sm mb-6">We'll send your quote to your email and phone.</p>
              <div className="space-y-3">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@example.com' },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '04xx xxx xxx' },
                  { label: 'Street Address', key: 'address', type: 'text', placeholder: '12 Example St' },
                  { label: 'Suburb', key: 'suburb', type: 'text', placeholder: 'Suburb' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-white/70 text-sm mb-1 block">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Notes (optional)</label>
                  <textarea rows={3} placeholder="e.g. pet in house, gate code, specific areas to focus on" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Confirm */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Review your request</h2>
              <p className="text-white/50 text-sm mb-6">Once submitted, we'll review and send your quote within 60 minutes.</p>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Service', value: selectedService?.label },
                  { label: 'Size', value: `${form.beds} bed · ${form.baths} bath` },
                  form.extras.length > 0 ? { label: 'Extras', value: form.extras.map(e => EXTRAS.find(x => x.id === e)?.label).join(', ') } : null,
                  { label: 'Preferred Date', value: `${form.date} at ${form.time}` },
                  { label: 'Address', value: `${form.address}, ${form.suburb}` },
                  { label: 'Contact', value: `${form.name} · ${form.email}` },
                ].filter(Boolean).map((row: any) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-white/50">{row.label}</span>
                    <span className="text-white font-medium text-right max-w-[220px]">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* What happens next */}
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-6">
                <div className="text-white/80 font-semibold text-sm mb-3">What happens next</div>
                <div className="space-y-2">
                  {[
                    { icon: '📋', text: 'We review your job details' },
                    { icon: '💰', text: 'Admin sends you a custom quote via email & app' },
                    { icon: '✅', text: 'You accept or ask questions' },
                    { icon: '🧹', text: 'Job confirmed and cleaner assigned' },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-white/60 text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all bg-white text-[#2C4A6E] hover:bg-white/90 hover:shadow-xl disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Quote Request →'}
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
