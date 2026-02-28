'use client';

interface ISPFilterProps {
  isps: string[];
  selected: string;
  onChange: (isp: string) => void;
}

export default function ISPFilter({ isps, selected, onChange }: ISPFilterProps) {
  return (
    <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
      <label className="shrink-0 text-sm text-zinc-400">Filter:</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none sm:w-auto sm:py-1.5"
      >
        <option value="">All ISPs</option>
        {isps.map((isp) => (
          <option key={isp} value={isp}>
            {isp}
          </option>
        ))}
      </select>
    </div>
  );
}
