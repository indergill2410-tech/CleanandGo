// Centralized marketing content shared across the landing page and the
// dedicated Services / How It Works / Pricing / Blog pages.

export type Service = {
  slug: string
  icon: string
  title: string
  tagline: string
  description: string
  price: string
  priceNote: string
  tag?: string
  tagColor?: string
  features: string[]
  includes: string[]
  highlight?: boolean
}

export const SERVICES: Service[] = [
  {
    slug: 'recurring',
    icon: '🏠',
    title: 'Recurring Clean',
    tagline: 'Set and forget',
    description: 'Your home stays spotless every week or fortnight — no reminders needed.',
    price: '$120',
    priceNote: 'per visit, from',
    tag: 'Most Popular',
    tagColor: 'bg-[#4A7FA5]',
    features: ['Weekly or fortnightly', 'Same cleaner every time', '10% loyalty discount', 'Easy reschedule'],
    includes: [
      'All living areas dusted and vacuumed',
      'Kitchen benches, sink and stovetop cleaned',
      'Bathrooms scrubbed and sanitised',
      'Floors mopped throughout',
      'Bins emptied and liners replaced',
      'Mirrors and glass wiped',
    ],
    highlight: false,
  },
  {
    slug: 'oneoff',
    icon: '✨',
    title: 'One-Off Clean',
    tagline: 'A complete reset',
    description: 'Perfect for spring cleans, moving in, or any time you need a deep reset.',
    price: '$180',
    priceNote: 'one-time, from',
    features: ['Deep clean included', 'Any day that suits', 'No commitment', '100% satisfaction guarantee'],
    includes: [
      'Everything in a recurring clean, plus:',
      'Inside window sills and skirting boards',
      'Detailed kitchen degrease',
      'Behind and under movable furniture',
      'Door frames and light switches wiped',
      'Cobweb removal throughout',
    ],
    highlight: true,
  },
  {
    slug: 'endoflease',
    icon: '🔑',
    title: 'End of Lease',
    tagline: 'Protect your bond',
    description: "Don't risk your bond. Our checklist matches real estate agent standards — guaranteed.",
    price: '$400',
    priceNote: 'from, property size dependent',
    tag: 'Bond Back ✓',
    tagColor: 'bg-emerald-500',
    features: ['Real estate checklist', 'Bond-back guarantee', 'Re-clean if needed', 'Certificate provided'],
    includes: [
      'Full property deep clean to agent standard',
      'Oven, range hood and griller detailed',
      'Inside all cupboards and drawers',
      'Windows, tracks and flyscreens',
      'Walls spot-cleaned for marks',
      'Carpet steam clean available as add-on',
    ],
    highlight: false,
  },
]

export type Step = {
  number: string
  icon: string
  title: string
  desc: string
  detail: string
}

export const STEPS: Step[] = [
  {
    number: '01',
    icon: '📱',
    title: 'Request a Quote',
    desc: 'Pick your service, size, and time. Takes 60 seconds.',
    detail:
      'Tell us about your home — service type, bedrooms, bathrooms and any extras. There are no upfront card details and no obligation. You will get a confirmation email straight away.',
  },
  {
    number: '02',
    icon: '💬',
    title: 'We Send Your Price',
    desc: 'A tailored quote lands in your inbox, usually within 60 minutes.',
    detail:
      'Every quote is reviewed by a real person so the price reflects your actual home, not a generic estimate. Accept it online whenever you are ready and pay securely by card.',
  },
  {
    number: '03',
    icon: '🧹',
    title: 'We Clean, You Relax',
    desc: 'A vetted, insured professional arrives on time and gets to work.',
    detail:
      'Come home to a spotless space. Your cleaner follows a detailed checklist, and we send before-and-after photos on completion. Not happy? We will re-clean for free.',
  },
]

export const TRUST_BADGES = [
  { icon: '🛡️', title: '$20M Insured', subtitle: 'Public liability covered on every job' },
  { icon: '✅', title: 'Background Checked', subtitle: 'Every cleaner verified before hire' },
  { icon: '🔑', title: 'Bond Guarantee', subtitle: "Re-clean free if agent isn't satisfied" },
  { icon: '⭐', title: '4.9 Rating', subtitle: 'From 400+ verified Google reviews' },
]

