'use client'
import { useRef, useState } from 'react'

type DocKey = 'resume' | 'police' | 'wwcc'

export default function CareersApplyForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', suburbs: '', experience: '', availability: '',
    tfn: '', abn: '', rightToWork: false, hasPoliceCheck: false, hasWwcc: false,
  })
  const [docs, setDocs] = useState<Record<DocKey, { url: string; name: string }>>({
    resume: { url: '', name: '' },
    police: { url: '', name: '' },
    wwcc: { url: '', name: '' },
  })
  const [uploadingKey, setUploadingKey] = useState<DocKey | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const refs = { resume: useRef<HTMLInputElement>(null), police: useRef<HTMLInputElement>(null), wwcc: useRef<HTMLInputElement>(null) }

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const upload = (key: DocKey) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // allow re-selecting the same file
    setUploadingKey(key)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/careers/resume', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      setDocs(d => ({ ...d, [key]: { url: data.path, name: file.name } }))
    } catch {
      setError('Upload failed — please try again')
    } finally {
      setUploadingKey('')
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
        body: JSON.stringify({
          ...form,
          resumeUrl: docs.resume.url,
          policeCheckUrl: docs.police.url,
          wwccUrl: docs.wwcc.url,
        }),
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

  const renderDocButton = (k: DocKey, label: string) => (
    <>
      <button type="button" onClick={() => refs[k].current?.click()} disabled={uploadingKey !== ''}
        className="text-sm px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">
        {uploadingKey === k ? 'Uploading…' : docs[k].name ? '✓ ' + docs[k].name : label}
      </button>
      <input ref={refs[k]} type="file" accept="application/pdf,image/jpeg,image/png" hidden onChange={upload(k)} />
    </>
  )

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
      <div className="grid sm:grid-cols-2 gap-4">
        <input inputMode="numeric" placeholder="TFN" value={form.tfn} onChange={e => set('tfn', e.target.value)} required className={inputCls} />
        <input inputMode="numeric" placeholder="ABN (optional)" value={form.abn} onChange={e => set('abn', e.target.value)} className={inputCls} />
      </div>
      <input placeholder="Suburbs / areas you can cover" value={form.suburbs} onChange={e => set('suburbs', e.target.value)} className={inputCls} />
      <input placeholder="Availability (e.g. weekdays, Tue–Thu, mornings)" value={form.availability} onChange={e => set('availability', e.target.value)} className={inputCls} />
      <textarea placeholder="Cleaning experience (optional)" value={form.experience} onChange={e => set('experience', e.target.value)} rows={3} className={inputCls} />

      <label className="flex items-center gap-3 text-white/80 text-sm">
        <input type="checkbox" checked={form.rightToWork} onChange={e => set('rightToWork', e.target.checked)} className="w-4 h-4 accent-[#1D7ED0]" />
        I have the right to work in Australia
      </label>

      <div>
        <label className="text-white/70 text-sm mb-2 block">Resume <span className="text-white/40">(optional, PDF)</span></label>
        {renderDocButton('resume', 'Attach resume')}
      </div>

      {/* Optional verification — stronger profile */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <p className="text-white/70 text-sm font-medium">Verification <span className="text-white/40">(optional)</span></p>
        <p className="text-white/40 text-xs">Not required — but adding these makes your profile stronger and gets you verified faster.</p>

        <label className="flex items-center gap-3 text-white/80 text-sm">
          <input type="checkbox" checked={form.hasPoliceCheck} onChange={e => set('hasPoliceCheck', e.target.checked)} className="w-4 h-4 accent-[#1D7ED0]" />
          I have a current National Police Check
        </label>
        {renderDocButton('police', 'Attach police check')}

        <label className="flex items-center gap-3 text-white/80 text-sm pt-1">
          <input type="checkbox" checked={form.hasWwcc} onChange={e => set('hasWwcc', e.target.checked)} className="w-4 h-4 accent-[#1D7ED0]" />
          I have a current Working With Children Check
        </label>
        {renderDocButton('wwcc', 'Attach WWCC')}
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-200 text-sm">{error}</div>}

      <button type="submit" disabled={submitting || uploadingKey !== ''} className="w-full py-3.5 rounded-xl bg-white text-[#0B3558] font-bold hover:bg-white/90 transition disabled:opacity-50">
        {submitting ? 'Submitting…' : uploadingKey ? 'Uploading…' : 'Submit application →'}
      </button>
    </form>
  )
}
