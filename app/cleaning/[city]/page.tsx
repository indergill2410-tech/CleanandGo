import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import { SERVICES, GENERAL_FAQS } from '@/lib/content'
import { CITIES, getCity, SITE_URL } from '@/lib/seo'

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  const c = getCity(city)
  if (!c) return { title: 'Page not found', robots: { index: false } }
  const title = `Cleaning Services in ${c.name}, ${c.state} | House & End of Lease Cleaning`
  const description = `Book trusted, insured cleaners in ${c.name}. Recurring, one-off and end-of-lease cleaning for homes and offices — quoted within 60 minutes, bond-back guaranteed.`
  return {
    title,
    description,
    keywords: [`cleaning ${c.name}`, `house cleaning ${c.name}`, `end of lease cleaning ${c.name}`, `bond cleaning ${c.name}`, `office cleaning ${c.name}`],
    alternates: { canonical: `/cleaning/${c.slug}` },
    openGraph: { title, description, type: 'website' },
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const c = getCity(city)
  if (!c) notFound()

  const url = `${SITE_URL}/cleaning/${c.slug}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CleaningService',
      name: `cleanngo — Cleaning in ${c.name}`,
      url,
      areaServed: { '@type': 'City', name: c.name, address: { '@type': 'PostalAddress', addressRegion: c.state, addressCountry: 'AU' } },
      priceRange: '$$',
      image: `${SITE_URL}/favicon.svg`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: GENERAL_FAQS.slice(0, 5).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: `Cleaning in ${c.name}`, item: url },
      ],
    },
  ]

  return (
    <main className="min-h-screen" style={{ background: '#F7F3EE' }}>
      <Navbar />
      <JsonLd data={jsonLd} />

      {/* HERO */}
      <section className="gradient-hero pt-36 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#8FD8B4' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">{c.name}, {c.state}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">Professional Cleaning in {c.name}</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-4">
            Trusted, police-checked and fully insured cleaners across {c.name}. {c.blurb}. Recurring, one-off and end-of-lease cleans — quoted within 60 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-8 text-white/80 text-sm font-medium">
            <span>✅ Police-checked</span><span>🛡️ Fully insured ($20M)</span><span>⭐ Bond-back guarantee</span>
          </div>
          <Link href="/customer/book" className="btn-primary text-base px-8 py-3.5">Get a free quote →</Link>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#172434]">Cleaning services in {c.name}</h2>
            <p className="text-[#5F6E78] mt-3">Whatever your home or office needs, we’ve got a {c.name} cleaner for it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.slug} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-[#172434] mb-2">{s.title}</h3>
                <p className="text-[#5F6E78] text-sm leading-relaxed">{s.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local intro copy */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(180deg, #F7F3EE 0%, #EFE7DC 100%)' }}>
        <div className="max-w-2xl mx-auto text-[#3A4A56] leading-relaxed space-y-4">
          <h2 className="text-2xl font-bold text-[#172434]">Why {c.name} homes choose cleanngo</h2>
          <p>Finding a reliable cleaner in {c.name} shouldn’t be a gamble. Every cleanngo professional is police-checked, ID-verified and fully insured, and every booking is backed by our reliability guarantee — if we ever miss a visit, you’re automatically credited.</p>
          <p>Moving out? Our end-of-lease cleans in {c.name} follow the standard {c.state} real-estate inspection checklist and come with a free re-clean if your property manager isn’t satisfied, so you get your full bond back the first time.</p>
        </div>
      </section>

      {/* FAQs — visible content backing the FAQPage schema */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#172434] mb-8 text-center">Cleaning in {c.name} — common questions</h2>
          <div className="space-y-6">
            {GENERAL_FAQS.slice(0, 5).map((f, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="font-bold text-[#172434] mb-2">{f.q}</h3>
                <p className="text-[#5F6E78] text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 gradient-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Book a cleaner in {c.name}</h2>
          <p className="text-white/70 text-lg mb-8">Free, no-obligation quote in about 60 seconds.</p>
          <Link href="/customer/book" className="inline-flex items-center gap-2 bg-white text-[#172434] font-bold px-10 py-4 rounded-full text-lg hover:bg-white/90 transition-all hover:-translate-y-1">
            Get my quote →
          </Link>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {CITIES.filter((x) => x.slug !== c.slug).map((x) => (
              <Link key={x.slug} href={`/cleaning/${x.slug}`} className="text-white/60 hover:text-white text-sm px-3 py-1 rounded-full border border-white/15">
                {x.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
