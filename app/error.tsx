'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
      </div>
      <div className="glass-strong rounded-3xl p-10 w-full max-w-md text-center relative z-10">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-white/60 text-sm mb-8">Don't worry — your booking data is safe. Try again or go back home.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition">Try Again</button>
          <Link href="/" className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition font-medium">Go Home</Link>
        </div>
      </div>
    </div>
  )
}
