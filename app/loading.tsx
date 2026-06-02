export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1C2B3A 0%, #2C4A6E 100%)' }}>
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-white/80 animate-spin" />
          <div className="absolute inset-2 rounded-full" style={{ background: 'linear-gradient(135deg, #2C4A6E, #4A7FA5)' }} />
        </div>
        <div className="text-white font-semibold text-lg">Clean&amp;Go</div>
        <div className="text-white/40 text-sm mt-1">Loading...</div>
      </div>
    </div>
  )
}
