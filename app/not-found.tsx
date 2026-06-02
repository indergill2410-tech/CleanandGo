import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: '#4A7FA5' }} />
      </div>
      <div className="glass-strong rounded-3xl p-12 w-full max-w-md text-center relative z-10">
        <div className="text-8xl font-bold text-white/10 mb-2">404</div>
        <div className="text-5xl mb-6">🧹</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">Looks like this page got cleaned up. Let's get you back somewhere useful.</p>
        <div className="flex flex-col gap-3">
          <Link href="/" className="px-8 py-3.5 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition">Back to Home</Link>
          <Link href="/customer/book" className="px-8 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 transition font-medium">Book a Clean</Link>
        </div>
      </div>
    </div>
  )
}
