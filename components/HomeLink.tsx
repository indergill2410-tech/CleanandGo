import Link from 'next/link'
import BrandMark from './BrandMark'

// A clickable cleanngo brand that always routes back to the landing page.
// Use on standalone pages that don't render the full <Navbar/>.
export default function HomeLink({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="Back to cleanngo home" className={`inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors ${className}`}>
      <span className="w-7 h-7 rounded-lg gradient-cta flex items-center justify-center text-white">
        <BrandMark className="w-4 h-4" />
      </span>
      <span className="font-bold tracking-tight">cleanngo</span>
    </Link>
  )
}
