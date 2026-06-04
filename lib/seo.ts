// Central SEO config — single source of truth for the canonical site URL,
// business NAP details, JSON-LD, and the cities we publish landing pages for.

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cleanngo.com.au').replace(/\/$/, '')
export const SITE_NAME = 'cleanngo'

export const BUSINESS = {
  name: 'cleanngo',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  email: 'hello@cleanngo.com.au',
  areaServed: 'Australia',
  sameAs: [] as string[],
  priceRange: '$$',
}

export type City = { slug: string; name: string; state: string; blurb: string }

export const CITIES: City[] = [
  { slug: 'melbourne', name: 'Melbourne', state: 'VIC', blurb: 'From the CBD to Geelong and the Mornington Peninsula' },
  { slug: 'sydney', name: 'Sydney', state: 'NSW', blurb: 'Across the Eastern Suburbs, Inner West, North Shore and beyond' },
  { slug: 'brisbane', name: 'Brisbane', state: 'QLD', blurb: 'Greater Brisbane, from the inner suburbs to Logan and Ipswich' },
  { slug: 'perth', name: 'Perth', state: 'WA', blurb: 'Perth metro, from Fremantle to Joondalup' },
  { slug: 'adelaide', name: 'Adelaide', state: 'SA', blurb: 'Adelaide metro and the surrounding suburbs' },
  { slug: 'gold-coast', name: 'Gold Coast', state: 'QLD', blurb: 'From Coolangatta to Southport and Hope Island' },
  { slug: 'canberra', name: 'Canberra', state: 'ACT', blurb: 'Across the ACT and Queanbeyan' },
  { slug: 'newcastle', name: 'Newcastle', state: 'NSW', blurb: 'Newcastle, Lake Macquarie and the Hunter' },
  { slug: 'geelong', name: 'Geelong', state: 'VIC', blurb: 'Geelong, the Bellarine and the Surf Coast' },
  { slug: 'hobart', name: 'Hobart', state: 'TAS', blurb: 'Greater Hobart and the surrounding suburbs' },
  { slug: 'wollongong', name: 'Wollongong', state: 'NSW', blurb: 'The Illawarra, from Wollongong to Shellharbour' },
  { slug: 'sunshine-coast', name: 'Sunshine Coast', state: 'QLD', blurb: 'From Caloundra to Noosa' },
]

export function getCity(slug: string) {
  return CITIES.find((c) => c.slug === slug)
}

// Organization / LocalBusiness schema injected site-wide.
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CleaningService',
  '@id': `${SITE_URL}/#business`,
  name: BUSINESS.name,
  url: BUSINESS.url,
  logo: BUSINESS.logo,
  image: BUSINESS.logo,
  email: BUSINESS.email,
  priceRange: BUSINESS.priceRange,
  areaServed: { '@type': 'Country', name: 'Australia' },
  address: { '@type': 'PostalAddress', addressCountry: 'AU' },
  sameAs: BUSINESS.sameAs,
}