export const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    suburb: 'South Yarra',
    rating: 5,
    text: 'Got my full bond back without a single issue. The team was thorough, professional, and the communication was perfect throughout.',
    service: 'End of Lease',
  },
  {
    name: 'James T.',
    suburb: 'Richmond',
    rating: 5,
    text: "We've had the same cleaner for 4 months now and the quality never drops. Worth every cent for the peace of mind.",
    service: 'Recurring',
  },
  {
    name: 'Priya K.',
    suburb: 'Fitzroy',
    rating: 5,
    text: 'Booked online at 10pm, confirmed by 8am, cleaned by 11am. This is how a service business should work.',
    service: 'One-Off',
  },
]

export type Faq = { q: string; a: string }

export const PRICING_FAQS: Faq[] = [
  {
    q: 'Why is the booking quote-based instead of an instant price?',
    a: 'Every home is different. Rather than a one-size-fits-all online price that gets corrected later, a team member reviews your details and sends a fair, fixed quote — usually within 60 minutes during business hours.',
  },
  {
    q: 'What affects the price of my clean?',
    a: 'The main factors are the type of clean, the number of bedrooms and bathrooms, and any extras like oven cleaning, interior windows or carpet steam cleaning. End-of-lease cleans are priced on the full property size.',
  },
  {
    q: 'Do I pay anything to get a quote?',
    a: 'No. Requesting a quote is completely free and there is no obligation. You only pay once you have accepted your quote and confirmed the booking.',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'Never. Your quote is the price you pay. If we ever recommend an add-on, it will be listed clearly before you confirm.',
  },
  {
    q: 'Is there a discount for regular cleans?',
    a: 'Yes — recurring weekly and fortnightly customers receive a 10% loyalty discount compared with one-off pricing.',
  },
]

