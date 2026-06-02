import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ServiceCard from '@/components/ServiceCard'
import TrustBadge from '@/components/TrustBadge'
import TestimonialCard from '@/components/TestimonialCard'

const services = [
  {
    icon: '🏠',
    title: 'Recurring Clean',
    description: 'Set and forget. Your home stays spotless every week or fortnight — no reminders needed.',
    price: '$120',
    tag: 'Most Popular',
    tagColor: 'bg-[#4A7FA5]',
    features: ['Weekly or fortnightly', 'Same cleaner every time', '10% loyalty discount', 'Easy reschedule'],
    highlight: false,
  },
  {
    icon: '✨',
    title: 'One-Off Clean',
    description: 'Perfect for spring cleans, moving in, or any time you need a deep reset.',
    price: '$180',
    features: ['Deep clean included', 'Any day that suits', 'No commitment', '100% satisfaction guarantee'],
    highlight: true,
  },
  {
    icon: '🔑',
    title: 'End of Lease',
    description: "Don't risk your bond. Our checklist matches real estate agent standards — guaranteed.",
    price: '$400',
    tag: 'Bond Back ✓',
    tagColor: 'bg-emerald-500',
    features: ['Real estate checklist', 'Bond-back guarantee', 'Re-clean if needed', 'Certificate provided'],
    highlight: false,
  },
]

const testimonials = [
  {
    name: 'Sarah M.',
    suburb: 'South Yarra',
    rating: 5,
    text: 'Got my full bond back without a single issue. The team was thorough, professional, and the communication was perfect throughout.',
    service: 'End of Lease',
  },
  {
    name: 'James T.',
    suburb: 'Richmond',
    rating: 5,
    text: 'We\'ve had the same cleaner for 4 months now and the quality never drops. Worth every cent for the peace of mind.',
    service: 'Recurring',
  },
  {
    name: 'Priya K.',
    suburb: 'Fitzroy',
    rating: 5,
    text: 'Booked online at 10pm, confirmed by 8am, cleaned by 11am. This is how a service business should work.',
    service: 'One-Off',
  },
]

const steps = [
  { number: '01', icon: '📱', title: 'Book Online', desc: 'Pick your service, size, and time. Takes 60 seconds.' },
  { number: '02', icon: '🧹', title: 'We Clean', desc: 'A vetted, insured professional arrives on time and gets to work.' },
  { number: '03', icon: '😌', title: 'You Relax', desc: 'Come home to a spotless space. Photos sent on completion.' },
]

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
            <span className="text-white/90 text-sm font-medium">Trusted by 500+ Melbourne homes</span>
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
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 text-white/80 hover:text-white font-medium py-4 px-6 transition-colors">
              How it works ↓
            </a>
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
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                {i < steps.length - 1 && (
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
            {services.map((s, i) => (
              <ServiceCard key={i} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1C2B3A] mb-3">Why Melbourne trusts us</h2>
            <p className="text-[#7A8A96]">Every job backed by real guarantees — not just promises.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🛡️', title: '$20M Insured', subtitle: 'Public liability covered on every job' },
              { icon: '✅', title: 'Background Checked', subtitle: 'Every cleaner verified before hire' },
              { icon: '🔑', title: 'Bond Guarantee', subtitle: 'Re-clean free if agent isn\'t satisfied' },
              { icon: '⭐', title: '4.9 Rating', subtitle: 'From 400+ verified Google reviews' },
            ].map((b, i) => (
              <TrustBadge key={i} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #EBF0F5 0%, #F5F0EB 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">Reviews</p>
            <h2 className="text-4xl font-bold text-[#1C2B3A]">What Melbourne says</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-[#7A8A96] text-sm">47 cleans completed in Melbourne this month</p>
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
          <p className="text-white/70 text-lg mb-10">Join 500+ Melbourne homes. Book in 60 seconds.</p>
          <Link href="/customer/book" className="inline-flex items-center gap-2 bg-white text-[#2C4A6E] font-bold px-12 py-5 rounded-full text-lg hover:bg-white/90 transition-all hover:shadow-2xl hover:-translate-y-1">
            Book Now — It\'s Free to Quote
          </Link>
          <p className="text-white/50 text-sm mt-6">No commitment. Cancel anytime. Insured &amp; guaranteed.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ background: '#1C2B3A' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-bold text-white text-lg mb-1">Clean&amp;Go</div>
            <div className="text-white/40 text-xs">ABN: XX XXX XXX XXX · Melbourne, VIC 3000</div>
          </div>
          <div className="flex gap-8">
            {['Services', 'Book Now', 'Contact'].map(l => (
              <a key={l} href="#" className="text-white/50 text-sm hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <div className="text-white/30 text-xs">© {new Date().getFullYear()} Clean&amp;Go. All rights reserved.</div>
        </div>
      </footer>
    </main>
  )
}
