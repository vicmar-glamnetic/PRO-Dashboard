import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/dashboard",                label: "Overview" },
  { href: "/dashboard/churned",        label: "🔴 Churned" },
  { href: "/dashboard/abandon-cart",   label: "🛒 Abandon Cart" },
  { href: "/dashboard/inventory",      label: "📦 Inventory" },
  { href: "/dashboard/whale",          label: "🐋 Whale" },
  { href: "/dashboard/sales-by-rep",   label: "📊 Sales by Rep" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-full flex flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-base font-semibold text-zinc-900">INH Pro</span>
          <nav className="flex gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <span className="text-sm text-zinc-500">{session.user?.email}</span>
      </header>
      <main className="flex-1 p-6 bg-[#f5f5f5]">{children}</main>
    </div>
  );
}
