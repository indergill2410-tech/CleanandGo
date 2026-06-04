import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800'] })

export const metadata: Metadata = {
  title: { default: 'cleanngo | Professional Cleaning Australia-Wide', template: '%s | cleanngo' },
  description: 'Book trusted professional cleaners across Australia. Recurring, one-off, and end-of-lease cleaning for homes and offices. Bond-back guaranteed.',
  keywords: ['cleaning service Australia', 'house cleaning Sydney', 'house cleaning Melbourne', 'house cleaning Brisbane', 'office cleaning', 'end of lease cleaning', 'bond cleaning', 'professional cleaners'],
  authors: [{ name: 'cleanngo' }],
  creator: 'cleanngo',
  metadataBase: new URL('https://cleanandgo.onrender.com'),
  openGraph: {
    title: 'cleanngo — Your home, spotless. Guaranteed.',
    description: 'Book in 60 seconds. Australia\'s most reliable cleaning service.',
    type: 'website',
    locale: 'en_AU',
    siteName: 'cleanngo',
  },
  twitter: { card: 'summary_large_image', title: 'cleanngo', description: 'Book a professional cleaner anywhere in Australia in 60 seconds.' },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2C4A6E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
