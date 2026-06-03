import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Contact Us — Clean&Go',
  description: 'Get in touch with Clean&Go. Email or call us and our team will help with quotes, bookings and any questions.',
  alternates: { canonical: '/contact' },
}

const EMAIL = 'admin@cleanngo.com.au'
const PHONE_DISPLAY = '0411 922 559'
const PHONE_TEL = '+61411922559'

export default function ContactPage() {
  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      <Navbar />

      <section className="gradient-hero pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7BA7C7' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">Get in touch</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Questions about a quote, a booking, or your plan? Our team is here to help — we reply fast during business hours.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
          <a href={`mailto:${EMAIL}`} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg card-hover block">
            <div className="text-4xl mb-4">✉️</div>
            <div className="font-semibold text-[#1C2B3A] mb-1">Email us</div>
            <div className="text-[#4A7FA5] font-medium break-all">{EMAIL}</div>
            <p className="text-[#7A8A96] text-sm mt-3">Best for quotes, booking changes and general enquiries.</p>
          </a>

          <a href={`tel:${PHONE_TEL}`} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg card-hover block">
            <div className="text-4xl mb-4">📞</div>
            <div className="font-semibold text-[#1C2B3A] mb-1">Call us</div>
            <div className="text-[#4A7FA5] font-medium">{PHONE_DISPLAY}</div>
            <p className="text-[#7A8A96] text-sm mt-3">Prefer to talk it through? Give us a call during business hours.</p>
          </a>
        </div>

        <div className="max-w-3xl mx-auto text-center mt-10">
          <p className="text-[#7A8A96] text-sm mb-6">Ready to go? Skip the back-and-forth and request a quote online.</p>
          <Link href="/customer/plan" className="btn-primary text-sm px-8 py-3.5">Request a Quote →</Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
