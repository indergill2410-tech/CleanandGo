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

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 20000)
    return () => window.clearInterval(timer)
  }, [load])

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
    return <div className="min-h-screen flex items-center justify-center bg-[#DDECF5] text-[#0B3558]">Opening your messages...</div>
  }

  return (
    <div className="min-h-screen bg-[#DDECF5] px-4 py-10 text-[#0B3558]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/account" className="text-[#1D7ED0] text-sm font-black hover:text-[#0B3558]">Back to account</Link>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-[#0B3558]">Messages</h1>
          <p className="mt-1 text-sm font-bold text-[#60798F]">Ask about a clean, update access notes, or reply to your Cleanngo team.</p>
        </div>

        {conversations.length === 0 ? (
          <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-10 text-center text-[#60798F] shadow-sm">No messages yet. When your service team sends an update, it will appear here.</div>
        ) : (
          <div className="grid lg:grid-cols-[320px_1fr] gap-4">
            <div className="h-fit space-y-2 rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-3 shadow-sm">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                  className={`w-full rounded-[8px] px-4 py-3 text-left transition-colors ${selected?.id === conversation.id ? 'bg-[#0B3558] text-white' : 'bg-white/75 text-[#0B3558] hover:bg-[#EAF6FC]'}`}
                >
                  <div className="font-semibold text-sm">{conversation.subject || 'Service update'}</div>
                  <div className={`mt-1 text-xs ${selected?.id === conversation.id ? 'text-white/62' : 'text-[#60798F]'}`}>
                    {conversation.last_message_at ? timeLabel(conversation.last_message_at) : 'New conversation'}
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-sm">
              <div className="mb-4 border-b border-[#B9CFDE] pb-4">
                <div className="font-black text-[#0B3558]">{selected?.subject || 'Service update'}</div>
                {selected?.booking_id && <div className="mt-1 text-xs text-[#60798F]">Booking: {selected.booking_id}</div>}
              </div>

              <div className="space-y-3 min-h-[260px]">
                {(selected?.messages || []).map((message) => {
                  const mine = message.sender_type === 'customer'
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-[8px] px-4 py-3 ${mine ? 'bg-[#0B3558] text-white' : 'bg-[#EAF6FC] text-[#0B3558]'}`}>
                        <div className="text-sm whitespace-pre-wrap">{message.body}</div>
                        <div className={`mt-2 text-[11px] ${mine ? 'text-white/60' : 'text-[#60798F]'}`}>{timeLabel(message.created_at)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 border-t border-[#B9CFDE] pt-4">
                <textarea
                  rows={3}
                  placeholder="Write a reply for the Cleanngo team..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  className="w-full resize-none rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] px-4 py-3 text-sm text-[#0B3558] placeholder:text-[#8AA0AC] outline-none focus:border-[#1D7ED0]"
                />
                {error && <div className="mt-2 text-sm font-bold text-red-600">{error}</div>}
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="mt-3 rounded-[8px] bg-[#0B3558] px-5 py-3 font-bold text-white hover:bg-[#164A75] disabled:opacity-50"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#DDECF5] text-[#0B3558]">Loading...</div>}>
      <MessagesView />
    </Suspense>
  )
}

