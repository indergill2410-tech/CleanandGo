import Link from 'next/link'

interface Props {
  searchParams: Promise<{ service?: string; date?: string; time?: string; address?: string; name?: string; bookingId?: string }>
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams
  const { service = 'Clean', date = '', time = '', address = '', name = 'there', bookingId = '' } = params

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: '#4A7FA5' }} />
      </div>
      <div className="glass-strong rounded-3xl p-10 w-full max-w-md text-center relative z-10 shadow-2xl">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Quote requested!</h1>
        <p className="text-white/60 mb-2">Hi {name}, we've received your job details.</p>
        <p className="text-white/40 text-sm mb-8">You'll receive a custom quote via email and in the app — usually within 60 minutes.</p>

        {/* Request summary */}
        <div className="bg-white/10 rounded-2xl p-6 text-left space-y-3 mb-6 border border-white/20">
          {[
            { icon: '✨', label: 'Service', value: service },
            { icon: '📅', label: 'Preferred date', value: date },
            { icon: '🕐', label: 'Preferred time', value: time },
            { icon: '📍', label: 'Address', value: address },
          ].filter(r => r.value).map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-white/50 text-sm flex items-center gap-2"><span>{row.icon}</span>{row.label}</span>
              <span className="text-white font-medium text-sm text-right max-w-[180px]">{row.value}</span>
            </div>
          ))}
        </div>

        {/* What happens next */}
        <div className="bg-white/5 rounded-2xl p-5 text-left mb-8 border border-white/10">
          <div className="text-white/70 font-semibold text-xs uppercase tracking-wider mb-3">What happens next</div>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Admin reviews your request', done: true },
              { step: '2', text: 'Custom quote sent to your email', done: false },
              { step: '3', text: 'You accept → job confirmed', done: false },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  item.done ? 'bg-green-500/30 text-green-300 border border-green-400/30' : 'bg-white/10 text-white/40 border border-white/20'
                }`}>{item.done ? '✓' : item.step}</div>
                <span className={`text-sm ${item.done ? 'text-white/70' : 'text-white/40'}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {bookingId && (
          <p className="text-white/30 text-xs mb-4">Reference: {bookingId}</p>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/track" className="w-full py-3.5 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition text-center">
            Track My Request →
          </Link>
          <Link href="/" className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition text-center text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
