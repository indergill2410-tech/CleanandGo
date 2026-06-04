import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BLOG_POSTS } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Cleaning Tips & Guides — The cleanngo Blog',
  description:
    'Expert cleaning tips, pricing guides, and end-of-lease advice for Australian homes and offices. Learn how to keep your space spotless and get your full bond back.',
  alternates: { canonical: '/blog' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      <Navbar />

      {/* HERO */}
      <section className="gradient-hero pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7BA7C7' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-3">The Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Cleaning tips &amp; guides for Australian homes
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Practical advice on keeping your home spotless, understanding cleaning costs, and getting your bond back.
          </p>
        </div>
      </section>

      {/* POSTS */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-7 shadow-lg card-hover flex flex-col"
            >
              <span className="inline-block self-start text-xs font-medium bg-[#EBF3F9] text-[#2C4A6E] px-3 py-1 rounded-full mb-4">
                {post.category}
              </span>
              <h2 className="text-lg font-bold text-[#1C2B3A] mb-3 leading-snug">{post.title}</h2>
              <p className="text-[#7A8A96] text-sm leading-relaxed mb-6 flex-1">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-[#7A8A96]">
                <span>{formatDate(post.date)}</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 gradient-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Rather leave it to the pros?</h2>
          <p className="text-white/70 text-lg mb-8">Book a trusted local cleaner in 60 seconds.</p>
          <Link href="/customer/book" className="inline-flex items-center gap-2 bg-white text-[#2C4A6E] font-bold px-10 py-4 rounded-full text-lg hover:bg-white/90 transition-all hover:-translate-y-1">
            Book a Clean →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
