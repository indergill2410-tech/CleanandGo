'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg py-3' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className={`font-bold text-lg tracking-tight ${
            scrolled ? 'text-[#1C2B3A]' : 'text-white'
          }`}>Clean&amp;Go</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Services', href: '/services' },
            { label: 'For Offices', href: '/commercial' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Reliability', href: '/reliability' },
            { label: 'Blog', href: '/blog' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-[#7A8A96] hover:text-[#2C4A6E]' : 'text-white/80 hover:text-white'
              }`}
            >{item.label}</Link>
          ))}
        </div>

        <Link href="/customer/book" className="btn-primary text-sm px-6 py-3">
          Book Now
        </Link>
      </div>
    </nav>
  )
}
