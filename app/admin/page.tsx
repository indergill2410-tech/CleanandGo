'use client'
import { useState } from 'react'
import StatCard from '@/components/StatCard'

const KANBAN = {
  Pending:    [{ id:'1', address:'42 Chapel St', service:'Recurring',    time:'9:00 AM', cleaner:'Alex' }],
  Confirmed:  [{ id:'2', address:'18 Bridge Rd', service:'End of Lease', time:'11:00 AM',cleaner:'Mia'  }],
  'In Progress': [{ id:'3', address:'7 Flinders Ln', service:'One-Off',  time:'1:00 PM', cleaner:'Tom'  }],
  Completed:  [{ id:'4', address:'55 Toorak Rd',  service:'Recurring',   time:'Done',    cleaner:'Alex' }],
}

const STAFF = [
  { name: 'Alex Chen',   jobs: 3, hours: 18, status: 'active',   avatar: 'A' },
  { name: 'Mia Patel',   jobs: 2, hours: 12, status: 'active',   avatar: 'M' },
  { name: 'Tom Wright',  jobs: 1, hours: 6,  status: 'active',   avatar: 'T' },
  { name: 'Sara Lee',    jobs: 0, hours: 0,  status: 'inactive', avatar: 'S' },
]

const STATUS_COLORS: Record<string, string> = {
  Pending:      'border-amber-400/50 bg-amber-50/10',
  Confirmed:    'border-blue-400/50 bg-blue-50/10',
  'In Progress':'border-purple-400/50 bg-purple-50/10',
  Completed:    'border-green-400/50 bg-green-50/10',
}

const STATUS_DOT: Record<string, string> = {
  Pending: 'bg-amber-400', Confirmed: 'bg-blue-400', 'In Progress': 'bg-purple-400', Completed: 'bg-green-400',
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'board' | 'staff' | 'payroll'>('board')

  return (
    <div className="min-h-screen" style={{ background: '#F5F0EB' }}>
      {/* Top nav */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E8E0D8] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-[#1C2B3A]">Clean&amp;Go Admin</span>
          </div>
          <div className="flex gap-2">
            {(['board', 'staff', 'payroll'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'gradient-cta text-white'
                    : 'text-[#7A8A96] hover:bg-[#EBF0F5]'
                }`}
              >{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" value="6" label="Jobs Today" trend="+2" trendUp />
          <StatCard icon="💰" value="$2,840" label="Revenue This Week" trend="+18%" trendUp />
          <StatCard icon="👥" value="3" label="Active Staff" />
          <StatCard icon="⏳" value="$640" label="Pending Payments" trend="2 jobs" />
        </div>

        {/* Board */}
        {activeTab === 'board' && (
          <div>
            <h2 className="text-lg font-bold text-[#1C2B3A] mb-4">Job Board</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {(Object.entries(KANBAN) as [string, typeof KANBAN.Pending][]).map(([col, jobs]) => (
                <div key={col} className={`rounded-2xl p-4 border-2 ${STATUS_COLORS[col]}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[col]}`} />
                    <span className="font-semibold text-[#1C2B3A] text-sm">{col}</span>
                    <span className="ml-auto text-xs text-[#7A8A96] bg-white/60 px-2 py-0.5 rounded-full">{jobs.length}</span>
                  </div>
                  <div className="space-y-3">
                    {jobs.map(job => (
                      <div key={job.id} className="bg-white/80 rounded-xl p-4 shadow-sm card-hover cursor-pointer">
                        <div className="text-[#1C2B3A] font-medium text-sm mb-1 truncate">{job.address}</div>
                        <div className="text-[#7A8A96] text-xs mb-2">{job.time} · {job.service}</div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full gradient-cta flex items-center justify-center text-white text-xs font-bold">
                            {job.cleaner[0]}
                          </div>
                          <span className="text-xs text-[#7A8A96]">{job.cleaner}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff */}
        {activeTab === 'staff' && (
          <div>
            <h2 className="text-lg font-bold text-[#1C2B3A] mb-4">Staff Roster</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {STAFF.map(s => (
                <div key={s.name} className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-white/60 shadow card-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full gradient-cta flex items-center justify-center text-white font-bold text-lg">{s.avatar}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#1C2B3A]">{s.name}</div>
                      <div className="text-[#7A8A96] text-sm">{s.jobs} jobs · {s.hours}hrs this week</div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payroll */}
        {activeTab === 'payroll' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1C2B3A]">Payroll — Week ending 6 Jun 2026</h2>
              <button className="btn-primary text-sm px-5 py-2.5">Export to Xero →</button>
            </div>
            <div className="bg-white/80 rounded-2xl border border-white/60 shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E0D8]">
                    {['Staff Member','Hours','Rate','Gross Pay','Status'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-[#7A8A96] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STAFF.filter(s => s.hours > 0).map((s, i) => (
                    <tr key={s.name} className={i % 2 === 0 ? 'bg-transparent' : 'bg-[#F5F0EB]/50'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-cta flex items-center justify-center text-white text-xs font-bold">{s.avatar}</div>
                          <span className="font-medium text-[#1C2B3A] text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#1C2B3A]">{s.hours}h</td>
                      <td className="px-6 py-4 text-sm text-[#7A8A96]">$28.00/hr</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#2C4A6E]">${(s.hours * 28).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Pending export</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
