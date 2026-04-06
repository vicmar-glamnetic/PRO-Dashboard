import Link from "next/link";

const TILES = [
  {
    href: "/dashboard/churned",
    emoji: "🔴",
    title: "Churned View",
    description: "Fading & New Churn accounts",
    color: "border-orange-200 hover:border-orange-400",
  },
  {
    href: "/dashboard/abandon-cart",
    emoji: "🛒",
    title: "Abandon Cart",
    description: "High-value carts to recover",
    color: "border-yellow-200 hover:border-yellow-400",
  },
  {
    href: "/dashboard/inventory",
    emoji: "📦",
    title: "Inventory Report",
    description: "Reorder timing & upsell signals",
    color: "border-blue-200 hover:border-blue-400",
  },
  {
    href: "/dashboard/whale",
    emoji: "🐋",
    title: "Whale Report",
    description: "VIP account retention",
    color: "border-purple-200 hover:border-purple-400",
  },
  {
    href: "/dashboard/sales-by-rep",
    emoji: "📊",
    title: "Sales by Rep",
    description: "Team performance breakdown",
    color: "border-green-200 hover:border-green-400",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">INH Pro Dashboard</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500">Live data from HubSpot · refreshes every 5 min</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-xl border-2 bg-white p-6 transition-colors ${t.color}`}
          >
            <div className="mb-3 text-2xl">{t.emoji}</div>
            <h2 className="text-base font-semibold text-zinc-900">{t.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
