'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SERVICE_TYPES = [
  { id: 'recurring', label: 'Recurring Clean', basePrice: 120 },
  { id: 'oneoff', label: 'One-Off Clean', basePrice: 180 },
  { id: 'endoflease', label: 'End of Lease', basePrice: 400 },
]

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5]
const BATHROOM_OPTIONS = [1, 2, 3, 4]

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    serviceType: '',
    bedrooms: 2,
    bathrooms: 1,
    extras: [] as string[],
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    suburb: '',
    notes: '',
  })

  const selectedService = SERVICE_TYPES.find(s => s.id === form.serviceType)
  const estimatedPrice = selectedService
    ? selectedService.basePrice + (form.bedrooms - 1) * 30 + (form.bathrooms - 1) * 20
    : 0

  const handleExtras = (extra: string) => {
    setForm(f => ({
      ...f,
      extras: f.extras.includes(extra)
        ? f.extras.filter(e => e !== extra)
        : [...f.extras, extra],
    }))
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-brand-700 mb-2">Book a Clean</h1>
        <p className="text-gray-500 mb-6">Step {step} of 3</p>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Service Type</label>
              <div className="grid grid-cols-1 gap-3">
                {SERVICE_TYPES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setForm(f => ({ ...f, serviceType: s.id }))}
                    className={`p-4 border-2 rounded-xl text-left transition ${
                      form.serviceType === s.id
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-brand-300'
                    }`}
                  >
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-brand-600 text-sm">From ${s.basePrice}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2">Bedrooms</label>
                <select
                  value={form.bedrooms}
                  onChange={e => setForm(f => ({ ...f, bedrooms: Number(e.target.value) }))}
                  className="w-full border rounded-lg p-2"
                >
                  {BEDROOM_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">Bathrooms</label>
                <select
                  value={form.bathrooms}
                  onChange={e => setForm(f => ({ ...f, bathrooms: Number(e.target.value) }))}
                  className="w-full border rounded-lg p-2"
                >
                  {BATHROOM_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-2">Extras</label>
              {['Oven Clean (+$60)', 'Fridge Clean (+$40)', 'Wall Spot Clean (+$50)', 'Carpet Steam (+$80)'].map(extra => (
                <label key={extra} className="flex items-center gap-3 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.extras.includes(extra)}
                    onChange={() => handleExtras(extra)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  {extra}
                </label>
              ))}
            </div>
            {estimatedPrice > 0 && (
              <div className="bg-brand-50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-500">Estimated Price</div>
                <div className="text-3xl font-bold text-brand-700">${estimatedPrice}</div>
              </div>
            )}
            <button
              disabled={!form.serviceType}
              onClick={() => setStep(2)}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40 hover:bg-brand-700 transition"
            >
              Next: Choose Date & Time →
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Preferred Date</label>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Preferred Time</label>
              <select
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full border rounded-lg p-3"
              >
                <option value="">Select a time</option>
                {['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50">
                ← Back
              </button>
              <button
                disabled={!form.date || !form.time}
                onClick={() => setStep(3)}
                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40 hover:bg-brand-700 transition"
              >
                Next: Your Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 3 && (
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@example.com' },
              { label: 'Phone', key: 'phone', type: 'tel', placeholder: '04xx xxx xxx' },
              { label: 'Street Address', key: 'address', type: 'text', placeholder: '12 Example St' },
              { label: 'Suburb', key: 'suburb', type: 'text', placeholder: 'South Yarra' },
            ].map(f => (
              <div key={f.key}>
                <label className="block font-medium mb-1">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full border rounded-lg p-3"
                />
              </div>
            ))}
            <div>
              <label className="block font-medium mb-1">Special Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="e.g. pet in house, access code, specific areas to focus on"
                className="w-full border rounded-lg p-3"
              />
            </div>
            <div className="bg-brand-50 rounded-xl p-4 mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{selectedService?.label}</span>
                <span>${estimatedPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-brand-700">${estimatedPrice}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50">
                ← Back
              </button>
              <button
                disabled={!form.name || !form.email || !form.phone || !form.address}
                onClick={() => alert('Proceed to payment — Stripe integration next!')}
                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40 hover:bg-brand-700 transition"
              >
                Confirm &amp; Pay →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
