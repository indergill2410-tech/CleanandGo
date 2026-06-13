import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  BriefcaseBusiness,
  CalendarCheck,
  Camera,
  Check,
  Home,
  Hotel,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  WandSparkles,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Cleanngo | Weekly Home Cleaning From $49/Week',
  description:
    'Meet Cleanngo, your weekly home reset. Weekly house cleaning from $49/week, Airbnb turnover cleaning, office cleaning, add-ons, and insured cleaners across Australia.',
  alternates: { canonical: '/' },
}

const PRICE_POINTS = [
  { label: '1-2 beds', price: '$49', detail: 'weekly reset starter' },
  { label: '3-4 beds', price: '$79', detail: 'family-home favourite' },
]

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: '$20M insured' },
  { icon: BadgeCheck, label: 'Police-checked cleaners' },
  { icon: Star, label: '4.9 average rating' },
  { icon: CalendarCheck, label: 'Weekly or fortnightly' },
]

const RESET_STEPS = [
  {
    icon: CalendarCheck,
    title: 'Pick your rhythm',
    text: 'Weekly, fortnightly, one-off, Airbnb turnover, or office schedule. No awkward back-and-forth.',
  },
  {
    icon: WandSparkles,
    title: 'We reset the space',
    text: 'Surfaces sanitized, rooms tidied, bathrooms scrubbed, floors finished, and the little things noticed.',
  },
  {
    icon: Home,
    title: 'Walk in and exhale',
    text: 'Come home to calm, host your next guest, or open the office without chasing anyone.',
  },
]

const REVENUE_LANES = [
  {
    icon: Home,
    eyebrow: 'Most popular',
    title: 'Weekly home resets',
    text: 'Recurring plans for busy households who want the same clean feeling every week without spending Saturday scrubbing.',
    cta: 'Start your weekly reset',
    href: '/customer/plan',
  },
  {
    icon: Hotel,
    eyebrow: 'For hosts',
    title: 'Airbnb turnovers',
    text: 'Checkout-to-checkin resets with linen change, bathroom sparkle, restock checks, and photo-ready reporting.',
    cta: 'Request host pricing',
    href: '/commercial#airbnb',
  },
  {
    icon: BriefcaseBusiness,
    eyebrow: 'For teams',
    title: 'Office cleaning',
    text: 'Fixed monthly commercial plans for offices, studios, salons, clinics, and high-touch workspaces.',
    cta: 'Get an office quote',
    href: '/commercial',
  },
]

const ADD_ONS = [
  'Oven deep clean',
  'Fridge reset',
  'Fresh linen change',
  'Laundry fold',
  'Inside windows',
  'Pantry tidy',
  'Pet hair detail',
  'Balcony sweep',
]

const HOST_FEATURES = [
  'Same-day checkout cleans',
  'Beds reset and linen changed',
  'Essentials restock checks',
  'Damage notes and photo proof',
  'Weekend priority available',
  'Multi-property host plans',
]

