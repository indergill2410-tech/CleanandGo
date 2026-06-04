import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Careers — Join the cleanngo Team (We\'re Hiring Cleaners)',
  description:
    'Join cleanngo as a cleaner. Steady recurring work, flexible days, choose your suburbs, weekly pay and a supportive team with backup coverage. Apply online today.',
  alternates: { canonical: '/careers' },
}

const BENEFITS = [
  { icon: '🔁', title: 'Steady recurring work', desc: 'Regular weekly and fortnightly clients — not the one-off gig scramble. Predictable hours and income.' },
  { icon: '🛡️', title: 'Backup, not burnout', desc: 'Our backup model means you can take a day off without leaving a client stranded. Sustainable workloads.' },
  { icon: '📍', title: 'Choose your area', desc: 'Tell us the suburbs you want to work in and we match you with nearby jobs.' },
  { icon: '💸', title: 'Paid weekly', desc: 'Reliable weekly pay runs through our payroll — no chasing invoices.' },
  { icon: '📅', title: 'Flexible days', desc: 'Set the days and hours that suit your life. Part-time or full-time.' },
  { icon: '🤝', title: 'Supportive team', desc: 'Real people behind you, clear job details up front, and gear guidance.' },
]

const HOW = [
  { n: '01', t: 'Apply online', d: 'Fill in the short application — it takes a couple of minutes.' },
  { n: '02', t: 'Quick screen', d: 'We review your application and have a brief chat about your experience and availability.' },
  { n: '03', t: 'Checks & onboarding', d: 'Police check and a simple onboarding so you know exactly how we work.' },
  { n: '04', t: 'Your first job', d: 'We match you with clients in your area and you get cleaning.' },
]

export default function CareersPage() {
  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      <Navbar />

      <section className="gradient-hero pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7BA7C7' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">We&apos;re hiring</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">Join the cleanngo team</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            We&apos;re growing across Australia and looking for reliable, detail-loving cleaners. Steady work, flexible days, and a team that has your back.
          </p>
          <Link href="/careers/apply" className="inline-block mt-8 btn-primary text-sm px-8 py-3.5">Apply now →</Link>
        </div>
      </section>

      {/* Why join */}
      <section id="why-join" className="py-20 px-6 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">Why join</p>
            <h2 className="text-3xl font-bold text-[#1C2B3A]">A better way to clean for a living</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-semibold text-[#1C2B3A] mb-2">{b.title}</h3>
                <p className="text-[#7A8A96] text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #EBF0F5 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1C2B3A]">How to get started</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW.map(s => (
              <div key={s.n} className="text-center">
                <div className="text-[#7BA7C7] font-bold text-sm tracking-widest mb-3">{s.n}</div>
                <h3 className="font-bold text-[#1C2B3A] mb-2">{s.t}</h3>
                <p className="text-[#7A8A96] text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-20 px-6 gradient-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to join us?</h2>
          <p className="text-white/70 text-lg mb-8">The application takes a couple of minutes — no obligation.</p>
          <Link href="/careers/apply" className="inline-flex items-center gap-2 bg-white text-[#2C4A6E] font-bold px-10 py-4 rounded-full text-lg hover:bg-white/90 transition-all hover:-translate-y-1">
            Apply now →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
