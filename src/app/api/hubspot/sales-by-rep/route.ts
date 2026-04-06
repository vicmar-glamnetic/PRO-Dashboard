import { NextResponse } from "next/server";
import { searchCRM, REP_MAP } from "@/lib/hubspot";
import { getCustomerStatus } from "@/lib/status";

export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate   = searchParams.get("endDate");

  const dateFilters = startDate && endDate ? [
    { propertyName: "last_order_date", operator: "GTE", value: startDate },
    { propertyName: "last_order_date", operator: "LTE", value: endDate },
  ] : [];

  const data = await searchCRM("contacts", {
    filterGroups: [{
      filters: [
        { propertyName: "num_associated_deals", operator: "GT", value: "0" },
        ...dateFilters,
      ],
    }],
    properties: [
      "hubspot_owner_id", "total_revenue", "num_associated_deals",
      "last_order_date", "first_order_date",
      "revenue_last_90_days",
    ],
    limit: 200,
  });

  const repStats: Record<string, any> = {};

  for (const c of data.results ?? []) {
    const p = c.properties;
    const ownerId = p.hubspot_owner_id;
    const repName = REP_MAP[ownerId] ?? "Unassigned";
    if (!repStats[repName]) {
      repStats[repName] = {
        repName,
        signUps: 0,
        firstTimeOrders: 0,
        firstTimeRevenue: 0,
        returningOrders: 0,
        returningRevenue: 0,
        reactivations: 0,
        reactivationRevenue: 0,
        totalRevenue: 0,
        fadingAccounts: 0,
        newChurnAccounts: 0,
        totalOrders: 0,
      };
    }

    const s = repStats[repName];
    const status = getCustomerStatus(p.last_order_date);
    const revenue = parseFloat(p.total_revenue ?? "0");
    const orders = parseInt(p.num_associated_deals ?? "0");

    s.totalRevenue += revenue;
    s.totalOrders += orders;

    if (orders === 1) {
      s.firstTimeOrders += 1;
      s.firstTimeRevenue += revenue;
    } else if (status === "Active") {
      s.returningOrders += orders;
      s.returningRevenue += revenue;
    } else if (status === "Reactivation") {
      s.reactivations += 1;
      s.reactivationRevenue += revenue;
    }

    if (status === "Fading")    s.fadingAccounts += 1;
    if (status === "NewChurn")  s.newChurnAccounts += 1;
    if (orders === 1 && status === "Active") s.signUps += 1;
  }

  const result = Object.values(repStats).map((r: any) => ({
    ...r,
    aov: r.totalOrders > 0 ? r.totalRevenue / r.totalOrders : 0,
  }));

  result.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

  return NextResponse.json(result);
  } catch (err) {
    console.error("[sales-by-rep]", err);
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 });
  }
}
