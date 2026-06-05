'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import BrandMark from './BrandMark'

const LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Airbnb', href: '/#airbnb' },
  { label: 'For Offices', href: '/commercial' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Reliability', href: '/reliability' },
  { label: 'Blog', href: '/blog' },
  { label: "We're hiring", href: '/careers' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Solid surface when scrolled OR when the mobile menu is open.
  const solid = scrolled || menuOpen
  const linkColor = solid ? 'text-[#7A8A96] hover:text-[#2C4A6E]' : 'text-white/80 hover:text-white'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid ? 'glass shadow-lg py-3' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center text-white">
            <BrandMark className="w-5 h-5" />
          </div>
          <span className={`font-bold text-lg tracking-tight ${solid ? 'text-[#1C2B3A]' : 'text-white'}`}>cleanngo</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(item => (
            <Link key={item.label} href={item.href} className={`text-sm font-medium transition-colors ${linkColor}`}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/account"
            className={`hidden sm:inline-flex items-center rounded-full text-sm font-bold px-5 py-2.5 sm:px-6 sm:py-3 border-2 transition-all ${
              solid
                ? 'border-[#2C4A6E] text-[#2C4A6E] hover:bg-[#2C4A6E] hover:text-white'
                : 'border-white/60 text-white hover:bg-white hover:text-[#2C4A6E]'
            }`}
          >Log in</Link>
          <Link href="/customer/book" className="btn-primary text-sm px-5 py-2.5 sm:px-6 sm:py-3">Book Now</Link>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
          >
            <span className={`block w-5 h-0.5 rounded-full transition-all ${solid ? 'bg-[#1C2B3A]' : 'bg-white'} ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 rounded-full transition-all ${solid ? 'bg-[#1C2B3A]' : 'bg-white'} ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 rounded-full transition-all ${solid ? 'bg-[#1C2B3A]' : 'bg-white'} ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/20 mt-3">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {LINKS.map(item => (
              <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                className="py-3 text-[#1C2B3A] font-medium border-b border-black/5 last:border-0">
                {item.label}
              </Link>
            ))}
            <Link href="/account" onClick={() => setMenuOpen(false)}
              className="mt-3 text-center rounded-full font-bold px-6 py-3 border-2 border-[#2C4A6E] text-[#2C4A6E] hover:bg-[#2C4A6E] hover:text-white transition-all">
              Log in / Sign up
            </Link>
            <Link href="/customer/book" onClick={() => setMenuOpen(false)} className="btn-primary text-sm px-6 py-3 mt-2 text-center">
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
