'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Section = { heading?: string; paragraphs?: string[]; bullets?: string[] }
type Post = { id: string; slug: string; title: string; excerpt: string | null; category: string | null; status: string; read_time: string | null; published_at: string | null; sections: Section[] }

export default function AdminNewsletter() {
  const [drafts, setDrafts] = useState<Post[]>([])
  const [published, setPublished] = useState<Post[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    const d = await fetch('/api/newsletter').then((r) => r.json())
    setDrafts(d.drafts || [])
    setPublished(d.published || [])
    setSubscriberCount(d.subscriberCount || 0)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const generate = async () => {
    setBusy('generate'); setMsg('')
    try {
      const res = await fetch('/api/newsletter/generate', { method: 'POST' })
      const data = await res.json()
      setMsg(res.ok ? 'Draft generated — review it below.' : (data.error || 'Generation failed'))
      if (res.ok) await load()
    } finally { setBusy('') }
  }

  const act = async (id: string, path: string, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return
    setBusy(id); setMsg('')
    try {
      const res = await fetch(`/api/newsletter/${id}${path}`, { method: path === '' ? 'DELETE' : 'POST' })
      const data = await res.json().catch(() => ({}))
      if (path === '/send' && res.ok) setMsg(`Sent to ${data.sent}/${data.total} subscribers.`)
      else if (!res.ok) setMsg(data.error || 'Action failed')
      await load()
    } finally { setBusy('') }
  }

  const Card = ({ p, isDraft }: { p: Post; isDraft: boolean }) => (
    <div className="glass-strong rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{p.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDraft ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'}`}>{p.status}</span>
          </div>
          <div className="text-white/50 text-sm mt-1">{p.excerpt}</div>
          <div className="text-white/30 text-xs mt-1">{p.category} · {p.read_time}</div>
        </div>
        <button onClick={() => setOpen(open === p.id ? null : p.id)} className="text-white/50 text-sm hover:text-white shrink-0">{open === p.id ? 'Hide' : 'Preview'}</button>
      </div>

      {open === p.id && (
        <div className="mt-4 bg-white/5 rounded-xl p-4 max-h-72 overflow-auto space-y-3">
          {p.sections?.map((s, i) => (
            <div key={i}>
              {s.heading && <div className="text-white font-semibold text-sm mb-1">{s.heading}</div>}
              {s.paragraphs?.map((t, j) => <p key={j} className="text-white/60 text-sm leading-relaxed mb-2">{t}</p>)}
              {s.bullets && <ul className="list-disc pl-5 text-white/60 text-sm space-y-1">{s.bullets.map((b, k) => <li key={k}>{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {isDraft && (
          <button onClick={() => act(p.id, '/publish')} disabled={busy === p.id} className="text-sm px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">Publish</button>
        )}
        <button onClick={() => act(p.id, '/send', `Send “${p.title}” to ${subscriberCount} subscriber(s)?`)} disabled={busy === p.id || subscriberCount === 0}
          className="text-sm px-4 py-2 rounded-full bg-white text-[#2C4A6E] font-semibold hover:bg-white/90 disabled:opacity-40">
          {isDraft ? 'Publish & send' : 'Send'}
        </button>
        {!isDraft && <Link href={`/blog/${p.slug}`} className="text-sm px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-white/10">View ↗</Link>}
        {isDraft && (
          <button onClick={() => act(p.id, '', 'Discard this draft?')} disabled={busy === p.id} className="text-sm px-4 py-2 rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10 disabled:opacity-50">Discard</button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
            <h1 className="text-3xl font-bold text-white mt-2">Newsletter</h1>
            <p className="text-white/50 mt-1">{subscriberCount} subscriber{subscriberCount === 1 ? '' : 's'} · weekly AI drafts land here to review.</p>
          </div>
          <button onClick={generate} disabled={busy === 'generate'} className="shrink-0 text-sm px-5 py-2.5 rounded-full bg-white text-[#2C4A6E] font-bold hover:bg-white/90 disabled:opacity-50">
            {busy === 'generate' ? 'Researching…' : '✨ Generate draft'}
          </button>
        </div>

        {msg && <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white/80 text-sm mb-5">{msg}</div>}

        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">Drafts to review</h2>
              {drafts.length === 0 ? (
                <div className="glass-strong rounded-2xl p-8 text-center text-white/40 text-sm">No drafts. Hit “Generate draft” or wait for the weekly run.</div>
              ) : <div className="space-y-3">{drafts.map((p) => <Card key={p.id} p={p} isDraft />)}</div>}
            </section>

            {published.length > 0 && (
              <section>
                <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">Published</h2>
                <div className="space-y-3">{published.map((p) => <Card key={p.id} p={p} isDraft={false} />)}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
