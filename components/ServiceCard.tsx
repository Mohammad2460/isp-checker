'use client';

export type CardState = 'idle' | 'checking' | 'ok' | 'blocked';

interface ServiceCardProps {
  name: string;
  icon: string;
  state: CardState;
  responseTimeMs?: number | null;
}

export default function ServiceCard({ name, icon, state, responseTimeMs }: ServiceCardProps) {
  const stateStyles: Record<CardState, string> = {
    idle: 'border-zinc-700 bg-zinc-800/50',
    checking: 'border-zinc-600 bg-zinc-800/80 animate-pulse',
    ok: 'border-emerald-700 bg-emerald-950/40',
    blocked: 'border-red-700 bg-red-950/40',
  };

  const statusIcon: Record<CardState, string> = {
    idle: '○',
    checking: '⟳',
    ok: '✓',
    blocked: '✗',
  };

  const statusColor: Record<CardState, string> = {
    idle: 'text-zinc-500',
    checking: 'text-zinc-400',
    ok: 'text-emerald-400',
    blocked: 'text-red-400',
  };

  return (
    <div className={`rounded-lg border p-3 transition-all duration-300 sm:p-4 ${stateStyles[state]}`}>
      <div className="flex items-start justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <span className="shrink-0 text-base sm:text-xl">{icon}</span>
          <span className="truncate text-xs font-medium text-zinc-200 sm:text-sm">{name}</span>
        </div>
        <span className={`shrink-0 text-base font-bold sm:text-lg ${statusColor[state]}`}>
          {statusIcon[state]}
        </span>
      </div>
      <div className="mt-1.5 text-xs sm:mt-2">
        {state === 'idle' && <span className="text-zinc-600">not checked</span>}
        {state === 'checking' && <span className="text-zinc-400">checking...</span>}
        {state === 'ok' && (
          <span className="text-emerald-500">
            ok{responseTimeMs != null ? ` · ${responseTimeMs}ms` : ''}
          </span>
        )}
        {state === 'blocked' && <span className="text-red-500">blocked</span>}
      </div>
    </div>
  );
}
