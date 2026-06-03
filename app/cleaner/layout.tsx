import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/auth'

export default async function CleanerLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireStaff()
  if (!auth.ok) redirect('/login?redirectTo=/cleaner')
  return <>{children}</>
}
