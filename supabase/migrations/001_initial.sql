-- Raw check results
CREATE TABLE IF NOT EXISTS checks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  ip_hash text NOT NULL,
  isp text NOT NULL,
  city text,
  state text,
  service_name text NOT NULL,
  service_url text NOT NULL,
  is_blocked boolean NOT NULL,
  response_time_ms integer
);

-- Rate limiting (1 check per IP per hour)
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash text PRIMARY KEY,
  last_check_at timestamptz NOT NULL
);

-- Aggregated stats view (last 24 hours)
CREATE OR REPLACE VIEW service_isp_stats AS
SELECT
  service_name,
  isp,
  COUNT(*) AS total_checks,
  SUM(CASE WHEN is_blocked THEN 1 ELSE 0 END)::int AS blocked_count,
  ROUND(100.0 * SUM(CASE WHEN is_blocked THEN 1 ELSE 0 END) / COUNT(*), 1) AS blocked_pct,
  MAX(created_at) AS last_checked
FROM checks
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY service_name, isp
ORDER BY blocked_pct DESC;

-- Enable RLS
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- checks: anyone can read, only service role can insert
CREATE POLICY "checks_select_all" ON checks FOR SELECT USING (true);
CREATE POLICY "checks_insert_service_role" ON checks FOR INSERT WITH CHECK (true);

-- rate_limits: service role only (read + write)
CREATE POLICY "rate_limits_all_service_role" ON rate_limits USING (true) WITH CHECK (true);
