"use client";
import { useEffect, useState } from "react";
import { usd, relativeTime } from "@/lib/formatters";
import DateFilter from "@/components/DateFilter";

type Row = {
  id: string;
  accountName: string;
  email: string;
  assignedRep: string;
  cartValue: number;
  itemsInCart: string;
  abandonedAt: string | null;
  hoursSinceAbandonment: number | null;
  recoveryUrl: string | null;
  isUrgent: boolean;
};

export default function AbandonCartPage() {
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
    fetch(`/api/hubspot/abandon-cart${qs}`)
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch((err) => { console.error("[abandon-cart]", err); setLoading(false); });
  }, [startDate, endDate]);

  const totalValue = data.reduce((sum, r) => sum + r.cartValue, 0);

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">🛒 Abandon Cart</h1>
        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-medium text-orange-700">
          {data.length}
        </span>
        <span className="ml-auto text-sm text-zinc-500">
          Total value: <strong className="text-zinc-900">{usd(totalValue)}</strong>
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
                <th className="px-4 py-3">Abandoned</th>
                <th className="px-4 py-3">Cart Value</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">{row.accountName}</div>
                    <div className="text-xs text-zinc-500">{row.email}</div>
                    {row.isUrgent && (
                      <span className="mt-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                        ⚡ Urgent
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{row.assignedRep}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {row.abandonedAt ? relativeTime(row.abandonedAt) : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-zinc-900">{usd(row.cartValue)}</td>
                  <td className="px-4 py-3 text-zinc-700">{row.itemsInCart}</td>
                  <td className="px-4 py-3">
                    {row.recoveryUrl ? (
                      <a
                        href={row.recoveryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Link →
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">No abandoned carts found for this period.</p>
          )}
        </div>
      )}
    </div>
  );
}
