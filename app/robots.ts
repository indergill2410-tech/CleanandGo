import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/customer/book', '/track'],
        disallow: ['/admin', '/cleaner', '/api'],
      },
    ],
    sitemap: 'https://cleanandgo.onrender.com/sitemap.xml',
  }
}
