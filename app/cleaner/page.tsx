export default function CleanerPortal() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-brand-700 mb-2">Cleaner Portal</h1>
        <p className="text-gray-500 mb-8">View your assigned jobs and submit completions.</p>
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
          <p>Login required. Supabase Auth integration coming in Phase 2.</p>
        </div>
      </div>
    </main>
  )
}
