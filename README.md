# ISP Checker — Which dev services is your ISP blocking?

> Real-time crowdsourced connectivity tracker for Indian developers

**Live:** https://isp-checker.vercel.app · **Built by** [@saasbyMohd](https://x.com/saasbyMohd)

---

## The Problem

Indian developers often can't connect to backend services like Supabase, Firebase, or Railway — and have no way to tell if it's their ISP, their config, or the service itself. This tool answers that question with real data from real developers.

## How It Works

1. Visit the site and click **"Check My Connection"**
2. Your browser silently tests 10 backend services in parallel (≤5 seconds)
3. Results are submitted anonymously to the server
4. The server detects your ISP and stores results in Supabase
5. The live dashboard updates for everyone in real time

```
Browser → fetch() 10 services (no-cors, 5s timeout)
        → POST /api/submit
        → Server: ISP lookup + SHA-256 IP hash + Supabase insert
        → Supabase Realtime → Dashboard updates everywhere
```

**Key design:** The browser never writes to Supabase directly — only the server does. So even if your ISP blocks Supabase, your results still get stored.

## Services Tested

| Service | URL |
|---|---|
| Supabase | https://supabase.co |
| Firebase | https://firebase.googleapis.com |
| MongoDB Atlas | https://cloud.mongodb.com |
| AWS S3 | https://s3.amazonaws.com |
| Neon | https://neon.tech |
| PlanetScale | https://planetscale.com |
| Railway | https://railway.app |
| Render | https://render.com |
| Cloudflare | https://cloudflare.com |
| GitHub | https://github.com |

## Tech Stack

- **Frontend & API:** Next.js 16 (App Router, TypeScript)
- **Database:** Supabase (Postgres + Realtime)
- **Hosting:** Vercel
- **ISP detection:** ip-api.com (free, no auth)
- **Styling:** Tailwind CSS v4

## Privacy

- Raw IPs are **never stored** — only a SHA-256 hash (irreversible)
- No accounts, no login, no cookies, no tracking pixels
- All data is anonymous and aggregated
- Rate limited to 1 check per IP per hour

## Running Locally

**1. Clone the repo**
```bash
git clone https://github.com/Mohammad2460/isp-checker.git
cd isp-checker
npm install
```

**2. Set up Supabase**

Create a project at [supabase.com](https://supabase.com) and run the migration:
```bash
# In the Supabase SQL editor, run:
supabase/migrations/001_initial.sql
```

**3. Add environment variables**

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**4. Run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx              ← Main page (checker + dashboard)
├── layout.tsx            ← Root layout + OG metadata
└── api/
    ├── submit/route.ts   ← POST: receive + store check results
    └── stats/route.ts    ← GET: aggregated stats
components/
├── ServiceChecker.tsx    ← Check button + service cards
├── ServiceCard.tsx       ← Individual card (idle/checking/ok/blocked)
├── LiveDashboard.tsx     ← Stats table with Realtime subscription
└── ISPFilter.tsx         ← ISP filter dropdown
lib/
├── services.ts           ← List of services to test
├── supabase.ts           ← Supabase client (browser + server)
└── detect.ts             ← Parallel fetch test logic
supabase/
└── migrations/
    └── 001_initial.sql   ← Tables, view, RLS policies
```

## Database Schema

```sql
-- Stores one row per service per check run
checks (id, created_at, ip_hash, isp, city, state,
        service_name, service_url, is_blocked, response_time_ms)

-- Rate limiting: 1 check per IP per hour
rate_limits (ip_hash, last_check_at)

-- Aggregated view (last 24 hours)
service_isp_stats (service_name, isp, total_checks,
                   blocked_count, blocked_pct, last_checked)
```

## Deploying Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mohammad2460/isp-checker)

Add the three environment variables during setup and you're live.
