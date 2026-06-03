import { redirect } from 'next/navigation'

// Consolidated onto the single /login page (Client tab).
export default async function AccountLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams
  const qs = new URLSearchParams({ tab: 'client' })
  if (redirectTo) qs.set('redirectTo', redirectTo)
  redirect(`/login?${qs.toString()}`)
}
