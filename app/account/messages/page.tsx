'use client'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type Message = {
  id: string
  sender_type: string
  body: string
  created_at: string
}

type Conversation = {
  id: string
  subject: string | null
  booking_id: string | null
  last_message_at: string | null
  messages: Message[]
}

const timeLabel = (value: string) => new Date(value).toLocaleString()

function MessagesView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedConversation = searchParams.get('conversation')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    await fetch('/api/account/claim', { method: 'POST' }).catch(() => {})
    const res = await fetch('/api/messages')
    if (res.status === 401 || res.status === 403) {
      router.push(`/login?tab=client&redirectTo=${encodeURIComponent('/account/messages' + (requestedConversation ? `?conversation=${requestedConversation}` : ''))}`)
      return
    }
    const data = await res.json()
    const list = data.conversations || []
    setConversations(list)
    setSelectedId((current) => current || requestedConversation || list[0]?.id || '')
    setLoading(false)
  }, [requestedConversation, router])

  useEffect(() => { load() }, [load])

  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) || conversations[0],
    [conversations, selectedId]
  )

  const sendReply = async () => {
    if (!selected || !reply.trim()) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selected.id, body: reply }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Reply failed')
        return
      }
      setReply('')
      await load()
      setSelectedId(selected.id)
    } catch {
      setError('Network error')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/60" style={{ background: 'linear-gradient(135deg, #1C2B3A, #2C4A6E)' }}>Opening your messages...</div>
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/account" className="text-white/50 text-sm hover:text-white">← Account</Link>
          <h1 className="text-3xl font-bold text-white mt-2">Your Cleanngo messages</h1>
          <p className="text-white/50 text-sm mt-1">Ask about a quote, update access notes, or reply to your service team.</p>
        </div>

        {conversations.length === 0 ? (
          <div className="glass-strong rounded-2xl p-10 text-center text-white/60">No messages yet. When your service team sends an update, it will appear here.</div>
        ) : (
          <div className="grid lg:grid-cols-[320px_1fr] gap-4">
            <div className="glass-strong rounded-2xl p-3 space-y-2 h-fit">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                  className={`w-full text-left rounded-xl px-4 py-3 transition-colors ${selected?.id === conversation.id ? 'bg-white text-[#2C4A6E]' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  <div className="font-semibold text-sm">{conversation.subject || 'Service update'}</div>
                  <div className={`text-xs mt-1 ${selected?.id === conversation.id ? 'text-[#2C4A6E]/60' : 'text-white/45'}`}>
                    {conversation.last_message_at ? timeLabel(conversation.last_message_at) : 'New conversation'}
                  </div>
                </button>
              ))}
            </div>

            <div className="glass-strong rounded-2xl p-5">
              <div className="border-b border-white/10 pb-4 mb-4">
                <div className="text-white font-semibold">{selected?.subject || 'Service update'}</div>
                {selected?.booking_id && <div className="text-white/40 text-xs mt-1">Booking: {selected.booking_id}</div>}
              </div>

              <div className="space-y-3 min-h-[260px]">
                {(selected?.messages || []).map((message) => {
                  const mine = message.sender_type === 'customer'
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${mine ? 'bg-white text-[#2C4A6E]' : 'bg-white/10 text-white'}`}>
                        <div className="text-sm whitespace-pre-wrap">{message.body}</div>
                        <div className={`text-[11px] mt-2 ${mine ? 'text-[#2C4A6E]/50' : 'text-white/35'}`}>{timeLabel(message.created_at)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-white/10 pt-4 mt-5">
                <textarea
                  rows={3}
                  placeholder="Write a reply for the Cleanngo team..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none"
                />
                {error && <div className="text-red-200 text-sm mt-2">{error}</div>}
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="mt-3 px-5 py-3 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send to Cleanngo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AccountMessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/60" style={{ background: 'linear-gradient(135deg, #1C2B3A, #2C4A6E)' }}>Loading...</div>}>
      <MessagesView />
    </Suspense>
  )
}
