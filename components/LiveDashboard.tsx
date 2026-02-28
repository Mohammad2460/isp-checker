'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import ISPFilter from './ISPFilter';

interface ServiceStatRow {
  service_name: string;
  total_checks: number;
  blocked_count: number;
  blocked_pct: number;
  last_checked: string;
}

interface IspStatRow {
  service_name: string;
  isp: string;
  total_checks: number;
  blocked_count: number;
  blocked_pct: number;
  last_checked: string;
}

type Tab = 'service' | 'isp';

function BlockedBadge({ pct }: { pct: number }) {
  if (pct >= 50)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-950 px-2 py-0.5 text-xs font-medium text-red-400">
        🔴 {pct}%
      </span>
    );
  if (pct >= 10)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-950 px-2 py-0.5 text-xs font-medium text-yellow-400">
        🟡 {pct}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-xs font-medium text-emerald-400">
      🟢 {pct}%
    </span>
  );
}

function BlockedBar({ pct }: { pct: number }) {
  const color = pct >= 50 ? 'bg-red-500' : pct >= 10 ? 'bg-yellow-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-700 sm:w-28">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-zinc-400">{pct}%</span>
    </div>
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

function EmptyState() {
  return (
    <div className="py-10 text-center text-sm text-zinc-500">
      No data yet — be the first to check your connection!
    </div>
  );
}

function LoadingState() {
  return (
    <div className="py-10 text-center text-sm text-zinc-500">Loading...</div>
  );
}

export default function LiveDashboard() {
  const [serviceStats, setServiceStats] = useState<ServiceStatRow[]>([]);
  const [ispStats, setIspStats] = useState<IspStatRow[]>([]);
  const [totalChecks, setTotalChecks] = useState(0);
  const [selectedIsp, setSelectedIsp] = useState('');
  const [isps, setIsps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('service');

  const fetchStats = useCallback(async (isp = '') => {
    const params = isp ? `?isp=${encodeURIComponent(isp)}` : '';
    const res = await fetch(`/api/stats${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setServiceStats(data.serviceStats ?? []);
    setIspStats(data.ispStats ?? []);
    setTotalChecks(data.totalChecks ?? 0);
    if (!isp) {
      const unique = [...new Set((data.ispStats as IspStatRow[]).map((r) => r.isp))].sort();
      setIsps(unique);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(selectedIsp); }, [selectedIsp, fetchStats]);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel('checks-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'checks' }, () => {
        fetchStats(selectedIsp);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedIsp, fetchStats]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-zinc-400">
          <span className="font-semibold text-zinc-200">{totalChecks.toLocaleString()}</span>{' '}
          checks in the last 24 hours
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            live
          </span>
        </div>
        {tab === 'isp' && (
          <ISPFilter isps={isps} selected={selectedIsp} onChange={setSelectedIsp} />
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1">
        <button
          onClick={() => setTab('service')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'service'
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          By Service
        </button>
        <button
          onClick={() => setTab('isp')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'isp'
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          By ISP
        </button>
      </div>

      {/* By Service tab — always 10 rows */}
      {tab === 'service' && (
        <div className="rounded-lg border border-zinc-700 overflow-hidden">
          {loading ? (
            <LoadingState />
          ) : serviceStats.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="block sm:hidden divide-y divide-zinc-800">
                {serviceStats.map((row) => (
                  <div key={row.service_name} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{row.service_name}</div>
                      <div className="mt-1 text-xs text-zinc-500">{row.total_checks} checks · {timeAgo(row.last_checked)}</div>
                    </div>
                    <BlockedBadge pct={Number(row.blocked_pct)} />
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="border-b border-zinc-700 bg-zinc-800/80">
                    <th className="px-4 py-3 text-left font-medium text-zinc-400">Service</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-400">Blocked rate</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-400">Reports</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-400">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {serviceStats.map((row) => (
                    <tr key={row.service_name} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-200">{row.service_name}</td>
                      <td className="px-4 py-3"><BlockedBar pct={Number(row.blocked_pct)} /></td>
                      <td className="px-4 py-3 text-zinc-400">{row.total_checks}</td>
                      <td className="px-4 py-3 text-zinc-500">{timeAgo(row.last_checked)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* By ISP tab */}
      {tab === 'isp' && (
        <div className="rounded-lg border border-zinc-700 overflow-hidden">
          {loading ? (
            <LoadingState />
          ) : ispStats.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="block sm:hidden divide-y divide-zinc-800">
                {ispStats.map((row, i) => (
                  <div key={`${row.service_name}-${row.isp}-${i}`} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-200">{row.service_name}</span>
                      <BlockedBadge pct={Number(row.blocked_pct)} />
                    </div>
                    <div className="mt-1 truncate text-xs text-zinc-500">{row.isp}</div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <table className="hidden w-full text-sm sm:table">
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
                  {ispStats.map((row, i) => (
                    <tr key={`${row.service_name}-${row.isp}-${i}`} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-200">{row.service_name}</td>
                      <td className="px-4 py-3 text-zinc-400">{row.isp}</td>
                      <td className="px-4 py-3"><BlockedBadge pct={Number(row.blocked_pct)} /></td>
                      <td className="px-4 py-3 text-zinc-400">{row.total_checks}</td>
                      <td className="px-4 py-3 text-zinc-500">{timeAgo(row.last_checked)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
