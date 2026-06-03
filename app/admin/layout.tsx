import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin()
  if (!auth.ok) redirect('/login?redirectTo=/admin')
  return <>{children}</>
}
