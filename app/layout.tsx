import type { Metadata, Viewport } from 'next'
import './globals.css'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, organizationJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: { default: 'Cleanngo | Weekly Home Resets From $49/Week', template: '%s | Cleanngo' },
  description: 'Weekly home cleaning from $49/week, Airbnb turnover cleaning, office cleaning, and end-of-lease resets from insured cleaners across Australia.',
  keywords: ['weekly cleaning Australia', 'house cleaning Sydney', 'house cleaning Melbourne', 'Airbnb turnover cleaning', 'office cleaning', 'end of lease cleaning', 'bond cleaning', 'professional cleaners'],
  authors: [{ name: 'cleanngo' }],
  creator: 'cleanngo',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Cleanngo - Your weekly home reset.',
    description: 'Come home to calm with weekly cleaning from $49/week, plus Airbnb turnovers and office plans.',
    type: 'website',
    locale: 'en_AU',
    siteName: 'cleanngo',
  },
  twitter: { card: 'summary_large_image', title: 'Cleanngo', description: 'Weekly home resets, Airbnb turnovers, and office cleaning across Australia.' },
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
  themeColor: '#0B3558',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={organizationJsonLd} />
        {children}
      </body>
    </html>
  )
}
