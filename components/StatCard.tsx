interface StatCardProps {
  icon: string
  value: string
  label: string
  trend?: string
  trendUp?: boolean
}

export default function StatCard({ icon, value, label, trend, trendUp }: StatCardProps) {
  return (
    <div className="glass-strong rounded-2xl p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center text-2xl">{icon}</div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>{trend}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-[#1C2B3A] mb-1">{value}</div>
      <div className="text-[#7A8A96] text-sm">{label}</div>
    </div>
  )
}
