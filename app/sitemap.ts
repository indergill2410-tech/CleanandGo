import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://cleanandgo.onrender.com'
  return [
    { url: base,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/customer/book`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/track`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/login`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
  ]
}
