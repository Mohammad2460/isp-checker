'use client';

import { useState, useCallback } from 'react';
import ServiceCard, { CardState } from './ServiceCard';
import { SERVICES } from '@/lib/services';
import { runAllChecks } from '@/lib/detect';

interface ISPInfo {
  isp: string;
  city: string;
  state: string;
}

export default function ServiceChecker() {
  const [cardStates, setCardStates] = useState<Record<string, CardState>>(
    () => Object.fromEntries(SERVICES.map((s) => [s.name, 'idle']))
  );
  const [responseTimes, setResponseTimes] = useState<Record<string, number | null>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [ispInfo, setIspInfo] = useState<ISPInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const runCheck = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    setIspInfo(null);
    setRateLimited(false);

    setCardStates(Object.fromEntries(SERVICES.map((s) => [s.name, 'checking'])));
    setResponseTimes({});

    const results = await runAllChecks((name, result) => {
      setCardStates((prev) => ({ ...prev, [name]: result.isBlocked ? 'blocked' : 'ok' }));
      setResponseTimes((prev) => ({ ...prev, [name]: result.responseTimeMs }));
    });

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setRateLimited(true);
        setRetryAfter(data.retryAfter ?? null);
      } else if (data.success) {
        setIspInfo({ isp: data.isp, city: data.city, state: data.state });
      }
    } catch {
      setError('Could not submit results — check your connection.');
    }

    setIsChecking(false);
  }, []);

  const allDone = Object.values(cardStates).every((s) => s === 'ok' || s === 'blocked');
  const blockedCount = Object.values(cardStates).filter((s) => s === 'blocked').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ISP Banner */}
      {ispInfo && (
        <div className="rounded-lg border border-blue-700 bg-blue-950/40 px-4 py-3 text-sm text-blue-300">
          <span className="font-semibold">Detected:</span>{' '}
          {ispInfo.isp}
          {ispInfo.city && `, ${ispInfo.city}`}
          {ispInfo.state && `, ${ispInfo.state}`}
        </div>
      )}

      {rateLimited && (
        <div className="rounded-lg border border-yellow-700 bg-yellow-950/40 px-4 py-3 text-sm text-yellow-300">
          Rate limited — you can check again in{' '}
          {retryAfter ? `${Math.ceil(retryAfter / 60)} minutes` : 'an hour'}.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Service Grid — 2 cols mobile, 3 tablet, 5 desktop */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {SERVICES.map((service) => (
          <ServiceCard
            key={service.name}
            name={service.name}
            icon={service.icon}
            state={cardStates[service.name]}
            responseTimeMs={responseTimes[service.name]}
          />
        ))}
      </div>

      {/* Summary */}
      {allDone && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-300">
          {blockedCount === 0 ? (
            <span className="text-emerald-400 font-medium">All services accessible ✓</span>
          ) : (
            <>
              <span className="text-red-400 font-medium">
                {blockedCount} service{blockedCount > 1 ? 's' : ''} blocked
              </span>
              <span className="text-zinc-500"> · </span>
              <span className="text-emerald-400">{SERVICES.length - blockedCount} accessible</span>
            </>
          )}
        </div>
      )}

      {/* Check Button — tall tap target on mobile */}
      <button
        onClick={runCheck}
        disabled={isChecking}
        className="w-full rounded-lg bg-indigo-600 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-sm"
      >
        {isChecking ? 'Checking...' : 'Check My Connection'}
      </button>
    </div>
  );
}
