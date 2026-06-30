import BrandMark from '@/components/BrandMark'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B3558 0%, #0B3558 100%)' }}>
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-white/80 animate-spin" />
          <div className="absolute inset-2 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #0B3558, #1D7ED0)' }}>
            <BrandMark className="w-6 h-6" />
          </div>
        </div>
        <div className="text-white font-semibold text-lg">cleanngo</div>
        <div className="text-white/40 text-sm mt-1">Loading...</div>
      </div>
    </div>
  )
}
