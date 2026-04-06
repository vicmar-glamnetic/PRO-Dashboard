"use client";
import { useState } from "react";
import { format, subDays, subMonths, startOfYear } from "date-fns";

type Props = {
  onChange: (start: string | null, end: string | null) => void;
};

const td = () => format(new Date(), "yyyy-MM-dd");

const PRESETS = [
  { label: "Last 7d",   start: () => format(subDays(new Date(), 7),   "yyyy-MM-dd"), end: td },
  { label: "Last 30d",  start: () => format(subDays(new Date(), 30),  "yyyy-MM-dd"), end: td },
  { label: "Last 90d",  start: () => format(subDays(new Date(), 90),  "yyyy-MM-dd"), end: td },
  { label: "Last 6m",   start: () => format(subMonths(new Date(), 6), "yyyy-MM-dd"), end: td },
  { label: "This year", start: () => format(startOfYear(new Date()),  "yyyy-MM-dd"), end: td },
  { label: "All time",  start: (): null => null, end: (): null => null },
];

export default function DateFilter({ onChange }: Props) {
  const [active, setActive] = useState("All time");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  function applyPreset(label: string, start: () => string | null, end: () => string | null) {
    setActive(label);
    setCustomStart("");
    setCustomEnd("");
    onChange(start(), end());
  }

  function applyCustom() {
    if (!customStart || !customEnd) return;
    setActive("custom");
    onChange(customStart, customEnd);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <span className="text-xs font-medium text-zinc-400 mr-1">Period:</span>
      {PRESETS.map(({ label, start, end }) => (
        <button
          key={label}
          onClick={() => applyPreset(label, start, end)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            active === label
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {label}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-1.5">
        <input
          type="date"
          value={customStart}
          onChange={(e) => setCustomStart(e.target.value)}
          className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
        <span className="text-xs text-zinc-400">—</span>
        <input
          type="date"
          value={customEnd}
          onChange={(e) => setCustomEnd(e.target.value)}
          className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
        <button
          onClick={applyCustom}
          disabled={!customStart || !customEnd}
          className="rounded bg-zinc-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
