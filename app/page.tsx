import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ServiceCard from '@/components/ServiceCard'
import TrustBadge from '@/components/TrustBadge'
import TestimonialCard from '@/components/TestimonialCard'
import { SERVICES, STEPS, TESTIMONIALS, TRUST_BADGES } from '@/lib/content'

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      <Navbar />

      {/* HERO */}
      <section className="gradient-hero min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Glassmorphism blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: '#4A7FA5' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl" style={{ background: '#2C4A6E' }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Social proof pill */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-8 animate-fade-up">
            <span className="text-amber-400">★★★★★</span>
            <span className="text-white/90 text-sm font-medium">Trusted by 500+ Australian homes &amp; offices</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-up delay-100">
            Your home,<br />
            <span style={{ color: '#7BA7C7' }}>spotless.</span><br />
            Guaranteed.
          </h1>

          <p className="text-white/70 text-xl mb-10 max-w-xl mx-auto leading-relaxed animate-fade-up delay-200">
            Book in 60 seconds. We handle everything else.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
            <Link href="/customer/book" className="btn-primary text-lg px-10 py-4">
              Book a Clean →
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 text-white/80 hover:text-white font-medium py-4 px-6 transition-colors">
              How it works →
            </Link>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 animate-fade-up delay-300">
            {[
              { icon: '✅', label: 'Police-checked' },
              { icon: '🛡️', label: 'Fully insured ($20M)' },
              { icon: '👤', label: 'ID-verified' },
              { icon: '⭐', label: 'Vetted professionals' },
            ].map(b => (
              <span key={b.label} className="inline-flex items-center gap-1.5 text-white/80 text-sm font-medium">
                <span>{b.icon}</span>{b.label}
              </span>
            ))}
          </div>

          {/* Glass stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 animate-fade-up delay-400">
            {[
              { value: '500+', label: 'Happy homes' },
              { value: '4.9★', label: 'Average rating' },
              { value: '100%', label: 'Bond success rate' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl py-4 px-3">
                <div className="text-white font-bold text-2xl">{s.value}</div>
                <div className="text-white/60 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-4xl font-bold text-[#1C2B3A]">Three steps to a clean home</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px" style={{ background: 'linear-gradient(90deg, #4A7FA5, transparent)' }} />
                )}
                <div className="w-20 h-20 rounded-2xl gradient-cta flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg">
                  {step.icon}
                </div>
                <div className="text-[#7BA7C7] font-bold text-xs tracking-widest mb-2">{step.number}</div>
                <h3 className="text-lg font-bold text-[#1C2B3A] mb-2">{step.title}</h3>
                <p className="text-[#7A8A96] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/how-it-works" className="text-[#2C4A6E] font-semibold text-sm hover:text-[#4A7FA5] transition-colors">
              Learn how it works →
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #EBF0F5 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">Services</p>
            <h2 className="text-4xl font-bold text-[#1C2B3A] mb-4">Pick your clean</h2>
            <p className="text-[#7A8A96] max-w-md mx-auto">Every service is fully insured, background-checked, and backed by our satisfaction guarantee.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {SERVICES.map((s) => (
              <ServiceCard
                key={s.slug}
                icon={s.icon}
                title={s.title}
                description={s.description}
                tag={s.tag}
                tagColor={s.tagColor}
                features={s.features}
                highlight={s.highlight}
              />
            ))}
          </div>
          <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="text-[#2C4A6E] font-semibold text-sm hover:text-[#4A7FA5] transition-colors">
              Explore all services →
            </Link>
            <span className="hidden sm:inline text-[#7A8A96]">·</span>
            <Link href="/pricing" className="text-[#2C4A6E] font-semibold text-sm hover:text-[#4A7FA5] transition-colors">
              See full pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1C2B3A] mb-3">Why Australia trusts us</h2>
            <p className="text-[#7A8A96]">Every job backed by real guarantees — not just promises.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b) => (
              <TrustBadge key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #EBF0F5 0%, #F5F0EB 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">Reviews</p>
            <h2 className="text-4xl font-bold text-[#1C2B3A]">What Australia says</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-[#7A8A96] text-sm">Hundreds of cleans completed across Australia this month</p>
          </div>
        </div>
      </section>

      {/* HIRING */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-12 shadow-xl" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-semibold mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> We&apos;re hiring
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Join our team of cleaners</h2>
                <p className="text-white/70 max-w-md">Steady recurring work, flexible days, and a team that has your back — across Australia.</p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
                <Link href="/careers#apply" className="inline-flex items-center gap-2 bg-white text-[#2C4A6E] font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-all hover:-translate-y-0.5">
                  Apply now →
                </Link>
                <Link href="/careers#why-join" className="text-white/60 text-sm hover:text-white transition-colors">
                  Why join Clean&amp;Go?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 gradient-cta relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: '#7BA7C7' }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl" style={{ background: '#1C2B3A' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready for a cleaner home?</h2>
          <p className="text-white/70 text-lg mb-10">Join 500+ Australian homes &amp; offices. Book in 60 seconds.</p>
          <Link href="/customer/book" className="inline-flex items-center gap-2 bg-white text-[#2C4A6E] font-bold px-12 py-5 rounded-full text-lg hover:bg-white/90 transition-all hover:shadow-2xl hover:-translate-y-1">
            Book Now — It&apos;s Free to Quote
          </Link>
          <p className="text-white/50 text-sm mt-6">No commitment. Cancel anytime. Insured &amp; guaranteed.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
