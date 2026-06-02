export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-brand-700 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Manage jobs, staff, and payroll exports.</p>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Jobs Today', value: '0', color: 'bg-blue-50 text-blue-700' },
            { label: 'Active Staff', value: '0', color: 'bg-green-50 text-green-700' },
            { label: 'Revenue This Week', value: '$0', color: 'bg-purple-50 text-purple-700' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl p-6 ${card.color}`}>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm font-medium mt-1">{card.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
          <p>Full dispatch board and Xero payroll export — Phase 3 integration.</p>
        </div>
      </div>
    </main>
  )
}
