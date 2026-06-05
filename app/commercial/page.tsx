import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Office & Commercial Cleaning Australia — Reliable Recurring Plans',
  description:
    'Recurring office cleaning across Australia your team can rely on. Named cleaner plus guaranteed backup, flexible weekly/fortnightly schedules, after-hours service, fixed monthly pricing.',
  alternates: { canonical: '/commercial' },
}

const REASONS = [
  { icon: '🛡️', title: 'Coverage guaranteed', desc: 'A backup cleaner is assigned to every contract, so your office is never left uncleaned because someone called in sick.' },
  { icon: '🌙', title: 'After-hours friendly', desc: 'We clean around your team — early mornings, evenings, or weekends — so the work day is never disrupted.' },
  { icon: '📅', title: 'Flexible frequency', desc: 'From daily to weekly. Many offices run 3 days (Tue–Thu) to match peak occupancy and cut cost.' },
  { icon: '🧾', title: 'Fixed monthly pricing', desc: 'A clear, fixed monthly quote — no per-hour surprises and no hidden fees.' },
]

const INCLUDED = [
  'Desks, surfaces and high-touch points sanitised',
  'Kitchen / breakroom cleaned and restocked',
  'Bathrooms scrubbed and sanitised',
  'Floors vacuumed and mopped',
  'Meeting rooms reset',
  'Bins emptied and waste removed',
  'Reception and entry presentable for clients',
  'Consumables monitored (soap, paper, etc.)',
]

const AIRBNB_INCLUDED = [
  'Same-day checkout-to-checkin turnover cleans',
  'Beds made and linen changed where supplied',
  'Bathrooms and kitchens sanitized for the next guest',
  'Essentials checked and restock notes sent',
  'Damage, missing items and guest mess flagged',
  'Photo proof after every completed turnover',
]

export default function CommercialPage() {
  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      <Navbar />

      <section className="gradient-hero pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7BA7C7' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">For Business</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">Office cleaning your team can rely on</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            A professional, recurring clean with guaranteed backup coverage — so your workplace is always presentable and you never chase a no-show cleaner again.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1C2B3A]">Why Australian businesses switch to us</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {REASONS.map(r => (
              <div key={r.title} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{r.icon}</div>
                <h3 className="font-semibold text-[#1C2B3A] mb-2">{r.title}</h3>
                <p className="text-[#7A8A96] text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #EBF0F5 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">Scope</p>
            <h2 className="text-3xl font-bold text-[#1C2B3A]">What a standard office clean covers</h2>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg grid sm:grid-cols-2 gap-3">
            {INCLUDED.map(item => (
              <div key={item} className="flex items-start gap-3 text-sm text-[#1C2B3A]">
                <span className="text-[#4A7FA5] mt-0.5">✓</span>{item}
              </div>
            ))}
          </div>
          <p className="text-center text-[#7A8A96] text-sm mt-6">Bespoke scope and frequency? We tailor every commercial quote to your site.</p>
        </div>
      </section>

      <section id="airbnb" className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[#4A7FA5] font-semibold text-sm uppercase tracking-widest mb-3">For Airbnb hosts</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C2B3A] mb-5 leading-tight">
              Guest leaves at 10. Next guest arrives at 3. We reset everything between.
            </h2>
            <p className="text-[#7A8A96] leading-relaxed">
              Built for short-stay hosts and property managers who need speed, consistency and proof.
              We handle fresh beds, spotless bathrooms, kitchen reset, restock checks and photo-ready reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/customer/plan" className="inline-flex items-center justify-center gap-2 bg-[#2C4A6E] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1C2B3A] transition-all hover:-translate-y-0.5">
                Request Host Plan →
              </Link>
              <Link href="/customer/book" className="inline-flex items-center justify-center gap-2 border-2 border-[#2C4A6E] text-[#2C4A6E] font-bold px-8 py-4 rounded-full hover:bg-[#2C4A6E] hover:text-white transition-all">
                Book One Turnover
              </Link>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg">
            <div className="grid sm:grid-cols-2 gap-3">
              {AIRBNB_INCLUDED.map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-[#1C2B3A]">
                  <span className="text-[#4A7FA5] mt-0.5">✓</span>{item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-[#F5F0EB] p-5">
              <div className="text-[#1C2B3A] font-bold">Monetisation options</div>
              <p className="text-[#7A8A96] text-sm mt-2 leading-relaxed">
                Charge per turnover, offer monthly host plans, add weekend priority, linen service,
                restocking, deep cleans and multi-property discounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 gradient-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get an office cleaning quote</h2>
          <p className="text-white/70 text-lg mb-8">Tell us about your space — we&apos;ll send a fixed monthly price, usually within a business day.</p>
          <Link href="/customer/plan" className="inline-flex items-center gap-2 bg-white text-[#2C4A6E] font-bold px-10 py-4 rounded-full text-lg hover:bg-white/90 transition-all hover:-translate-y-1">
            Request an Office Quote →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
