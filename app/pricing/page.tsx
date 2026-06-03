import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ServiceCard from '@/components/ServiceCard'
import { SERVICES, PRICING_FAQS } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Cleaning Prices Melbourne — Transparent, No Hidden Fees',
  description:
    "See Clean&Go's Melbourne cleaning prices: recurring cleans from $120, one-off deep cleans from $180, and end-of-lease cleans from $400. Free quotes, no hidden fees.",
  alternates: { canonical: '/pricing' },
}

const PRICE_FACTORS = [
  { icon: '🛏️', title: 'Bedrooms & bathrooms', desc: 'The size of your home is the biggest driver — bathrooms in particular take time to do properly.' },
  { icon: '🧽', title: 'Type of clean', desc: 'A maintenance clean covers the essentials; deep and end-of-lease cleans cover far more.' },
  { icon: '➕', title: 'Optional extras', desc: 'Oven cleaning, interior windows, inside cupboards and carpet steam cleaning can be added.' },
  { icon: '🔁', title: 'Frequency', desc: 'Recurring weekly and fortnightly customers save 10% versus one-off pricing.' },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      <Navbar />

      {/* HERO */}
      <section className="gradient-hero pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: '#4A7FA5' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Honest pricing, no surprises
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Every quote is reviewed by a real person and fixed before you confirm. The price you accept is the price you pay.
          </p>
        </div>
      </section>

      {/* PRICE CARDS */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {SERVICES.map((s) => (
              <ServiceCard
                key={s.slug}
                icon={s.icon}
                title={s.title}
                description={s.description}
                price={s.price}
                tag={s.tag}
                tagColor={s.tagColor}
                features={s.features}
                highlight={s.highlight}
              />
            ))}
          </div>
          <p className="text-center text-[#7A8A96] text-sm mt-8">
            Prices shown are starting points. Your exact quote depends on your home — request one free, no obligation.
          </p>
        </div>
      </section>

      {/* WHAT AFFECTS PRICE */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #EBF0F5 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">Transparency</p>
            <h2 className="text-3xl font-bold text-[#1C2B3A]">What affects your price</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICE_FACTORS.map((f) => (
              <div key={f.title} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-[#1C2B3A] mb-2">{f.title}</h3>
                <p className="text-[#7A8A96] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">Pricing FAQ</p>
            <h2 className="text-3xl font-bold text-[#1C2B3A]">Questions about cost</h2>
          </div>
          <div className="space-y-4">
            {PRICING_FAQS.map((faq) => (
              <details key={faq.q} className="group bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
                <summary className="font-semibold text-[#1C2B3A] cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-[#4A7FA5] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="text-[#7A8A96] text-sm leading-relaxed mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 gradient-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get your exact price</h2>
          <p className="text-white/70 text-lg mb-8">Free, fast, and no obligation. Most quotes land within 60 minutes.</p>
          <Link href="/customer/book" className="inline-flex items-center gap-2 bg-white text-[#2C4A6E] font-bold px-10 py-4 rounded-full text-lg hover:bg-white/90 transition-all hover:-translate-y-1">
            Request My Quote →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
