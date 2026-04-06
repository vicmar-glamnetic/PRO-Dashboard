"use client";
import { useEffect, useState } from "react";
import { usd, pct } from "@/lib/formatters";
import DateFilter from "@/components/DateFilter";

type Row = {
  id: string;
  accountName: string;
  email: string;
  assignedRep: string;
  ltv: number;
  revenuelast90: number;
  growthPct: number | null;
  daysSinceLastOrder: number | null;
  tier: string;
  atRisk: boolean;
};

const TIER_COLOR: Record<string, string> = {
  Platinum: "bg-purple-100 text-purple-800",
  Gold:     "bg-yellow-100 text-yellow-800",
  Silver:   "bg-zinc-100 text-zinc-700",
};

export default function WhalePage() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate)   params.set("endDate", endDate);
    const qs = params.toString() ? `?${params}` : "";
    fetch(`/api/hubspot/whale${qs}`)
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch((err) => { console.error("[whale]", err); setLoading(false); });
  }, [startDate, endDate]);

  const totalLtv = data.reduce((sum, r) => sum + r.ltv, 0);

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">🐋 Whale Report</h1>
        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-700">
          {data.length}
        </span>
        <span className="ml-auto text-sm text-zinc-500">
          Total LTV: <strong className="text-zinc-900">{usd(totalLtv)}</strong>
        </span>
      </div>
      <DateFilter onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-500">
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Rep</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">LTV</th>
                <th className="px-4 py-3">90d Revenue</th>
                <th className="px-4 py-3">Growth</th>
                <th className="px-4 py-3">Days Since Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">{row.accountName}</div>
                    <div className="text-xs text-zinc-500">{row.email}</div>
                    {row.atRisk && (
                      <span className="mt-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                        ⚠ At risk
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{row.assignedRep}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${TIER_COLOR[row.tier] ?? TIER_COLOR.Silver}`}>
                      {row.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-purple-700">{usd(row.ltv)}</td>
                  <td className="px-4 py-3 text-zinc-700">{usd(row.revenuelast90)}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {row.growthPct !== null ? (
                      <span className={row.growthPct >= 0 ? "text-green-700" : "text-red-600"}>
                        {pct(row.growthPct)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {row.daysSinceLastOrder !== null ? `${row.daysSinceLastOrder}d` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">No whale customers found for this period.</p>
          )}
        </div>
      )}
    </div>
  );
}
