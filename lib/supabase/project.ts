const PLACEHOLDER_REFS = new Set(['placeholder', 'your-project-ref', 'your_supabase_project_ref'])

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
    throw new Error(
      `${context}: set NEXT_PUBLIC_SUPABASE_PROJECT_REF to ${actualRef} so this app can verify it is using the intended Supabase project.`
    )
  }

  if (actualRef !== configuredRef) {
    throw new Error(
      `${context}: Supabase URL points to ${actualRef}, but NEXT_PUBLIC_SUPABASE_PROJECT_REF is ${configuredRef}. Refusing to use the wrong project.`
    )
  }
}
