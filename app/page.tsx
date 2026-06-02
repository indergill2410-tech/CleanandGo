import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-600 text-white py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Clean&Go</h1>
        <p className="text-xl mb-8 opacity-90">
          Professional cleaning services in Melbourne — recurring, one-off &amp; end-of-lease.
        </p>
        <Link
          href="/customer/book"
          className="bg-white text-brand-700 font-semibold px-8 py-4 rounded-full text-lg hover:bg-brand-50 transition"
        >
          Get an Instant Quote
        </Link>
      </section>

      {/* Services */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Recurring Clean', desc: 'Weekly or fortnightly home cleaning. Lock in your schedule and save 10%.', price: 'From $120' },
            { title: 'One-Off Clean', desc: 'Deep clean for any occasion. No commitment required.', price: 'From $180' },
            { title: 'End of Lease', desc: 'Bond-back guaranteed clean. Real estate agent approved checklist.', price: 'From $400' },
          ].map((s) => (
            <div key={s.title} className="border rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-600 mb-4">{s.desc}</p>
              <span className="text-brand-600 font-bold text-lg">{s.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to book?</h2>
        <Link
          href="/customer/book"
          className="bg-brand-600 text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-brand-700 transition"
        >
          Book Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Clean&amp;Go. Melbourne, VIC. All rights reserved.
      </footer>
    </main>
  )
}
