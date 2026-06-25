interface TestimonialProps {
  name: string
  suburb: string
  rating: number
  text: string
  service: string
}

export default function TestimonialCard({ name, suburb, rating, text, service }: TestimonialProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg card-hover">
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-amber-400 text-lg">★</span>
        ))}
      </div>
      <p className="text-[#172434] text-sm leading-relaxed mb-6 italic">"{text}"</p>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-[#172434] text-sm">{name}</div>
          <div className="text-[#5F6E78] text-xs">{suburb}</div>
        </div>
        <span className="text-xs bg-[#EBF3F9] text-[#172434] px-3 py-1 rounded-full font-medium">{service}</span>
      </div>
    </div>
  )
}
