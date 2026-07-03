import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabasePublicConfig } from './lib/supabase/project'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // Customer login consolidated onto the single /login page (Client tab).
  if (pathname === '/account/login') {
    const url = request.nextUrl.clone()
    const rt = url.searchParams.get('redirectTo')
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('tab', 'client')
    if (rt) url.searchParams.set('redirectTo', rt)
    return NextResponse.redirect(url)
  }

  const protectedRoutes = ['/cleaner', '/admin']
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  const publicConfig = getSupabasePublicConfig()

  if (!publicConfig.ok || !publicConfig.url || !publicConfig.anonKey) {
    if (isProtected) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirectTo', pathname)
      loginUrl.searchParams.set('error', 'auth-config')
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  const supabase = createServerClient(
    publicConfig.url,
    publicConfig.anonKey,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options as Record<string, unknown>))
        },
      },
    }
  )

  // Refresh session on every request
  const { data: { user } } = await supabase.auth.getUser()

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\.svg|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
