'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Notif = { id: string; type: string; title: string; message: string; booking_id: string | null; read: boolean; created_at: string }

const ICONS: Record<string, string> = {
  new_booking: '📅', new_application: '🧹', payment: '💳', quote: '💰', default: '🔔',
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
    <div className="min-h-screen py-6 px-6" style={{ background: 'linear-gradient(135deg, #0B3558 0%, #0B3558 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <Link href="/admin" className="text-white/50 text-sm hover:text-white">← Dashboard</Link>
            <h1 className="text-3xl font-bold text-white mt-2">Notifications</h1>
            <p className="text-white/50 mt-1">{unread} unread</p>
          </div>
          {unread > 0 && (
            <button onClick={() => mark({ all: true })} disabled={busy}
              className="text-sm px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-50">
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-white/50">Loading…</div>
        ) : items.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center text-white/40">No notifications.</div>
        ) : (
          <div className="space-y-2">
            {items.map(n => (
              <button key={n.id} onClick={() => !n.read && mark({ id: n.id })}
                className={`w-full text-left rounded-2xl p-4 flex gap-3 transition-colors ${n.read ? 'bg-white/5' : 'glass-strong hover:bg-white/15'}`}>
                <div className="text-xl">{ICONS[n.type] || ICONS.default}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${n.read ? 'text-white/60' : 'text-white'}`}>{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                  <div className="text-white/50 text-sm">{n.message}</div>
                  <div className="text-white/30 text-xs mt-1" suppressHydrationWarning>{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
