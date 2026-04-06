"use client";
import { useEffect, useState } from "react";
import { usd } from "@/lib/formatters";

type Row = {
  repName: string;
  totalRevenue: number;
  totalOrders: number;
  aov: number;
  firstTimeOrders: number;
  returningOrders: number;
  reactivations: number;
  fadingAccounts: number;
  newChurnAccounts: number;
};

export default function SalesByRepPage() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hubspot/sales-by-rep")
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch((err) => { console.error("[sales-by-rep]", err); setLoading(false); });
  }, []);

  if (loading) return <p className="p-6 text-sm text-zinc-500">Loading...</p>;

  const totalRevenue = data.reduce((sum, r) => sum + r.totalRevenue, 0);

  return (
    <div>
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">📊 Sales by Rep</h1>
        <span className="text-sm text-zinc-500">All-time · by account</span>
        <span className="ml-auto text-sm text-zinc-500">
          Total: <strong className="text-zinc-900">{usd(totalRevenue)}</strong>
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-500">
              <th className="px-4 py-3">Rep</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">AOV</th>
              <th className="px-4 py-3 text-right">1st Time</th>
              <th className="px-4 py-3 text-right">Returning</th>
              <th className="px-4 py-3 text-right">Reactivations</th>
              <th className="px-4 py-3 text-right">Fading</th>
              <th className="px-4 py-3 text-right">New Churn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.map((row) => (
              <tr key={row.repName} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">{row.repName}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-700">
                  {usd(row.totalRevenue)}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">{row.totalOrders}</td>
                <td className="px-4 py-3 text-right text-zinc-700">{usd(row.aov)}</td>
                <td className="px-4 py-3 text-right text-zinc-700">{row.firstTimeOrders}</td>
                <td className="px-4 py-3 text-right text-zinc-700">{row.returningOrders}</td>
                <td className="px-4 py-3 text-right text-zinc-700">{row.reactivations}</td>
                <td className="px-4 py-3 text-right text-yellow-700">{row.fadingAccounts}</td>
                <td className="px-4 py-3 text-right text-orange-700">{row.newChurnAccounts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-400">No rep data found.</p>
        )}
      </div>
    </div>
  );
}
