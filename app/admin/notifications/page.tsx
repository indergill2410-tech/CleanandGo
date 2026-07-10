'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Notif = { id: string; type: string; title: string; message: string; booking_id: string | null; read: boolean; created_at: string }

const ICONS: Record<string, string> = {
  new_booking: 'Job', new_application: 'Staff', payment: 'Pay', quote: 'Quote', default: 'Update',
}

export default function AdminNotifications() {
  const [items, setItems] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const d = await fetch('/api/notifications').then(r => r.json())
    setItems(d.notifications || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const mark = async (body: { id?: string; all?: boolean }) => {
    setBusy(true)
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    await load()
    setBusy(false)
  }

  const unread = items.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-[#DDECF5] px-4 py-5 text-[#0B3558] sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Link href="/admin" className="text-sm font-black text-[#1D7ED0] hover:text-[#0B3558]">Back to overview</Link>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-[#0B3558]">Updates</h1>
            <p className="mt-1 text-sm font-bold text-[#60798F]">{unread} unread</p>
          </div>
          {unread > 0 && (
            <button onClick={() => mark({ all: true })} disabled={busy}
              className="rounded-full border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-2 text-sm font-black text-[#0B3558] hover:border-[#1D7ED0] disabled:opacity-50">
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-[#60798F]">Loading...</div>
        ) : items.length === 0 ? (
          <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-12 text-center text-[#60798F] shadow-sm">No updates.</div>
        ) : (
          <div className="space-y-2">
            {items.map(n => (
              <button key={n.id} onClick={() => !n.read && mark({ id: n.id })}
                className={`flex w-full gap-3 rounded-[8px] border border-[#B9CFDE] p-4 text-left shadow-sm transition-colors ${n.read ? 'bg-white' : 'bg-[#F8FBFF] hover:bg-white'}`}>
                <div className="rounded-full bg-[#E7F3FC] px-2.5 py-1 text-xs font-black text-[#1D7ED0]">{ICONS[n.type] || ICONS.default}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-black ${n.read ? 'text-[#60798F]' : 'text-[#0B3558]'}`}>{n.title}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-[#1D7ED0]" />}
                  </div>
                  <div className="text-sm font-bold text-[#60798F]">{n.message}</div>
                  <div className="mt-1 text-xs text-[#8AA0AC]" suppressHydrationWarning>{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

