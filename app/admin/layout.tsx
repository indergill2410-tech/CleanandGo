import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin()
  if (!auth.ok && auth.status === 503) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EFF7FC] px-4 text-[#0B3558]">
        <section className="w-full max-w-md rounded-[8px] border border-[#CFE0ED] bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black">Admin dashboard unavailable</h1>
          <p className="mt-3 text-sm text-[#60798F]">
            The app could not verify admin access right now. Check the Supabase service role and project environment variables, then refresh.
          </p>
        </section>
      </main>
    )
  }
  if (!auth.ok) redirect('/login?redirectTo=/admin')
  return <>{children}</>
}
