import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { assertSupabaseProjectUrl } from './project'

type CookieItem = { name: string; value: string; options?: Record<string, unknown> }

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'

  assertSupabaseProjectUrl(url, 'Supabase server client')

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            })
          } catch {
            // Server Components cannot set cookies — safe to ignore
          }
        },
      },
    }
  )
}
