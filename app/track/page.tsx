'use client'
import { useState, useEffect } from 'react'

const STAGES = [
  { id: 'confirmed',  icon: '✅', label: 'Booking Confirmed',  sub: 'Your clean is locked in' },
  { id: 'assigned',   icon: '👤', label: 'Cleaner Assigned',   sub: 'Alex Chen is on your job' },
  { id: 'ontheway',   icon: '🚗', label: 'On The Way',         sub: 'Arriving in ~15 minutes' },
  { id: 'cleaning',   icon: '🧹', label: 'Cleaning Now',       sub: 'Your home is being cleaned' },
  { id: 'done',       icon: '✨', label: 'All Done!',           sub: 'Photos sent to your email' },
]

export default function TrackPage() {
  const [currentStage, setCurrentStage] = useState(2)

  // Demo: auto-advance through stages
  useEffect(() => {
    if (currentStage < STAGES.length - 1) {
      const t = setTimeout(() => setCurrentStage(s => s + 1), 4000)
      return () => clearTimeout(t)
    }
  }, [currentStage])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#7BA7C7' }} />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#4A7FA5' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-white/60 text-sm mb-1">Booking #CG-20260603</div>
          <h1 className="text-2xl font-bold text-white">Track Your Clean</h1>
        </div>

        {/* Cleaner card */}
        <div className="glass-strong rounded-3xl p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full gradient-cta flex items-center justify-center text-3xl mx-auto mb-4">👤</div>
          <div className="text-white font-bold text-lg">Alex Chen</div>
          <div className="text-white/60 text-sm">Your cleaner · 4.9★ · 127 cleans</div>
          {currentStage >= 2 && (
            <div className="mt-4 animate-pulse-soft">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {STAGES[currentStage].sub}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="glass rounded-3xl p-6">
          <div className="space-y-0">
            {STAGES.map((stage, i) => {
              const isPast    = i < currentStage
              const isCurrent = i === currentStage
              const isFuture  = i > currentStage
              return (
                <div key={stage.id} className="flex gap-4">
                  {/* Line + dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all duration-500 ${
                      isPast    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                      : isCurrent ? 'gradient-cta ring-4 ring-white/30 shadow-xl'
                      : 'bg-white/10'
                    }`}>
                      {isPast ? '✓' : stage.icon}
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`w-0.5 h-8 my-1 transition-all duration-500 ${
                        isPast ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="pb-6">
                    <div className={`font-semibold text-sm transition-all ${
                      isCurrent ? 'text-white' : isPast ? 'text-white/70' : 'text-white/30'
                    }`}>{stage.label}</div>
                    {(isCurrent || isPast) && (
                      <div className={`text-xs mt-0.5 ${
                        isCurrent ? 'text-white/70' : 'text-white/40'
                      }`}>{stage.sub}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Before/After — shown when done */}
        {currentStage === STAGES.length - 1 && (
          <div className="mt-6 glass rounded-3xl p-6 animate-fade-up">
            <div className="text-white font-semibold mb-4 text-center">Before &amp; After</div>
            <div className="grid grid-cols-2 gap-3">
              {['Before', 'After'].map(label => (
                <div key={label} className="bg-white/10 rounded-2xl aspect-square flex flex-col items-center justify-center border border-white/20">
                  <div className="text-3xl mb-2">{label === 'Before' ? '🏚️' : '✨'}</div>
                  <div className="text-white/50 text-xs">{label}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 rounded-xl bg-white text-[#2C4A6E] font-bold hover:bg-white/90 transition">
              ⭐ Leave a Review
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
