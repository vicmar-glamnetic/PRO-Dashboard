"use client";
import { useEffect, useState } from "react";
import { STATUS_LABEL, STATUS_COLOR, CustomerStatus } from "@/lib/status";
import { usd } from "@/lib/formatters";
import DateFilter from "@/components/DateFilter";

type Row = {
  id: string;
  accountName: string;
  email: string;
  assignedRep: string;
  status: CustomerStatus;
  daysSinceLastOrder: number | null;
  ltv: number;
  totalOrders: number;
  approachingChurn: boolean;
};

export default function ChurnedPage() {
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
    fetch(`/api/hubspot/churned${qs}`)
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch((err) => { console.error("[churned]", err); setLoading(false); });
  }, [startDate, endDate]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">🔴 Churned View</h1>
      <p className="mt-1 mb-4 text-sm text-zinc-500">Fading (90–119d) and New Churn (120–150d) accounts · sorted by LTV</p>
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
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Days Since Order</th>
                <th className="px-4 py-3">LTV</th>
                <th className="px-4 py-3">Total Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">{row.accountName}</div>
                    <div className="text-xs text-zinc-500">{row.email}</div>
                    {row.approachingChurn && (
                      <span className="mt-1 inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
                        ⚠ Approaching churn
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{row.assignedRep}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{row.daysSinceLastOrder ?? "—"}d</td>
                  <td className="px-4 py-3 text-zinc-700">{usd(row.ltv)}</td>
                  <td className="px-4 py-3 text-zinc-700">{row.totalOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">No accounts found for this period.</p>
          )}
        </div>
      )}
    </div>
  );
}
