'use client';

interface ISPFilterProps {
  isps: string[];
  selected: string;
  onChange: (isp: string) => void;
}

export default function ISPFilter({ isps, selected, onChange }: ISPFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-zinc-400 whitespace-nowrap">Filter by ISP:</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
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
