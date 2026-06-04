// The cleanngo sparkle mark. Inherits color via `currentColor`, so set the
// text color on the parent (e.g. text-white inside the gradient tile).
export default function BrandMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <path d="M50 6 Q57 43 94 50 Q57 57 50 94 Q43 57 6 50 Q43 43 50 6 Z" />
    </svg>
  )
}
