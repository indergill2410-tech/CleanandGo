import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800'] })

export const metadata: Metadata = {
  title: { default: 'Clean&Go | Professional Cleaning Melbourne', template: '%s | Clean&Go' },
  description: 'Book trusted professional cleaners in Melbourne. Recurring, one-off, and end-of-lease cleaning. Bond-back guaranteed.',
  keywords: ['cleaning service Melbourne', 'end of lease cleaning', 'bond cleaning', 'house cleaning Melbourne', 'professional cleaners'],
  authors: [{ name: 'Clean&Go' }],
  creator: 'Clean&Go',
  metadataBase: new URL('https://cleanandgo.onrender.com'),
  openGraph: {
    title: 'Clean&Go — Your home, spotless. Guaranteed.',
    description: 'Book in 60 seconds. Melbourne\'s most trusted cleaning service.',
    type: 'website',
    locale: 'en_AU',
    siteName: 'Clean&Go',
  },
  twitter: { card: 'summary_large_image', title: 'Clean&Go', description: 'Book a professional cleaner in Melbourne in 60 seconds.' },
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
