'use client'
import { useState } from 'react'
import Link from 'next/link'
import AddressAutocomplete, { type AddressParts } from '@/components/AddressAutocomplete'
import PhotoUpload from '@/components/PhotoUpload'
import { createClient } from '@/lib/supabase/client'

type PropertyType = 'home' | 'office'
type Frequency = 'weekly' | 'fortnightly' | 'monthly'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function PlanRequestPage() {
  const [propertyType, setPropertyType] = useState<PropertyType>('home')
  const [frequency, setFrequency] = useState<Frequency>('fortnightly')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', suburb: '', state: '', postcode: '',
    bedrooms: 2, bathrooms: 1, officeSqm: 100,
    preferredDay: 'Tuesday', preferredTime: '09:00', notes: '', password: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))
  const fillAddress = (p: AddressParts) =>
    setForm(f => ({ ...f, address: p.line1 || f.address, suburb: p.suburb || f.suburb, state: p.state || f.state, postcode: p.postcode || f.postcode }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      // Optional account: standard, verified sign-up (sends a confirmation email).
      if (form.password && form.password.length >= 8) {
        await createClient().auth.signUp({
          email: form.email,
          password: form.password,
          options: { emailRedirectTo: `${window.location.origin}/account`, data: { full_name: form.name } },
        }).catch(() => {})
      }
      const { password, ...rest } = form
      void password
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyType, frequency, ...rest, photos }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      setDone(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #172434 0%, #172434 100%)' }}>
        <div className="glass-strong rounded-3xl p-10 max-w-md text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-white mb-3">Plan request received</h1>
          <p className="text-white/70 text-sm mb-6">
            Thanks {form.name.split(' ')[0]}! We&apos;re reviewing your {frequency} {propertyType} plan and will email your tailored price shortly — usually within 60 minutes during business hours.
            {form.password ? ' We’ve also emailed you a link to confirm your account.' : ''}
          </p>
          <Link href="/" className="btn-primary text-sm px-8 py-3.5">Back to home</Link>
        </div>
      </div>
    )
  }

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #172434 0%, #172434 50%, #2F7D6B 100%)' }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-white/60 text-sm hover:text-white mb-4 inline-block">← Back to home</Link>
          <h1 className="text-3xl font-bold text-white">Start a recurring plan</h1>
          <p className="text-white/60 text-sm mt-2">Same trusted cleaner every visit, with a guaranteed backup so you&apos;re never left hanging.</p>
        </div>

        <form onSubmit={submit} className="glass-strong rounded-3xl p-7 space-y-5">
          {/* Property type */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">Property type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['home', 'office'] as PropertyType[]).map(t => (
                <button key={t} type="button" onClick={() => setPropertyType(t)}
                  className={`py-3 rounded-xl text-sm font-semibold capitalize transition ${propertyType === t ? 'bg-white text-[#172434]' : 'bg-white/10 text-white/70'}`}>
                  {t === 'home' ? '🏠 Home' : '🏢 Office'}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">How often?</label>
            <div className="grid grid-cols-3 gap-3">
              {(['weekly', 'fortnightly', 'monthly'] as Frequency[]).map(f => (
                <button key={f} type="button" onClick={() => setFrequency(f)}
                  className={`py-3 rounded-xl text-xs font-semibold capitalize transition ${frequency === f ? 'bg-white text-[#172434]' : 'bg-white/10 text-white/70'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          {propertyType === 'home' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Bedrooms</label>
                <input type="number" min={1} max={10} value={form.bedrooms} onChange={e => set('bedrooms', +e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block">Bathrooms</label>
                <input type="number" min={1} max={8} value={form.bathrooms} onChange={e => set('bathrooms', +e.target.value)} className={inputCls} />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-white/70 text-sm mb-1 block">Approx. floor area (m²)</label>
              <input type="number" min={10} value={form.officeSqm} onChange={e => set('officeSqm', +e.target.value)} className={inputCls} />
            </div>
          )}

          {/* Preferred day/time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Preferred day</label>
              <select value={form.preferredDay} onChange={e => set('preferredDay', e.target.value)} className={inputCls}>
                {DAYS.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Preferred time</label>
              <input type="time" value={form.preferredTime} onChange={e => set('preferredTime', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid gap-3">
            <input placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required className={inputCls} />
            <input type="email" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} required className={inputCls} />
            <input placeholder="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} required className={inputCls} />
            <AddressAutocomplete
              value={form.address}
              onChange={v => set('address', v)}
              onSelect={fillAddress}
              placeholder="Street address"
              className={inputCls}
            />
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Suburb" value={form.suburb} onChange={e => set('suburb', e.target.value)} required className={inputCls} />
              <input placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} className={inputCls} />
              <input placeholder="Postcode" value={form.postcode} onChange={e => set('postcode', e.target.value)} className={inputCls} />
            </div>
            <textarea placeholder="Anything we should know? (optional)" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={inputCls} />
          </div>

          {/* Optional account */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <label className="text-white/80 text-sm font-medium mb-1 block">Create an account <span className="text-white/40">(optional)</span></label>
            <p className="text-white/40 text-xs mb-3">Set a password to manage your plan, payments and bookings online.</p>
            <input type="password" placeholder="Choose a password (min 8 characters)" value={form.password} onChange={e => set('password', e.target.value)} minLength={8} autoComplete="new-password" className={inputCls} />
          </div>

          {/* Optional photos */}
          <PhotoUpload urls={photos} onChange={setPhotos} />

          {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}

          <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl bg-white text-[#172434] font-bold hover:bg-white/90 transition disabled:opacity-50">
            {submitting ? 'Sending…' : 'Request my plan & price →'}
          </button>
          <p className="text-white/40 text-xs text-center">Free quote · no card required · cancel anytime</p>
        </form>
      </div>
    </div>
  )
}
