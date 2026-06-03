'use client'
import { useEffect, useRef, useState } from 'react'

export type AddressParts = {
  line1: string
  suburb: string
  state: string
  postcode: string
}

type Suggestion = {
  label: string
  parts: AddressParts
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

type MapboxContext = {
  address?: { name?: string }
  locality?: { name?: string }
  place?: { name?: string }
  region?: { name?: string; region_code?: string }
  postcode?: { name?: string }
}
type MapboxFeature = {
  properties?: { name?: string; full_address?: string; place_formatted?: string; context?: MapboxContext }
}

function toSuggestion(f: MapboxFeature): Suggestion {
  const p = f.properties || {}
  const c = p.context || {}
  return {
    label: p.full_address || [p.name, p.place_formatted].filter(Boolean).join(', ') || p.name || '',
    parts: {
      line1: c.address?.name || p.name || '',
      suburb: c.locality?.name || c.place?.name || '',
      state: c.region?.region_code || c.region?.name || '',
      postcode: c.postcode?.name || '',
    },
  }
}

/**
 * Australia-wide address autocomplete via Mapbox. If NEXT_PUBLIC_MAPBOX_TOKEN
 * is not set, it degrades gracefully to a plain text input (no suggestions),
 * so the form keeps working until the token is added.
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing your address…',
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  onSelect: (parts: AddressParts) => void
  placeholder?: string
  className?: string
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!TOKEN || value.trim().length < 3) {
      setSuggestions([])
      return
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(value)}&country=au&autocomplete=true&types=address&limit=5&access_token=${TOKEN}`
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()
        setSuggestions((data.features || []).map(toSuggestion).filter((s: Suggestion) => s.label))
        setOpen(true)
      } catch {
        /* network error — silently fall back to manual entry */
      }
    }, 250)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [value])

  const choose = (s: Suggestion) => {
    onSelect(s.parts)
    onChange(s.parts.line1 || s.label)
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete="off"
        required
        className={className}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-[#1C2B3A] border border-white/20 rounded-xl overflow-hidden shadow-xl">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button type="button" onMouseDown={() => choose(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10">
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
