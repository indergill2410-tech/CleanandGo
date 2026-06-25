import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { STEPS, GENERAL_FAQS } from '@/lib/content'

export const metadata: Metadata = {
  title: 'How It Works — Book a Cleaner Anywhere in Australia in 60 Seconds',
  description:
    'See how cleanngo works: request a free quote, get a tailored price within 60 minutes, then relax while a vetted, insured cleaner takes care of your home or office anywhere in Australia.',
  alternates: { canonical: '/how-it-works' },
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen" style={{ background: '#F7F3EE' }}>
      <Navbar />

      {/* HERO */}
      <section className="gradient-hero pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#8FD8B4' }} />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: '#2F7D6B' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            A spotless home in three simple steps
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            No call centres, no pressure, no surprise fees. Just a clean, transparent process from quote to sparkle.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 flex md:flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-2xl gradient-cta flex items-center justify-center text-3xl shadow-lg">
                  {step.icon}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block w-px h-12 mx-auto" style={{ background: 'linear-gradient(180deg, #2F7D6B, transparent)' }} />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[#8FD8B4] font-bold text-xs tracking-widest mb-2">STEP {step.number}</div>
                <h2 className="text-2xl font-bold text-[#172434] mb-2">{step.title}</h2>
                <p className="text-[#2F7D6B] font-medium mb-3">{step.desc}</p>
                <p className="text-[#5F6E78] leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F7F3EE 0%, #EFE7DC 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#2F7D6B] font-semibold text-sm uppercase tracking-widest mb-3">Good to know</p>
            <h2 className="text-3xl font-bold text-[#172434]">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {GENERAL_FAQS.map((faq) => (
              <details key={faq.q} className="group bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
                <summary className="font-semibold text-[#172434] cursor-pointer list-none flex items-center justify-between [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="text-[#2F7D6B] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="text-[#5F6E78] text-sm leading-relaxed mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 gradient-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-white/70 text-lg mb-8">It takes about 60 seconds, and the quote is free.</p>
          <Link href="/customer/book" className="inline-flex items-center gap-2 bg-white text-[#172434] font-bold px-10 py-4 rounded-full text-lg hover:bg-white/90 transition-all hover:-translate-y-1">
            Request a Quote →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
