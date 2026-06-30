import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'The Reliability Guarantee — We Never Leave You Hanging',
  description:
    "Most cleaners are reliable until they're not. cleanngo gives every recurring plan a named cleaner AND a guaranteed backup, plus a missed-visit credit. Never get cancelled on again.",
  alternates: { canonical: '/reliability' },
}

const PROMISES = [
  {
    icon: '👥',
    title: 'A named cleaner + a guaranteed backup',
    desc: 'Every plan is assigned a regular cleaner who knows your place — and a vetted backup ready to step in. A sick day never means a missed clean.',
  },
  {
    icon: '💸',
    title: 'Miss a visit? You get a credit',
    desc: 'If we ever fail to cover a scheduled visit, the next one is on us. Our reliability is backed by money, not just words.',
  },
  {
    icon: '🔓',
    title: 'Pause or cancel anytime — no traps',
    desc: 'Skip a week, pause for a holiday, or cancel in two clicks. No lock-in contracts and no hard-to-cancel runaround.',
  },
]

const STEPS = [
  { n: '01', t: 'Your cleaner flags they’re unavailable', d: 'Through the staff app, before your visit — not 30 minutes before, at your door.' },
  { n: '02', t: 'We auto-assign your backup', d: 'The system instantly reassigns your visit to your plan’s backup cleaner.' },
  { n: '03', t: 'You get a heads-up', d: 'A quick message confirms your clean is still on — you do nothing.' },
]

export default function ReliabilityPage() {
  return (
    <main className="min-h-screen" style={{ background: '#EFF7FC' }}>
      <Navbar />

      <section className="gradient-hero pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7DD3FC' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">The Reliability Guarantee</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">We won&apos;t leave you hanging</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Every cleaner is reliable — until they&apos;re not. The day yours cancels is the day it costs you most. We built our whole model around making sure that day never lands on you.
          </p>
        </div>
      </section>

      {/* The promises */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {PROMISES.map(p => (
            <div key={p.title} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg">
              <div className="text-4xl mb-4">{p.icon}</div>
              <h2 className="text-lg font-bold text-[#0B3558] mb-2">{p.title}</h2>
              <p className="text-[#60798F] text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How backup works */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #EFF7FC 0%, #DCECF8 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#1D7ED0] font-semibold text-sm uppercase tracking-widest mb-3">Backup coverage</p>
            <h2 className="text-3xl font-bold text-[#0B3558]">How we keep your clean on track</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.n} className="text-center">
                <div className="text-[#7DD3FC] font-bold text-sm tracking-widest mb-3">{s.n}</div>
                <h3 className="font-bold text-[#0B3558] mb-2">{s.t}</h3>
                <p className="text-[#60798F] text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 gradient-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Cleaning you can actually count on</h2>
          <p className="text-white/70 text-lg mb-8">Start a recurring plan with a named cleaner and a guaranteed backup.</p>
          <Link href="/customer/plan" className="inline-flex items-center gap-2 bg-white text-[#0B3558] font-bold px-10 py-4 rounded-full text-lg hover:bg-white/90 transition-all hover:-translate-y-1">
            Start My Plan →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
