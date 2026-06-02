import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clean&Go | Professional Cleaning Services Melbourne',
  description: 'Book trusted professional cleaners in Melbourne. Recurring, one-off, and end-of-lease cleaning services.',
  keywords: 'cleaning service, Melbourne, end of lease cleaning, house cleaning, bond cleaning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
