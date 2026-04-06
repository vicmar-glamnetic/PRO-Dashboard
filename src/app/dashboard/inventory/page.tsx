"use client";
import { useEffect, useState } from "react";
import { usd } from "@/lib/formatters";

type Product = {
  id: string;
  properties: {
    name: string;
    price: string | null;
    hs_sku: string | null;
    description: string | null;
    hs_cost_of_goods_sold: string | null;
  };
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hubspot/inventory")
      .then((r) => r.json())
      .then((d) => { setProducts(Array.isArray(d.products) ? d.products : []); setLoading(false); })
      .catch((err) => { console.error("[inventory]", err); setLoading(false); });
  }, []);

  if (loading) return <p className="p-6 text-sm text-zinc-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">📦 Inventory</h1>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-700">
          {products.length} products
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium text-zinc-500">
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">COGS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {p.properties.hs_sku ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">{p.properties.name}</td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-500">
                  {p.properties.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-right text-zinc-900">
                  {p.properties.price ? usd(parseFloat(p.properties.price)) : "—"}
                </td>
                <td className="px-4 py-3 text-right text-zinc-500">
                  {p.properties.hs_cost_of_goods_sold
                    ? usd(parseFloat(p.properties.hs_cost_of_goods_sold))
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-400">No products found.</p>
        )}
      </div>
    </div>
  );
}
