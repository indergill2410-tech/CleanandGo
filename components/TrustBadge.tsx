interface TrustBadgeProps {
  icon: string
  title: string
  subtitle: string
}

export default function TrustBadge({ icon, title, subtitle }: TrustBadgeProps) {
  return (
    <div className="glass rounded-2xl p-6 text-center card-hover">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-semibold text-[#0B3558] text-sm mb-1">{title}</div>
      <div className="text-[#60798F] text-xs">{subtitle}</div>
    </div>
  )
}
