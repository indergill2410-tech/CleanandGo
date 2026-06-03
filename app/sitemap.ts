import { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://cleanandgo.onrender.com'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                     lastModified: now, changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/services`,       lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/commercial`,     lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/reliability`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/how-it-works`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`,        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/blog`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/careers`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${base}/contact`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${base}/customer/plan`,  lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/customer/book`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/track`,          lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/login`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ]

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogRoutes]
}
