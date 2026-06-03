'use client'
import { useRef, useState } from 'react'

export default function CareersApplyForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', suburbs: '', experience: '', availability: '',
    hasAbn: false, rightToWork: false,
  })
  const [resumeUrl, setResumeUrl] = useState('')
  const [resumeName, setResumeName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const onResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('files', file)
      const res = await fetch('/api/uploads', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      setResumeUrl(data.urls[0])
      setResumeName(file.name)
    } catch {
      setError('Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, resumeUrl }),
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

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm'

  if (done) {
    return (
      <div className="glass-strong rounded-3xl p-10 text-center max-w-md mx-auto">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-white mb-3">Application received</h3>
        <p className="text-white/70 text-sm">Thanks {form.name.split(' ')[0]}! Our team will review your application and be in touch about the next steps.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="glass-strong rounded-3xl p-7 space-y-4 max-w-lg mx-auto text-left">
      <div className="grid sm:grid-cols-2 gap-4">
        <input placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required className={inputCls} />
        <input type="tel" placeholder="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} required className={inputCls} />
      </div>
      <input type="email" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} required className={inputCls} />
      <input placeholder="Suburbs / areas you can cover" value={form.suburbs} onChange={e => set('suburbs', e.target.value)} className={inputCls} />
      <input placeholder="Availability (e.g. weekdays, Tue–Thu, mornings)" value={form.availability} onChange={e => set('availability', e.target.value)} className={inputCls} />
      <textarea placeholder="Cleaning experience (optional)" value={form.experience} onChange={e => set('experience', e.target.value)} rows={3} className={inputCls} />

      <label className="flex items-center gap-3 text-white/80 text-sm">
        <input type="checkbox" checked={form.hasAbn} onChange={e => set('hasAbn', e.target.checked)} className="w-4 h-4 accent-[#4A7FA5]" />
        I have an ABN (or am willing to register one)
      </label>
      <label className="flex items-center gap-3 text-white/80 text-sm">
        <input type="checkbox" checked={form.rightToWork} onChange={e => set('rightToWork', e.target.checked)} className="w-4 h-4 accent-[#4A7FA5]" />
        I have the right to work in Australia
      </label>

      <div>
        <label className="text-white/70 text-sm mb-2 block">Resume <span className="text-white/40">(optional, PDF)</span></label>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="text-sm px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">
          {uploading ? 'Uploading…' : resumeName ? `✓ ${resumeName}` : 'Attach resume'}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png" hidden onChange={onResume} />
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}

      <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Submit application →'}
      </button>
    </form>
  )
}
