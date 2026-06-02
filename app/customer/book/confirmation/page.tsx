import Link from 'next/link'

interface Props {
  searchParams: Promise<{ service?: string; date?: string; time?: string; address?: string; total?: string; name?: string }>
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams
  const { service = 'Clean', date = '', time = '', address = '', total = '0', name = 'there' } = params

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: '#4A7FA5' }} />
      </div>
      <div className="glass-strong rounded-3xl p-10 w-full max-w-md text-center relative z-10 shadow-2xl">
        {/* Animated checkmark */}
        <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-400/50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">You're booked!</h1>
        <p className="text-white/60 mb-8">Hi {name}, your confirmation is on its way to your inbox.</p>

        {/* Booking summary */}
        <div className="bg-white/10 rounded-2xl p-6 text-left space-y-3 mb-8 border border-white/20">
          {[
            { icon: '✨', label: 'Service', value: service },
            { icon: '📅', label: 'Date', value: date },
            { icon: '🕐', label: 'Time', value: time },
            { icon: '📍', label: 'Address', value: address },
            { icon: '💰', label: 'Total', value: `$${total}` },
          ].filter(r => r.value).map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-white/50 text-sm flex items-center gap-2"><span>{row.icon}</span>{row.label}</span>
              <span className="text-white font-medium text-sm text-right max-w-[180px]">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Trust reminders */}
        <div className="flex justify-center gap-4 mb-8">
          {['🛡️ Insured', '✅ Vetted', '📸 Photo report'].map(b => (
            <span key={b} className="text-white/50 text-xs">{b}</span>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/track?id=CG-${Date.now().toString().slice(-6)}`} className="w-full py-3.5 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition text-center">
            Track My Clean →
          </Link>
          <Link href="/" className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition text-center text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
