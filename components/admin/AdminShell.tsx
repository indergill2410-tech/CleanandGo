'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Mail,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  UsersRound,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navGroups = [
  {
    label: 'Today',
    items: [
      { href: '/admin', label: 'Overview', icon: BarChart3 },
      { href: '/admin/subscriptions', label: 'Recurring plans', icon: CalendarDays },
      { href: '/admin/timesheets', label: 'Timesheets', icon: ClipboardList },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/customers', label: 'Customers', icon: UsersRound },
      { href: '/admin/team', label: 'Staff', icon: UserRoundCog },
      { href: '/admin/applications', label: 'Applicants', icon: ShieldCheck },
    ],
  },
  {
    label: 'Money',
    items: [
      { href: '/admin/finance', label: 'Finance', icon: ReceiptText },
      { href: '/admin/payments', label: 'Payments', icon: CreditCard },
      { href: '/admin/invoices', label: 'Invoices', icon: FileText },
    ],
  },
  {
    label: 'Messages',
    items: [
      { href: '/admin/notifications', label: 'Updates', icon: Bell },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
      { href: '/admin/account', label: 'Admin account', icon: Home },
    ],
  },
]

const quickLinks = [
  { href: '/admin', label: 'Ops' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/team', label: 'Staff' },
  { href: '/admin/finance', label: 'Finance' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/login?tab=staff')
  }

  return (
    <main className="min-h-screen bg-[#EFF7FC] text-[#0B3558]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[292px] shrink-0 border-r border-[#CFE0ED] bg-[#E8F5FC] text-[#0B3558] lg:block">
          <div className="sticky top-0 flex h-screen flex-col px-4 py-5">
            <Link href="/admin" className="flex min-h-12 items-center gap-3 rounded-[8px] px-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#0B3558] text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-black">Cleanngo</span>
                <span className="block text-xs font-bold text-[#60798F]">Business dashboard</span>
              </span>
            </Link>

            <div className="mt-5 rounded-[8px] border border-[#CFE0ED] bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1D7ED0]">Today at a glance</p>
              <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
                <div>
                  <div className="text-2xl font-black">Ready</div>
                  <p className="mt-1 text-xs font-bold text-[#60798F]">Jobs, customers, staff, and payments stay together.</p>
                </div>
                <span className="h-3 w-3 rounded-full bg-[#7DD3FC] shadow-[0_0_24px_rgba(125,211,252,0.9)]" />
              </div>
            </div>

            <nav className="mt-5 space-y-5 overflow-y-auto pr-1">
              {navGroups.map((group) => (
                <section key={group.label}>
                  <p className="px-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#60798F]">{group.label}</p>
                  <div className="mt-2 space-y-1">
                    {group.items.map((item) => {
                      const active = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex min-h-10 items-center gap-3 rounded-[8px] px-3 text-sm font-black transition ${
                            active ? 'bg-[#0B3558] text-white shadow-sm' : 'text-[#34566E] hover:bg-white hover:text-[#0B3558]'
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {active && <ChevronRight className="ml-auto h-4 w-4" />}
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ))}
            </nav>

            <button onClick={signOut} className="mt-5 flex min-h-11 items-center gap-3 rounded-[8px] border border-[#CFE0ED] bg-white px-3 text-sm font-black text-[#60798F] hover:border-[#0B3558] hover:text-[#0B3558]">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#CFE0ED] bg-white/92 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D7ED0]">Cleanngo admin</p>
                <h1 className="text-xl font-black tracking-normal sm:text-2xl">Daily business view</h1>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex min-h-11 items-center gap-2 rounded-[8px] border border-[#CFE0ED] bg-[#F8FBFF] px-3 text-sm text-[#60798F] sm:w-[320px]">
                  <Search className="h-4 w-4" />
                  <input className="w-full bg-transparent outline-none" placeholder="Search jobs, customers, staff" />
                </label>
                <nav className="flex gap-2 overflow-x-auto">
                  {quickLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`shrink-0 rounded-[8px] px-3 py-2 text-sm font-black ${
                        pathname === item.href ? 'bg-[#0B3558] text-white' : 'border border-[#CFE0ED] bg-white text-[#0B3558]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </header>
          {children}
        </section>
      </div>
    </main>
  )
}
