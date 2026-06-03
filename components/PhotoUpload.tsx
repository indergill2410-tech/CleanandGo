'use client'
import { useRef, useState } from 'react'

/**
 * Optional photo uploader. Uploads selected images to /api/uploads and reports
 * the resulting public URLs via onChange. Used on the booking + plan forms.
 */
export default function PhotoUpload({
  urls,
  onChange,
  max = 6,
  label = 'Photos',
}: {
  urls: string[]
  onChange: (urls: string[]) => void
  max?: number
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const pick = () => inputRef.current?.click()

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (urls.length + files.length > max) {
      setError(`Up to ${max} photos`)
      return
    }
    setError('')
    setUploading(true)
    try {
      const body = new FormData()
      files.forEach(f => body.append('files', f))
      const res = await fetch('/api/uploads', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      onChange([...urls, ...data.urls])
    } catch {
      setError('Upload failed — please try again')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = (url: string) => onChange(urls.filter(u => u !== url))

  return (
    <div>
      <label className="text-white/70 text-sm mb-2 block">{label} <span className="text-white/40">(optional)</span></label>
      <div className="flex flex-wrap gap-3">
        {urls.map(url => (
          <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Upload" className="w-full h-full object-cover" />
            <button type="button" onClick={() => remove(url)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none">×</button>
          </div>
        ))}
        {urls.length < max && (
          <button type="button" onClick={pick} disabled={uploading}
            className="w-20 h-20 rounded-xl border border-dashed border-white/30 text-white/50 text-sm hover:bg-white/10 disabled:opacity-50">
            {uploading ? '…' : '+ Add'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={onFiles} />
      {error && <div className="text-red-300 text-xs mt-2">{error}</div>}
      <p className="text-white/40 text-xs mt-2">Show us the space for a more accurate quote. JPG/PNG/WebP, up to {max}.</p>
    </div>
  )
}
