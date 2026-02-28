import ServiceChecker from '@/components/ServiceChecker';
import LiveDashboard from '@/components/LiveDashboard';

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Hero */}
      <div className="mb-8 space-y-3 sm:mb-10">
        <div className="inline-block rounded-full border border-indigo-800 bg-indigo-950/50 px-3 py-1 text-xs font-medium text-indigo-400">
          India · Crowdsourced · Real-time
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl lg:text-4xl">
          Which dev services is your ISP blocking?
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
          Click below to test 10 backend services from your browser. Results are anonymously
          contributed to the community dashboard so every Indian developer can see the
          connectivity landscape across ISPs.
        </p>
      </div>

      {/* Checker section */}
      <section className="mb-12 sm:mb-16">
        <ServiceChecker />
      </section>

      {/* Divider */}
      <div className="mb-8 border-t border-zinc-800 sm:mb-10" />

      {/* Dashboard section */}
      <section>
        <div className="mb-5 space-y-1 sm:mb-6">
          <h2 className="text-lg font-semibold text-zinc-100 sm:text-xl">Community Dashboard</h2>
          <p className="text-xs text-zinc-500 sm:text-sm">
            Aggregated data from the last 24 hours. Updates live as new checks come in.
          </p>
        </div>
        <LiveDashboard />
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-800 pt-6 text-xs text-zinc-600 sm:mt-16 sm:pt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>No accounts. No tracking. IPs are hashed and never stored.</span>
          <div className="flex items-center gap-2">
            <span>1 check / IP / hour.</span>
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
