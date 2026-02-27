import ServiceChecker from '@/components/ServiceChecker';
import LiveDashboard from '@/components/LiveDashboard';

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 space-y-3">
        <div className="inline-block rounded-full border border-indigo-800 bg-indigo-950/50 px-3 py-1 text-xs font-medium text-indigo-400">
          India · Crowdsourced · Real-time
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Which dev services is your ISP blocking?
        </h1>
        <p className="max-w-2xl text-base text-zinc-400">
          Click below to test 10 backend services from your browser. Results are anonymously
          contributed to the community dashboard so every Indian developer can see the
          connectivity landscape across ISPs.
        </p>
      </div>

      {/* Checker section */}
      <section className="mb-16">
        <ServiceChecker />
      </section>

      {/* Divider */}
      <div className="mb-10 border-t border-zinc-800" />

      {/* Dashboard section */}
      <section>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-semibold text-zinc-100">Community Dashboard</h2>
          <p className="text-sm text-zinc-500">
            Aggregated data from the last 24 hours. Updates live as new checks come in.
          </p>
        </div>
        <LiveDashboard />
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-800 pt-8 text-xs text-zinc-600">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <span>No accounts. No tracking. IPs are hashed and never stored.</span>
          <div className="flex items-center gap-3">
            <span>1 check per IP per hour to prevent spam.</span>
            <span>·</span>
            <a
              href="https://x.com/saasbyMohd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 transition-colors hover:text-zinc-300"
            >
              by @saasbyMohd
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
