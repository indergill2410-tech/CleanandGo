const PLACEHOLDER_REFS = new Set(['placeholder', 'your-project-ref', 'your_supabase_project_ref'])
const PUBLIC_CONFIG_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const missing = PUBLIC_CONFIG_KEYS.filter((key) => !process.env[key])

  return {
    ok: missing.length === 0,
    url,
    anonKey,
    missing,
  }
}

export function supabaseProjectRefFromUrl(url: string | undefined | null) {
  if (!url) return null

  try {
    const hostname = new URL(url).hostname
    const suffix = '.supabase.co'
    if (!hostname.endsWith(suffix)) return null

    const projectRef = hostname.slice(0, -suffix.length)
    return PLACEHOLDER_REFS.has(projectRef) ? null : projectRef
  } catch {
    return null
  }
}

export function assertSupabaseProjectUrl(url: string | undefined | null, context: string) {
  const configuredRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF
  const actualRef = supabaseProjectRefFromUrl(url)

  if (!actualRef) return

  if (!configuredRef || PLACEHOLDER_REFS.has(configuredRef)) {
    console.warn(
      `${context}: NEXT_PUBLIC_SUPABASE_PROJECT_REF is not set. Set it to ${actualRef} to enable Supabase project verification.`
    )
    return
  }

  if (actualRef !== configuredRef) {
    throw new Error(
      `${context}: Supabase URL points to ${actualRef}, but NEXT_PUBLIC_SUPABASE_PROJECT_REF is ${configuredRef}. Refusing to use the wrong project.`
    )
  }
}
