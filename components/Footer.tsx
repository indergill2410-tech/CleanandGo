import Link from 'next/link'
import BrandMark from './BrandMark'
import NewsletterSignup from './NewsletterSignup'
import { CITIES } from '@/lib/seo'

const COLUMNS = [
  {
    heading: 'Services',
    links: [
      { label: 'Recurring Clean', href: '/services#recurring' },
      { label: 'One-Off Clean', href: '/services#oneoff' },
      { label: 'End of Lease', href: '/services#endoflease' },
      { label: 'All Services', href: '/services' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Reliability Guarantee', href: '/reliability' },
      { label: 'For Offices', href: '/commercial' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    heading: 'Get Started',
    links: [
      { label: 'Start a Recurring Plan', href: '/customer/plan' },
      { label: 'Book a One-Off Clean', href: '/customer/book' },
      { label: 'My Account', href: '/account' },
      { label: 'Track Your Clean', href: '/track' },
      { label: 'Staff Login', href: '/login?tab=staff' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="px-6 pt-16 pb-10" style={{ background: '#1C2B3A' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-10 md:grid-cols-4 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center text-white">
                <BrandMark className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">cleanngo</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-5">
              Australia&apos;s reliable cleaning service for homes &amp; offices. Recurring, one-off and end-of-lease cleans, fully insured and bond-back guaranteed.
            </p>
            <div className="max-w-xs">
              <div className="text-white/70 text-sm font-medium mb-2">Cleaning tips in your inbox</div>
              <NewsletterSignup compact />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <div className="text-white/90 font-semibold text-sm mb-4">{col.heading}</div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-white/50 text-sm hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 mb-6">
          <div className="text-white/90 font-semibold text-sm mb-3">Popular locations</div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {CITIES.map((c) => (
              <Link key={c.slug} href={`/cleaning/${c.slug}`} className="text-white/50 text-sm hover:text-white transition-colors">
                Cleaning {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/40 text-xs">Servicing homes &amp; offices Australia-wide</div>
          <div className="text-white/30 text-xs">© {new Date().getFullYear()} cleanngo. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
