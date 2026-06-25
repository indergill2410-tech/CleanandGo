'use client'
import Link from 'next/link'

interface ServiceCardProps {
  icon: string
  title: string
  description: string
  tag?: string
  tagColor?: string
  features: string[]
  highlight?: boolean
}

export default function ServiceCard({ icon, title, description, tag, tagColor, features, highlight }: ServiceCardProps) {
  return (
    <div className={`relative rounded-3xl p-8 card-hover cursor-pointer ${
      highlight
        ? 'gradient-cta text-white shadow-2xl scale-105'
        : 'bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg'
    }`}>
      {tag && (
        <span className={`absolute top-6 right-6 text-xs font-bold px-3 py-1 rounded-full ${
          highlight ? 'bg-white/20 text-white' : `${tagColor} text-white`
        }`}>{tag}</span>
      )}

      <div className="text-4xl mb-4">{icon}</div>
      <h3 className={`text-xl font-bold mb-2 ${
        highlight ? 'text-white' : 'text-[#172434]'
      }`}>{title}</h3>
      <p className={`text-sm mb-6 leading-relaxed ${
        highlight ? 'text-white/80' : 'text-[#5F6E78]'
      }`}>{description}</p>

      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className={`text-sm flex items-center gap-2 ${
            highlight ? 'text-white/90' : 'text-[#172434]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              highlight ? 'bg-white' : 'bg-[#2F7D6B]'
            }`} />
            {f}
          </li>
        ))}
      </ul>

      <div className="flex items-end justify-between">
        <div>
          <div className={`text-xs mb-1 ${
            highlight ? 'text-white/70' : 'text-[#5F6E78]'
          }`}>Pricing</div>
          <div className={`text-lg font-bold ${
            highlight ? 'text-white' : 'text-[#172434]'
          }`}>Custom quote</div>
        </div>
        <Link
          href="/customer/book"
          className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all ${
            highlight
              ? 'bg-white text-[#172434] hover:bg-white/90'
              : 'bg-[#172434] text-white hover:bg-[#2F7D6B]'
          }`}
        >Get a quote →</Link>
      </div>
    </div>
  )
}
