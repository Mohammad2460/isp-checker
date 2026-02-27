'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import ISPFilter from './ISPFilter';

interface StatRow {
  service_name: string;
  isp: string;
  total_checks: number;
  blocked_count: number;
  blocked_pct: number;
  last_checked: string;
}

function BlockedBadge({ pct }: { pct: number }) {
  if (pct >= 50) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-950 px-2 py-0.5 text-xs font-medium text-red-400">
        🔴 {pct}%
      </span>
    );
  }
  if (pct >= 10) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-950 px-2 py-0.5 text-xs font-medium text-yellow-400">
        🟡 {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-xs font-medium text-emerald-400">
      🟢 {pct}%
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function LiveDashboard() {
  const [stats, setStats] = useState<StatRow[]>([]);
  const [totalChecks, setTotalChecks] = useState(0);
  const [selectedIsp, setSelectedIsp] = useState('');
  const [isps, setIsps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (isp = '') => {
    const params = isp ? `?isp=${encodeURIComponent(isp)}` : '';
    const res = await fetch(`/api/stats${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setStats(data.stats);
    setTotalChecks(data.totalChecks);

    // Derive ISP list from full unfiltered fetch
    if (!isp) {
      const unique = [...new Set((data.stats as StatRow[]).map((r) => r.isp))].sort();
      setIsps(unique);
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats(selectedIsp);
  }, [selectedIsp, fetchStats]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel('checks-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'checks' },
        () => {
          // Refetch stats when new data arrives
          fetchStats(selectedIsp);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedIsp, fetchStats]);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-zinc-400">
          <span className="font-semibold text-zinc-200">{totalChecks.toLocaleString()}</span>{' '}
          checks in the last 24 hours
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
            live
          </span>
        </div>
        <ISPFilter isps={isps} selected={selectedIsp} onChange={setSelectedIsp} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700 bg-zinc-800/80">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Service</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">ISP</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Blocked %</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Checks</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Last seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Loading...
                </td>
              </tr>
            ) : stats.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No data yet — be the first to check your connection!
                </td>
              </tr>
            ) : (
              stats.map((row, i) => (
                <tr
                  key={`${row.service_name}-${row.isp}-${i}`}
                  className="transition-colors hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 font-medium text-zinc-200">{row.service_name}</td>
                  <td className="px-4 py-3 text-zinc-400">{row.isp}</td>
                  <td className="px-4 py-3">
                    <BlockedBadge pct={Number(row.blocked_pct)} />
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{row.total_checks}</td>
                  <td className="px-4 py-3 text-zinc-500">{timeAgo(row.last_checked)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
