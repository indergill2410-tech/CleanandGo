import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TrustBadge from '@/components/TrustBadge'
import { SERVICES, TRUST_BADGES } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Cleaning Services Melbourne — Recurring, One-Off & End of Lease',
  description:
    'Explore Clean&Go cleaning services in Melbourne: recurring weekly and fortnightly cleans, one-off deep cleans, and bond-back end-of-lease cleaning. Fully insured and guaranteed.',
  alternates: { canonical: '/services' },
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      <Navbar />

      {/* HERO */}
      <section className="gradient-hero pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: '#4A7FA5' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">Our Services</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Cleaning services for every Melbourne home
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Whatever you need — a regular tidy, a deep reset, or a bond-back vacate clean — every job is fully insured, background-checked, and backed by our satisfaction guarantee.
          </p>
        </div>
      </section>

      {/* SERVICE DETAIL SECTIONS */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          {SERVICES.map((s, i) => (
            <div
              key={s.slug}
              id={s.slug}
              className="scroll-mt-24 grid md:grid-cols-2 gap-10 items-center"
            >
              {/* Summary */}
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="text-5xl mb-4">{s.icon}</div>
                {s.tag && (
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full text-white mb-3 ${s.tagColor}`}>
                    {s.tag}
                  </span>
                )}
                <h2 className="text-3xl font-bold text-[#1C2B3A] mb-1">{s.title}</h2>
                <p className="text-[#4A7FA5] font-medium mb-4">{s.tagline}</p>
                <p className="text-[#7A8A96] leading-relaxed mb-6">{s.description}</p>
                <div className="flex items-end gap-6 mb-6">
                  <div>
                    <div className="text-xs text-[#7A8A96] mb-1">{s.priceNote}</div>
                    <div className="text-4xl font-bold text-[#2C4A6E]">{s.price}</div>
                  </div>
                  <Link href="/customer/book" className="btn-primary text-sm px-7 py-3.5">
                    Book {s.title} →
                  </Link>
                </div>
              </div>

              {/* What's included */}
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg">
                  <div className="font-semibold text-[#1C2B3A] mb-4">What&apos;s included</div>
                  <ul className="space-y-3">
                    {s.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-[#1C2B3A]">
                        <span className="text-[#4A7FA5] mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #EBF0F5 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1C2B3A] mb-3">Backed by real guarantees</h2>
            <p className="text-[#7A8A96]">Every service includes the same promises — not just for some jobs, for all of them.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b) => (
              <TrustBadge key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 gradient-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Not sure which service you need?</h2>
          <p className="text-white/70 text-lg mb-8">Request a free quote and we&apos;ll recommend the right clean for your home.</p>
          <Link href="/customer/book" className="inline-flex items-center gap-2 bg-white text-[#2C4A6E] font-bold px-10 py-4 rounded-full text-lg hover:bg-white/90 transition-all hover:-translate-y-1">
            Get My Free Quote →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
