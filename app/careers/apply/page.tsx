import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CareersApplyForm from '@/components/CareersApplyForm'

export const metadata: Metadata = {
  title: 'Apply to Join — cleanngo Cleaner Application',
  description: 'Apply to join the cleanngo cleaning team. Tell us about your experience and availability — it takes a couple of minutes.',
  alternates: { canonical: '/careers/apply' },
  robots: { index: false }, // application form — keep it off search results
}

export default function CareersApplyPage() {
  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0B3558 0%, #0B3558 100%)' }}>
      <Navbar />
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Link href="/careers" className="text-white/50 text-sm hover:text-white">← Back to careers</Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-3">Apply to join</h1>
          <p className="text-white/60">Tell us a bit about yourself — we&apos;ll take it from there.</p>
        </div>
        <CareersApplyForm />
      </section>
      <Footer />
    </main>
  )
}
