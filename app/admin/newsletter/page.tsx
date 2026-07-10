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
    <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-[#0B3558]">{p.title}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-black ${isDraft ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{p.status}</span>
          </div>
          <div className="mt-1 text-sm font-bold text-[#60798F]">{p.excerpt}</div>
          <div className="mt-1 text-xs text-[#8AA0AC]">{p.category} · {p.read_time}</div>
        </div>
        <button onClick={() => setOpen(open === p.id ? null : p.id)} className="shrink-0 text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">{open === p.id ? 'Hide' : 'Preview'}</button>
      </div>

      {open === p.id && (
        <div className="mt-4 max-h-72 space-y-3 overflow-auto rounded-[8px] bg-[#F8FBFF] p-4">
          {p.sections?.map((s, i) => (
            <div key={i}>
              {s.heading && <div className="mb-1 text-sm font-black text-[#0B3558]">{s.heading}</div>}
              {s.paragraphs?.map((t, j) => <p key={j} className="mb-2 text-sm leading-relaxed text-[#60798F]">{t}</p>)}
              {s.bullets && <ul className="list-disc space-y-1 pl-5 text-sm text-[#60798F]">{s.bullets.map((b, k) => <li key={k}>{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {isDraft && (
          <button onClick={() => act(p.id, '/publish')} disabled={busy === p.id} className="rounded-full border border-[#B9CFDE] px-4 py-2 text-sm font-black text-[#0B3558] hover:bg-[#DDECF5] disabled:opacity-50">Publish</button>
        )}
        <button onClick={() => act(p.id, '/send', `Send “${p.title}” to ${subscriberCount} subscriber(s)?`)} disabled={busy === p.id || subscriberCount === 0}
          className="rounded-full bg-[#0B3558] px-4 py-2 text-sm font-black text-white hover:bg-[#164A75] disabled:opacity-40">
          {isDraft ? 'Publish and send' : 'Send'}
        </button>
        {!isDraft && <Link href={`/blog/${p.slug}`} className="rounded-full border border-[#B9CFDE] px-4 py-2 text-sm font-black text-[#0B3558] hover:bg-[#DDECF5]">View</Link>}
        {isDraft && (
          <button onClick={() => act(p.id, '', 'Discard this draft?')} disabled={busy === p.id} className="rounded-full border border-red-200 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-50 disabled:opacity-50">Discard</button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#DDECF5] px-4 py-5 text-[#0B3558] sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">Back to overview</Link>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-[#0B3558]">Newsletter</h1>
            <p className="mt-1 text-sm font-bold text-[#60798F]">{subscriberCount} subscriber{subscriberCount === 1 ? '' : 's'} · review drafts before sending.</p>
          </div>
          <button onClick={generate} disabled={busy === 'generate'} className="shrink-0 rounded-full bg-[#0B3558] px-5 py-2.5 text-sm font-black text-white hover:bg-[#164A75] disabled:opacity-50">
            {busy === 'generate' ? 'Researching...' : 'Generate draft'}
          </button>
        </div>

        {msg && <div className="mb-5 rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-3 text-sm font-bold text-[#60798F] shadow-sm">{msg}</div>}

        {loading ? (
          <div className="text-[#60798F]">Loading...</div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Drafts to review</h2>
              {drafts.length === 0 ? (
                <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-8 text-center text-sm text-[#60798F] shadow-sm">No drafts yet. Generate one when you are ready.</div>
              ) : <div className="space-y-3">{drafts.map((p) => <Card key={p.id} p={p} isDraft />)}</div>}
            </section>

            {published.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Published</h2>
                <div className="space-y-3">{published.map((p) => <Card key={p.id} p={p} isDraft={false} />)}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