export const GENERAL_FAQS: Faq[] = [
  {
    q: 'Are your cleaners insured and background-checked?',
    a: 'Absolutely. Every cleaner is police-checked and reference-verified before they start, and all work is covered by $20M public liability insurance.',
  },
  {
    q: 'Do I need to provide cleaning equipment?',
    a: 'No. Our team arrives with professional-grade equipment and supplies. If you prefer specific eco-friendly products, just let us know.',
  },
  {
    q: 'What if I am not happy with the clean?',
    a: 'We back every job with a 100% satisfaction guarantee. Let us know within 48 hours and we will return to re-clean the areas in question at no extra cost.',
  },
  {
    q: 'Which areas of Melbourne do you cover?',
    a: 'We service homes right across metropolitan Melbourne, from the inner suburbs out to the bayside and eastern suburbs.',
  },
]

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  keywords: string[]
  sections: { heading?: string; paragraphs?: string[]; bullets?: string[] }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'end-of-lease-cleaning-checklist-melbourne',
    title: 'The Complete End of Lease Cleaning Checklist for Melbourne Renters',
    excerpt:
      'Everything your property manager expects to see — room by room — so you get your full bond back the first time.',
    date: '2026-05-28',
    readTime: '7 min read',
    category: 'End of Lease',
    keywords: [
      'end of lease cleaning Melbourne',
      'bond cleaning checklist',
      'vacate cleaning',
      'get bond back',
    ],
    sections: [
      {
        paragraphs: [
          'Moving out of a rental in Melbourne means meeting the cleaning standard set out in your lease — and Victorian property managers are thorough. A missed oven or a dusty skirting board is one of the most common reasons bond money is withheld. This room-by-room checklist covers exactly what agents inspect.',
        ],
      },
      {
        heading: 'Kitchen',
        bullets: [
          'Oven, racks, trays and griller degreased inside and out',
          'Range hood and filter cleaned',
          'Stovetop and splashback scrubbed',
          'Inside and outside of all cupboards and drawers',
          'Sink and tapware descaled and polished',
          'Benchtops and tiled areas wiped down',
        ],
      },
      {
        heading: 'Bathrooms and laundry',
        bullets: [
          'Shower screens, tiles and grout descaled',
          'Toilet sanitised inside and out',
          'Vanity, mirror and cupboards cleaned',
          'Exhaust fans dusted',
          'Floors mopped and skirting wiped',
        ],
      },
      {
        heading: 'Living areas and bedrooms',
        bullets: [
          'Walls spot-cleaned for marks and scuffs',
          'Skirting boards, door frames and light switches wiped',
          'Windows, sills, tracks and flyscreens cleaned',
          'Carpets vacuumed (steam clean often required by the lease)',
          'Hard floors mopped',
          'Cobwebs removed throughout',
        ],
      },
      {
        heading: 'Should you DIY or hire a professional?',
        paragraphs: [
          'A full vacate clean on a two-bedroom apartment typically takes one person 8–12 hours. If your lease requires a professional carpet steam clean — many do — you will need to hire that separately anyway. A professional end-of-lease service that includes a bond-back guarantee removes the risk: if the agent is not satisfied, the cleaner returns free of charge.',
          'At Clean&Go our end-of-lease checklist mirrors the standard Victorian real estate inspection, and every bond clean is backed by a free re-clean guarantee.',
        ],
      },
    ],
  },
  {
    slug: 'how-much-does-house-cleaning-cost-melbourne',
    title: 'How Much Does House Cleaning Cost in Melbourne? (2026 Guide)',
    excerpt:
      'A clear breakdown of recurring, one-off and end-of-lease cleaning prices in Melbourne, and what actually drives the cost.',
    date: '2026-05-20',
    readTime: '6 min read',
    category: 'Pricing',
    keywords: [
      'house cleaning cost Melbourne',
      'cleaning prices Melbourne',
      'how much does a cleaner cost',
    ],
    sections: [
      {
        paragraphs: [
          'One of the first questions every Melbourne homeowner asks is simply: what should a clean cost? Prices vary based on the type of service, the size of your home, and any extras — but here is a realistic guide to current Melbourne rates.',
        ],
      },
      {
        heading: 'Typical price ranges',
        bullets: [
          'Recurring (weekly/fortnightly): from $120 per visit',
          'One-off deep clean: from $180',
          'End of lease / bond clean: from $400, depending on property size',
        ],
      },
      {
        heading: 'What drives the price',
        paragraphs: [
          'Three factors do most of the work. First, the number of bedrooms and bathrooms — bathrooms in particular are labour-intensive. Second, the type of clean: a deep or end-of-lease clean covers far more than a regular maintenance clean. Third, extras such as oven cleaning, interior windows, or carpet steam cleaning.',
        ],
      },
      {
        heading: 'Why recurring cleans cost less per visit',
        paragraphs: [
          'A home that is cleaned every week or fortnight never accumulates heavy build-up, so each visit is faster. That is why recurring customers pay less per visit than a one-off clean — and at Clean&Go they also receive a 10% loyalty discount.',
        ],
      },
      {
        heading: 'Getting an accurate quote',
        paragraphs: [
          'Instant online calculators often quote low and adjust upward later. We take the opposite approach: tell us about your home and a real team member sends a fixed quote, usually within 60 minutes. It is free and there is no obligation.',
        ],
      },
    ],
  },
  {
    slug: 'weekly-vs-fortnightly-cleaning',
    title: 'Weekly vs Fortnightly Cleaning: Which Is Right for Your Home?',
    excerpt:
      'How to choose the right recurring cleaning frequency based on your household, budget and lifestyle.',
    date: '2026-05-12',
    readTime: '5 min read',
    category: 'Recurring',
    keywords: [
      'weekly vs fortnightly cleaning',
      'recurring cleaning Melbourne',
      'how often should I clean my house',
    ],
    sections: [
      {
        paragraphs: [
          'Once you decide to bring in a regular cleaner, the next question is how often. Weekly and fortnightly are the two most popular options — here is how to choose.',
        ],
      },
      {
        heading: 'When weekly makes sense',
        bullets: [
          'Busy households with children or pets',
          'Homes with high foot traffic or allergies',
          'Anyone who wants a consistently guest-ready space',
          'Larger homes where build-up happens quickly',
        ],
      },
      {
        heading: 'When fortnightly is enough',
        bullets: [
          'Couples or singles with a tidy daily routine',
          'Smaller apartments and units',
          'Budget-conscious households wanting the essentials covered',
          'Homes that just need maintenance, not heavy lifting',
        ],
      },
      {
        heading: 'The cost difference',
        paragraphs: [
          'Weekly cleaning costs more per month but each visit is quick and your home never falls behind. Fortnightly roughly halves the monthly spend while still keeping things under control. Both options at Clean&Go include the same cleaner each visit and a 10% loyalty discount.',
        ],
      },
      {
        heading: 'Still not sure?',
        paragraphs: [
          'Many customers start fortnightly and move to weekly (or the reverse) after a month. Because there is no lock-in contract, you can adjust your frequency any time — just let us know.',
        ],
      },
    ],
  },
]

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
