import type { LucideIcon } from 'lucide-react'

const lensTone = {
  admin: {
    label: 'Ops lens',
    title: 'Live work map',
    surface: 'from-[#0B3558] via-[#0E4772] to-[#1D7ED0]',
    glow: 'bg-[#7DD3FC]',
    accent: 'bg-[#F5C84C]',
  },
  customer: {
    label: 'Home lens',
    title: 'Your service path',
    surface: 'from-[#0B3558] via-[#15639B] to-[#7DD3FC]',
    glow: 'bg-[#7DD3FC]',
    accent: 'bg-[#F5C84C]',
  },
  staff: {
    label: 'Work lens',
    title: 'Today route',
    surface: 'from-[#0B3558] via-[#124A76] to-[#1D7ED0]',
    glow: 'bg-[#7DD3FC]',
    accent: 'bg-emerald-300',
  },
} as const

type Tone = keyof typeof lensTone

export function DashboardPage({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={`min-h-screen bg-[#DDECF5] text-[#0B3558] ${className}`}>
      {children}
    </main>
  )
}

export function DashboardSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[8px] border border-[#B9CFDE] bg-[#F8FBFF] p-5 shadow-[0_14px_36px_rgba(11,53,88,0.08)] ${className}`}>
      {children}
    </section>
  )
}

export function RoleHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <DashboardSection>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D7ED0]">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-black tracking-normal text-[#0B3558] sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#60798F]">{description}</p>
        </div>
        {action}
      </div>
    </DashboardSection>
  )
}

export function MetricTile({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'blue',
}: {
  label: string
  value: string | number
  helper?: string
  icon: LucideIcon
  tone?: 'blue' | 'sky' | 'gold' | 'green' | 'slate' | 'red'
}) {
  const tones = {
    blue: 'bg-[#E7F3FC] text-[#1D7ED0]',
    sky: 'bg-[#E8F8FE] text-[#0B709E]',
    gold: 'bg-[#FFF7D7] text-[#9A6B00]',
    green: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-slate-100 text-slate-700',
    red: 'bg-red-50 text-red-700',
  }

  return (
    <DashboardSection className="p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-[8px] ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 text-2xl font-black tracking-normal text-[#0B3558]">{value}</div>
      <div className="mt-1 text-sm font-black text-[#0B3558]">{label}</div>
      {helper && <div className="mt-1 text-xs font-bold text-[#60798F]">{helper}</div>}
    </DashboardSection>
  )
}

export function StatusPill({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode
  tone?: 'blue' | 'gold' | 'green' | 'red' | 'slate'
}) {
  const tones = {
    blue: 'bg-[#E7F3FC] text-[#0B4F7D]',
    gold: 'bg-[#FFF4C4] text-[#7A5600]',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-black capitalize ${tones[tone]}`}>{children}</span>
}

export function RoleLens3D({
  tone,
  score,
  primary,
  secondary,
  tertiary,
}: {
  tone: Tone
  score: string | number
  primary: { label: string; value: string | number }
  secondary: { label: string; value: string | number }
  tertiary: { label: string; value: string | number }
}) {
  const theme = lensTone[tone]
  const nodes = [
    { ...primary, x: 'left-[14%]', y: 'top-[30%]', dot: theme.glow },
    { ...secondary, x: 'left-[58%]', y: 'top-[24%]', dot: theme.accent },
    { ...tertiary, x: 'left-[42%]', y: 'top-[62%]', dot: 'bg-white' },
  ]

  return (
    <div className={`relative min-h-[248px] overflow-hidden rounded-[8px] bg-gradient-to-br ${theme.surface} p-5 text-white shadow-[0_18px_42px_rgba(11,53,88,0.22)] [perspective:1000px]`}>
      <div className="absolute inset-x-8 bottom-8 top-16 rounded-[8px] border border-white/14 bg-white/[0.06] [transform:rotateX(62deg)_rotateZ(-10deg)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:34px_34px]" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#BFEFFF]">{theme.label}</p>
          <h2 className="mt-1 text-lg font-black">{theme.title}</h2>
          <div className="mt-4 text-4xl font-black tracking-normal">{score}</div>
        </div>
        <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-black text-white/80">Live</span>
      </div>
      {nodes.map((node) => (
        <div key={node.label} className={`absolute ${node.x} ${node.y} z-20 max-w-[118px]`}>
          <div className={`h-5 w-5 rounded-full ${node.dot} shadow-[0_0_28px_rgba(125,211,252,0.7)]`} />
          <div className="mt-2 rounded-[8px] border border-white/18 bg-[#0B3558]/82 px-3 py-2 shadow-xl backdrop-blur">
            <div className="text-lg font-black leading-none">{node.value}</div>
            <div className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/58">{node.label}</div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-5 left-5 right-5 z-10 grid grid-cols-3 gap-2 text-center text-xs font-black text-white/70">
        {[primary.label, secondary.label, tertiary.label].map((label) => (
          <div key={label} className="truncate rounded-[8px] bg-white/[0.09] px-2 py-2">{label}</div>
        ))}
      </div>
    </div>
  )
}
