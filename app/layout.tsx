import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800'] })

export const metadata: Metadata = {
  title: 'Clean&Go | Professional Cleaning Services Melbourne',
  description: 'Book trusted professional cleaners in Melbourne. Recurring, one-off, and end-of-lease cleaning. Bond-back guaranteed.',
  keywords: 'cleaning service Melbourne, end of lease cleaning, bond cleaning, house cleaning Melbourne',
  openGraph: {
    title: 'Clean&Go — Your home, spotless. Guaranteed.',
    description: 'Book in 60 seconds. Melbourne\'s most trusted cleaning service.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
