interface TrustBadgeProps {
  icon: string
  title: string
  subtitle: string
}

export default function TrustBadge({ icon, title, subtitle }: TrustBadgeProps) {
  return (
    <div className="glass rounded-2xl p-6 text-center card-hover">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-semibold text-[#172434] text-sm mb-1">{title}</div>
      <div className="text-[#5F6E78] text-xs">{subtitle}</div>
    </div>
  )
}