const EMOTIONAL_WINS = [
  'No more cleaning guilt sitting in the corner of your weekend.',
  'No frantic bathroom wipe-down before someone drops by.',
  'No checkout-day panic when guests are arriving at 3pm.',
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7F3EE] text-[#172434]">
      <Navbar />

      <section className="relative overflow-hidden pt-28 lg:pt-32">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(23,36,52,0.94) 0%, rgba(23,36,52,0.82) 42%, rgba(23,36,52,0.35) 100%), url('https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1800&q=85')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-4 pb-12 pt-8 sm:px-6 sm:pb-16 lg:min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl pt-8 sm:pt-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[#F2C14E]" />
              Weekly home resets from $49/week
            </div>

            <h1 className="text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Come home to calm.
            </h1>

            <p className="mt-6 max-w-xl rounded-[8px] border border-white/20 bg-[#172434]/72 p-4 text-base font-semibold leading-7 text-white shadow-2xl backdrop-blur-md sm:p-5 sm:text-xl sm:leading-8">
              Meet Cleanngo: your weekly home reset. We sanitize, tidy, polish, and leave
              everything ready for the part of life you actually want to enjoy.
            </p>

            <div className="mt-4 flex max-w-xl flex-col gap-2 rounded-[8px] border border-white/16 bg-white/12 p-3 text-sm font-bold text-white backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <Hotel className="h-4 w-4 text-[#8FD8B4]" />
                Airbnb turnovers
              </span>
              <span className="hidden h-4 w-px bg-white/20 sm:block" />
              <span className="inline-flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-[#F2C14E]" />
                Office cleaning plans
              </span>
              <Link href="/commercial" className="inline-flex items-center gap-1 text-[#8FD8B4] transition hover:text-white">
                office quotes <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              {PRICE_POINTS.map((item) => (
                <div key={item.label} className="rounded-[8px] border border-white/20 bg-white/12 p-4 backdrop-blur-md">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{item.price}</span>
                    <span className="pb-1 text-sm font-semibold text-white/70">/week</span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-white">{item.label}</div>
                  <div className="text-xs uppercase tracking-[0.16em] text-white/50">{item.detail}</div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/customer/plan"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2C14E] px-8 py-4 text-base font-black text-[#172434] shadow-[0_18px_60px_rgba(242,193,78,0.35)] transition hover:-translate-y-0.5 hover:bg-[#F6CF72]"
              >
                Start my weekly reset
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/customer/book"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/18"
              >
                Book a one-off clean
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {TRUST_ITEMS.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 backdrop-blur-md">
                  <item.icon className="h-4 w-4 text-[#8FD8B4]" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-white/18 bg-white/92 p-4 shadow-2xl backdrop-blur-md sm:p-5 lg:ml-auto lg:max-w-md">
            <div className="rounded-[8px] bg-[#172434] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8FD8B4]">This week</p>
                  <h2 className="mt-2 text-2xl font-black">Your reset checklist</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-white/10">
                  <Sparkles className="h-6 w-6 text-[#F2C14E]" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {['Bathrooms sanitized', 'Kitchen surfaces shining', 'Floors vacuumed and mopped', 'Beds and living areas tidied'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-[8px] bg-white/8 px-3 py-3 text-sm font-semibold text-white/84">
                    <Check className="h-4 w-4 text-[#8FD8B4]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                ['500+', 'homes reset'],
                ['60 sec', 'quote start'],
                ['100%', 'guaranteed'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[8px] bg-[#F7F3EE] p-3 text-center">
                  <div className="text-xl font-black text-[#172434]">{value}</div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#687A86]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2F7D6B]">Why it feels different</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-[#172434] sm:text-4xl md:text-5xl">
                Clean is not the product. Relief is.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#5F6E78]">
              Cleanngo should feel like the weekly reset button for people with full calendars, kids, guests,
              tenants, teams, and lives that already have enough friction.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {EMOTIONAL_WINS.map((item) => (
              <div key={item} className="rounded-[8px] border border-[#E5DDD3] bg-white p-6 shadow-sm">
                <Sparkles className="mb-5 h-6 w-6 text-[#C58A24]" />
                <p className="text-lg font-bold leading-7 text-[#172434]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#172434] px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8FD8B4]">Choose your clean</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              One trusted team for homes, hosts, and workplaces.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {REVENUE_LANES.map((lane) => (
              <div key={lane.title} className="rounded-[8px] border border-white/12 bg-white/[0.06] p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-white/10">
                    <lane.icon className="h-6 w-6 text-[#F2C14E]" />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white/62">
                    {lane.eyebrow}
                  </span>
                </div>
                <h3 className="text-2xl font-black">{lane.title}</h3>
                <p className="mt-4 min-h-24 text-sm leading-6 text-white/66">{lane.text}</p>
                <Link href={lane.href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#8FD8B4] transition hover:text-white">
                  {lane.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-[8px] bg-white shadow-xl">
            <div
              className="min-h-[280px] sm:min-h-[360px] lg:min-h-[460px]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(23,36,52,0.03), rgba(23,36,52,0.24)), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85')",
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            />
          </div>

          <div id="airbnb">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2F7D6B]">For Airbnb hosts</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#172434] sm:text-4xl md:text-5xl">
              Checkout at 10. New guest at 3. We handle the reset.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5F6E78]">
              Fast, repeatable turnover cleaning for short-stay hosts who need fresh beds, spotless bathrooms,
              stocked essentials, and proof the place is guest-ready.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {HOST_FEATURES.map((feature) => (
                <div key={feature} className="flex items-start gap-3 rounded-[8px] border border-[#E5DDD3] bg-white px-4 py-3 text-sm font-bold text-[#172434]">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[#2F7D6B]" />
                  {feature}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/commercial#airbnb" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#172434] px-7 py-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-[#24384F]">
                Build my host plan
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/customer/book" className="inline-flex items-center justify-center rounded-full border border-[#CBBFB2] px-7 py-4 font-black text-[#172434] transition hover:-translate-y-0.5 hover:bg-white">
                Book one turnover
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#C58A24]">Finishing touches</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-[#172434] sm:text-4xl md:text-5xl">
                Add the little luxuries at checkout.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#5F6E78]">
                Start with the essentials, then add the extras that make your place feel properly reset.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {ADD_ONS.map((addon) => (
                <div key={addon} className="flex items-center gap-3 rounded-[8px] border border-[#E8E2DA] bg-[#F7F3EE] p-4">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[8px] bg-white">
                    <Sparkles className="h-5 w-5 text-[#C58A24]" />
                  </div>
                  <span className="font-black text-[#172434]">{addon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2F7D6B]">How it works</p>
            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight text-[#172434] sm:text-4xl md:text-5xl">
              A calm home in three clean moves.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {RESET_STEPS.map((step, index) => (
              <div key={step.title} className="rounded-[8px] border border-[#E5DDD3] bg-white p-6 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#172434] text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-black text-[#B4A79A]">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-black text-[#172434]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5F6E78]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[8px] bg-[#172434] shadow-2xl">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 text-white md:p-12">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8FD8B4]">Start here</p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Make next week feel lighter.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
                Choose a weekly reset, ask about Airbnb turnovers, or get a fixed office quote.
                Cleanngo turns cleaning into one less thing your brain has to carry.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/customer/plan" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2C14E] px-8 py-4 font-black text-[#172434] transition hover:-translate-y-0.5 hover:bg-[#F6CF72]">
                  Get my reset price
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/commercial" className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                  I am a business or host
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/10 p-px">
              {[
                { icon: BedDouble, label: 'Homes', value: '$49+' },
                { icon: Hotel, label: 'Airbnbs', value: 'turnover' },
                { icon: BriefcaseBusiness, label: 'Offices', value: 'monthly' },
                { icon: KeyRound, label: 'End of lease', value: 'bond-ready' },
                { icon: Timer, label: 'Fast quote', value: '60 sec' },
                { icon: Camera, label: 'Proof', value: 'photos' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#203149] p-6 text-white">
                  <stat.icon className="h-6 w-6 text-[#8FD8B4]" />
                  <div className="mt-6 text-2xl font-black">{stat.value}</div>
                  <div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-white/48">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
