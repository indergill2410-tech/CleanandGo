import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BLOG_POSTS, getPost } from '@/lib/content'

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  // JSON-LD structured data for rich search results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'cleanngo' },
    publisher: { '@type': 'Organization', name: 'cleanngo' },
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <main className="min-h-screen" style={{ background: '#F5F0EB' }}>
      <Navbar />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="gradient-hero pt-36 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#7BA7C7' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Link href="/blog" className="text-white/60 text-sm hover:text-white transition-colors mb-6 inline-block">
            ← All articles
          </Link>
          <span className="block text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">{post.category}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">{post.title}</h1>
          <div className="flex items-center justify-center gap-3 text-white/50 text-sm">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      {/* ARTICLE */}
      <article className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          {post.sections.map((section, i) => (
            <div key={i} className="mb-8">
              {section.heading && (
                <h2 className="text-2xl font-bold text-[#1C2B3A] mb-4 mt-4">{section.heading}</h2>
              )}
              {section.paragraphs?.map((para, j) => (
                <p key={j} className="text-[#3A4A56] leading-relaxed mb-4">{para}</p>
              ))}
              {section.bullets && (
                <ul className="space-y-2.5 mb-4">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[#3A4A56] leading-relaxed">
                      <span className="text-[#4A7FA5] mt-1">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Inline CTA */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg text-center mt-12">
            <h3 className="text-xl font-bold text-[#1C2B3A] mb-2">Want it done for you?</h3>
            <p className="text-[#7A8A96] text-sm mb-6">Get a free, no-obligation quote from a trusted local cleaner.</p>
            <Link href="/customer/book" className="btn-primary text-sm px-8 py-3.5">
              Request a Quote →
            </Link>
          </div>
        </div>
      </article>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="py-16 px-6" style={{ background: 'linear-gradient(180deg, #F5F0EB 0%, #EBF0F5 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1C2B3A] mb-8 text-center">Keep reading</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm card-hover"
                >
                  <span className="inline-block text-xs font-medium bg-[#EBF3F9] text-[#2C4A6E] px-3 py-1 rounded-full mb-3">
                    {p.category}
                  </span>
                  <h3 className="font-bold text-[#1C2B3A] leading-snug">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
