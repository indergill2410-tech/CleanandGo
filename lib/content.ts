// Centralized marketing content shared across the landing page and the
// dedicated Services / How It Works / Pricing / Blog pages.

export type Service = {
  slug: string
  icon: string
  title: string
  tagline: string
  description: string
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
    tag: 'Most Popular',
    tagColor: 'bg-[#2F7D6B]',
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
    q: 'Which areas do you cover?',
    a: 'We operate Australia-wide, with cleaners across the major metro areas including Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra and the Gold Coast. Enter your address when you request a quote and we will confirm coverage.',
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
    slug: 'end-of-lease-cleaning-checklist-australia',
    title: 'The Complete End of Lease Cleaning Checklist for Australian Renters',
    excerpt:
      'Everything your property manager expects to see — room by room — so you get your full bond back the first time.',
    date: '2026-05-28',
    readTime: '7 min read',
    category: 'End of Lease',
    keywords: [
      'end of lease cleaning Australia',
      'bond cleaning checklist',
      'vacate cleaning',
      'get bond back',
    ],
    sections: [
      {
        paragraphs: [
          'Moving out of a rental anywhere in Australia means meeting the cleaning standard set out in your lease — and property managers are thorough. A missed oven or a dusty skirting board is one of the most common reasons bond money is withheld. This room-by-room checklist covers exactly what agents inspect (the rules are similar in every state, though exact bond conditions vary).',
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
          'At cleanngo our end-of-lease checklist mirrors the standard real estate inspection used across Australia, and every bond clean is backed by a free re-clean guarantee.',
        ],
      },
    ],
  },
  {
    slug: 'what-affects-house-cleaning-cost-australia',
    title: 'What Affects House Cleaning Cost in Australia? (2026 Guide)',
    excerpt:
      'What actually drives the price of a clean — service type, home size and extras — and why we quote each job individually.',
    date: '2026-05-20',
    readTime: '6 min read',
    category: 'Pricing',
    keywords: [
      'house cleaning cost Australia',
      'cleaning prices Australia',
      'how much does a cleaner cost',
    ],
    sections: [
      {
        paragraphs: [
          'One of the first questions every homeowner asks is simply: what should a clean cost? Rather than a one-size-fits-all figure, the honest answer is that it depends on a few things — so here is what actually drives the price, and why we send a tailored quote for every job.',
        ],
      },
      {
        heading: 'What drives the price',
        paragraphs: [
          'Three factors do most of the work. First, the number of bedrooms and bathrooms — bathrooms in particular are labour-intensive. Second, the type of clean: a deep or end-of-lease clean covers far more than a regular maintenance clean. Third, extras such as oven cleaning, interior windows, or carpet steam cleaning.',
        ],
      },
      {
        heading: 'Why recurring cleans are the best value',
        paragraphs: [
          'A home that is cleaned every week or fortnight never accumulates heavy build-up, so each visit is faster and better value than a one-off clean. Recurring cleanngo customers also receive a loyalty discount on every visit.',
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
      'recurring cleaning Australia',
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
          'Weekly cleaning costs more per month but each visit is quick and your home never falls behind. Fortnightly roughly halves the monthly spend while still keeping things under control. Both options at cleanngo include the same cleaner each visit and a 10% loyalty discount.',
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
  {
    slug: 'bond-cleaning-cost-australia',
    title: 'How Much Does Bond Cleaning Cost in Australia? (2026 Price Guide)',
    excerpt: 'A clear breakdown of end-of-lease cleaning prices by property size, plus what drives the cost up or down.',
    date: '2026-05-20',
    readTime: '6 min read',
    category: 'Pricing',
    keywords: ['bond cleaning cost', 'end of lease cleaning price', 'vacate cleaning cost Australia', 'how much is bond cleaning'],
    sections: [
      { paragraphs: ['Bond cleaning (also called end-of-lease or vacate cleaning) is priced on the size and condition of your property, not a flat hourly rate. As a guide, most Australian renters pay between $250 and $600 for a standard vacate clean — but the right number depends on a few specific things.'] },
      { heading: 'Typical price ranges', bullets: ['Studio / 1-bed apartment: $250–$350', '2-bed apartment or unit: $320–$450', '3-bed house: $400–$600', '4-bed+ house: $550–$800+', 'Add-ons like carpet steam cleaning, walls or a neglected oven sit on top'] },
      { heading: 'What changes the price', paragraphs: ['Three factors move the number most: the number of bathrooms (they are the most labour-intensive room), the overall condition (a well-kept home cleans faster than one with heavy build-up), and extras your agent requires such as carpet steam cleaning, blind dusting, garage sweeping or wall spot-cleaning.'] },
      { heading: 'Why a fixed quote beats an hourly rate', paragraphs: ['An hourly cleaner can blow your budget if the job takes longer than expected. A fixed end-of-lease quote protects you: you know the price up front, and a reputable provider backs it with a free re-clean if your property manager isn’t satisfied — so you only pay once to get your bond back.'] },
    ],
  },
  {
    slug: 'how-to-get-full-bond-back',
    title: 'How to Get Your Full Bond Back: A Renter’s Guide',
    excerpt: 'The exact steps Australian renters use to pass the final inspection and recover 100% of their bond.',
    date: '2026-05-12',
    readTime: '7 min read',
    category: 'End of Lease',
    keywords: ['get bond back', 'final inspection checklist', 'rental bond Australia', 'end of lease tips'],
    sections: [
      { paragraphs: ['Your bond is usually four weeks’ rent — too much to lose over a missed oven or a dusty skirting board. The good news: passing the final inspection is mostly about knowing what property managers actually check.'] },
      { heading: 'Start with your entry condition report', paragraphs: ['Your goal is to return the property to its condition at move-in, minus fair wear and tear. Pull out the entry condition report and photos you were given at the start of the lease and use them as your benchmark for every room.'] },
      { heading: 'The areas inspectors check first', bullets: ['Oven, rangehood and stovetop — the #1 reason bonds get docked', 'Inside cupboards, drawers and wardrobes', 'Bathroom grout, glass, exhaust fans and behind the toilet', 'Skirting boards, window tracks, light switches and door frames', 'Carpets (steam-cleaned if you had pets or it’s in the lease)', 'Walls — marks and scuffs', 'Outside: balcony, garage, and the letterbox'] },
      { heading: 'When to call in a professional', paragraphs: ['If you’re short on time or the lease requires a professional vacate clean with a receipt, booking a bond clean with a re-clean guarantee removes the risk entirely. If the agent flags anything, the cleaner returns free of charge — and you keep your bond.'] },
    ],
  },
  {
    slug: 'move-out-cleaning-guide',
    title: 'Move-Out Cleaning Guide: Leave Your Rental Spotless',
    excerpt: 'A practical, room-by-room plan to clean your place on moving day without losing your mind (or your bond).',
    date: '2026-05-04',
    readTime: '6 min read',
    category: 'End of Lease',
    keywords: ['move out cleaning', 'moving day cleaning', 'rental cleaning checklist', 'vacate cleaning'],
    sections: [
      { paragraphs: ['Moving is stressful enough without scrubbing floors at midnight. The trick is to clean in the right order — top to bottom, back to front — so you’re never re-dirtying a finished room.'] },
      { heading: 'Clean in this order', bullets: ['Empty every room completely first — you can’t clean around boxes', 'Dust high to low: light fittings, shelves, then surfaces, then floors', 'Kitchen and bathrooms last (they take the longest)', 'Work from the back of the home toward the front door', 'Floors are the final step in every room'] },
      { heading: 'Don’t forget these', paragraphs: ['The spots that cost renters their bond are almost always the same: the oven, the rangehood filter, inside the dishwasher and washing machine seals, window tracks, and the exhaust fans. Build them into your plan from the start.'] },
      { heading: 'Short on time?', paragraphs: ['If your move-out and clean fall on the same day, a professional end-of-lease team can clean an empty property in a few hours while you focus on the move — and hand you a receipt for the agent.'] },
    ],
  },
  {
    slug: 'oven-cleaning-guide',
    title: 'How to Deep-Clean an Oven & Rangehood (or Skip It)',
    excerpt: 'A step-by-step method for the dirtiest job in the kitchen — and when it’s worth handing over.',
    date: '2026-04-26',
    readTime: '5 min read',
    category: 'Cleaning Tips',
    keywords: ['how to clean oven', 'rangehood cleaning', 'oven cleaning bond', 'kitchen deep clean'],
    sections: [
      { paragraphs: ['The oven is the single most-checked item at a final inspection, and the most dreaded DIY clean. Here’s a method that does most of the work for you while you get on with something else.'] },
      { heading: 'The overnight paste method', bullets: ['Remove racks and soak them in hot, soapy water', 'Mix bicarb soda with a little water into a spreadable paste', 'Coat the inside of the oven (avoid the heating elements) and leave overnight', 'Wipe out with a damp cloth, spray stubborn spots with vinegar', 'Clean the door glass last with a scraper for baked-on grime'] },
      { heading: 'Don’t forget the rangehood', paragraphs: ['Pop the metal filters in the dishwasher or soak them in hot water with a degreaser. A greasy rangehood filter is an easy mark-down at inspection that takes ten minutes to fix.'] },
      { heading: 'When to skip it', paragraphs: ['Self-cleaning ovens, pyrolytic models and badly neglected ovens are often faster and safer to hand to a professional, who uses commercial degreasers and won’t risk damaging the seals or elements.'] },
    ],
  },
  {
    slug: 'carpet-cleaning-bond',
    title: 'Do You Need Professional Carpet Cleaning for Your Bond?',
    excerpt: 'When carpet steam cleaning is required at the end of a lease — and when a vacuum is enough.',
    date: '2026-04-18',
    readTime: '5 min read',
    category: 'End of Lease',
    keywords: ['carpet cleaning bond', 'end of lease carpet cleaning', 'steam cleaning rental', 'do I need carpet cleaning bond'],
    sections: [
      { paragraphs: ['Whether you legally need professional carpet cleaning to get your bond back is one of the most common rental questions in Australia. The answer comes down to your lease and your pets.'] },
      { heading: 'Check your lease first', paragraphs: ['Many leases include a clause requiring professional carpet steam cleaning at the end of the tenancy, sometimes with a receipt. In most states an agent can’t demand it unless it’s reasonable — but if you had pets, expect it to be required.'] },
      { heading: 'When steam cleaning is worth it anyway', bullets: ['You had pets (odour and hair are inspection red flags)', 'Visible stains or heavy traffic marks', 'The lease specifies professional cleaning with proof', 'The carpets were professionally cleaned at move-in'] },
      { heading: 'Bundling it with your bond clean', paragraphs: ['Booking carpet steam cleaning together with your end-of-lease clean is usually cheaper than arranging both separately, and it means one team and one receipt for the agent.'] },
    ],
  },
  {
    slug: 'eco-friendly-cleaning',
    title: 'Eco-Friendly Cleaning That Actually Works',
    excerpt: 'Greener products and habits that get a genuinely clean home without harsh chemicals.',
    date: '2026-04-10',
    readTime: '5 min read',
    category: 'Cleaning Tips',
    keywords: ['eco friendly cleaning', 'green cleaning products', 'natural cleaning', 'non toxic cleaning Australia'],
    sections: [
      { paragraphs: ['“Eco-friendly” doesn’t have to mean “doesn’t work”. A few proven natural staples handle the vast majority of household cleaning without the fumes, and they’re safer around kids and pets.'] },
      { heading: 'The natural cleaning kit', bullets: ['White vinegar — glass, taps, kettle descaling, hard water', 'Bicarb soda — scouring, ovens, deodorising', 'Castile or plant-based soap — floors and general surfaces', 'Microfibre cloths — less product, more pickup', 'Lemon and essential oils — natural freshening'] },
      { heading: 'What to still use specialist products for', paragraphs: ['Disinfecting toilets, mould, and heavy grease sometimes need a targeted product. Look for plant-based, biodegradable formulas and ventilate the room — “green” still means reading the label.'] },
      { heading: 'Greener habits, not just products', paragraphs: ['The biggest environmental win is using less: dose correctly, use washable cloths instead of paper towel, and clean regularly so grime never builds up enough to need heavy chemicals.'] },
    ],
  },
  {
    slug: 'office-cleaning-frequency',
    title: 'How Often Should You Clean Your Office? An SMB Guide',
    excerpt: 'Set the right commercial cleaning schedule for a healthy, professional workplace — without overspending.',
    date: '2026-04-02',
    readTime: '6 min read',
    category: 'Commercial',
    keywords: ['office cleaning frequency', 'commercial cleaning schedule', 'how often clean office', 'office cleaning Australia'],
    sections: [
      { paragraphs: ['Clean offices aren’t just about appearances — they reduce sick days and signal professionalism to clients. The right frequency depends on headcount, foot traffic and the type of space.'] },
      { heading: 'A sensible baseline', bullets: ['Daily: kitchens, bathrooms, bins and high-touch points in busy offices', 'Weekly: vacuuming, mopping, desk and surface wipe-downs', 'Fortnightly: lower-traffic or small teams (under ~10 people)', 'Monthly/quarterly: windows, carpets, deep cleans'] },
      { heading: 'High-touch points matter most', paragraphs: ['Door handles, lift buttons, shared keyboards, kitchen taps and bathroom surfaces carry the most germs. Even on a light schedule, these should be disinfected frequently to keep your team healthy.'] },
      { heading: 'Match the schedule to your space', paragraphs: ['A 30-person open-plan office with daily client visits needs more than a quiet two-person studio. A good commercial cleaner will walk your space and recommend a schedule that fits your budget rather than selling you a fixed package.'] },
    ],
  },
  {
    slug: 'ndis-aged-care-cleaning',
    title: 'NDIS & Aged-Care Cleaning Support, Explained',
    excerpt: 'How domestic cleaning assistance works for participants and families, and what to look for in a provider.',
    date: '2026-03-25',
    readTime: '5 min read',
    category: 'Guides',
    keywords: ['NDIS cleaning', 'aged care cleaning', 'domestic assistance cleaning', 'disability support cleaning'],
    sections: [
      { paragraphs: ['Regular domestic cleaning can be part of the support that helps people stay independent and safe at home. Here’s a plain-English overview of how cleaning assistance typically works for NDIS participants and older Australians.'] },
      { heading: 'What domestic assistance usually covers', bullets: ['Routine cleaning of kitchens, bathrooms and living areas', 'Floors, dusting and surface sanitising', 'Laundry and linen changes where included', 'Regular recurring visits for consistency'] },
      { heading: 'What to look for in a provider', paragraphs: ['Consistency and trust matter most: the same vetted, police-checked cleaner each visit, clear communication, and reliable scheduling. A backup model means a visit still happens even if your regular cleaner is unwell.'] },
      { heading: 'Getting started', paragraphs: ['Talk to your plan manager or support coordinator about how domestic assistance fits your plan, then look for a provider who can commit to a regular day and a familiar face. We’re happy to discuss recurring support — just get in touch.'] },
    ],
  },
  {
    slug: 'spring-cleaning-checklist',
    title: 'The Ultimate Spring Cleaning Checklist (Room by Room)',
    excerpt: 'A complete, printable-style checklist to reset your whole home one room at a time.',
    date: '2026-03-17',
    readTime: '7 min read',
    category: 'Cleaning Tips',
    keywords: ['spring cleaning checklist', 'deep cleaning checklist', 'house cleaning checklist', 'home reset'],
    sections: [
      { paragraphs: ['Spring cleaning is really about the jobs that don’t make it into the weekly routine. Tackle one room at a time and you’ll get the satisfaction of a genuine reset without a lost weekend.'] },
      { heading: 'Kitchen', bullets: ['Degrease the oven, rangehood and splashback', 'Clean inside the fridge, freezer and dishwasher', 'Wipe out and reline cupboards and the pantry', 'Descale the kettle and clean small appliances'] },
      { heading: 'Bathrooms', bullets: ['Treat grout and silicone for mould', 'Descale showerheads and taps', 'Clean exhaust fans and wash bath mats', 'Clear out and wipe down the cabinet'] },
      { heading: 'Bedrooms & living', bullets: ['Wash or air doonas, pillows and mattress protectors', 'Dust skirting boards, blinds, fans and light fittings', 'Vacuum under beds and lounges', 'Wipe walls, switches and door frames'] },
      { heading: 'Keep it that way', paragraphs: ['Once your home’s been reset, a recurring fortnightly clean keeps it there with far less effort — build-up never returns, so each visit stays quick.'] },
    ],
  },
  {
    slug: 'recurring-cleaning-benefits',
    title: '7 Reasons a Recurring Cleaner Is Worth It',
    excerpt: 'Why a regular weekly or fortnightly clean often costs less per visit — and gives you your weekends back.',
    date: '2026-03-09',
    readTime: '5 min read',
    category: 'Recurring',
    keywords: ['recurring cleaning', 'regular house cleaner', 'weekly cleaning benefits', 'fortnightly cleaning'],
    sections: [
      { paragraphs: ['A one-off clean fixes today; a recurring clean changes how your home feels all the time. Here’s why so many households switch to a regular cleaner — and never go back.'] },
      { heading: 'The seven benefits', bullets: ['Lower cost per visit — a maintained home cleans faster', 'The same trusted cleaner who learns your home', 'Your weekends back — no more chores marathon', 'A consistently healthy, low-allergen space', 'Less wear from built-up grime over time', 'Guests are never a panic', 'One predictable line in the budget'] },
      { heading: 'Weekly or fortnightly?', paragraphs: ['Busy households with pets or kids tend to prefer weekly; couples and smaller homes often do well fortnightly. With no lock-in contract you can switch any time as the seasons (and the mess) change.'] },
      { heading: 'Backup that means it always happens', paragraphs: ['The point of a recurring clean is reliability. A backup model means that even if your regular cleaner is unwell, your visit still goes ahead — and if we ever miss it, you’re automatically credited.'] },
    ],
  },
  {
    slug: 'pre-sale-cleaning-guide',
    title: 'Pre-Sale Cleaning: Make Your Home Inspection-Ready',
    excerpt: 'How a deep clean before listing helps your property photograph and present better to buyers.',
    date: '2026-03-01',
    readTime: '5 min read',
    category: 'Guides',
    keywords: ['pre sale cleaning', 'cleaning before selling house', 'home staging clean', 'property presentation'],
    sections: [
      { paragraphs: ['Buyers form an impression in seconds, and the camera is unforgiving. A thorough pre-sale clean is one of the cheapest ways to lift how your property presents — both online and at the open home.'] },
      { heading: 'Focus on what buyers notice', bullets: ['Sparkling windows and glass — they make rooms feel bigger and brighter', 'Spotless kitchens and bathrooms — the rooms that sell homes', 'Streak-free floors and fresh-smelling carpets', 'Decluttered, dust-free surfaces for photography', 'Tidy entryways and outdoor areas for kerb appeal'] },
      { heading: 'Time it with your photos', paragraphs: ['Book the deep clean just before your listing photos and first open home, so the property looks its absolute best when it matters most. A maintenance clean between inspections keeps it that way.'] },
      { heading: 'Leave it to a team', paragraphs: ['Selling is busy. A professional pre-sale clean handles the detail — light fittings, skirting boards, glass and grout — so you can focus on the move and the campaign.'] },
    ],
  },
]

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
