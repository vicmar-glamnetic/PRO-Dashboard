import { NextResponse } from "next/server";
import { searchCRM, REP_MAP } from "@/lib/hubspot";
import { isWhaleAtRisk } from "@/lib/status";
import { differenceInDays } from "date-fns";

const WHALE_LTV_THRESHOLD = 2500;

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
        { propertyName: "total_revenue", operator: "GTE", value: String(WHALE_LTV_THRESHOLD) },
        ...dateFilters,
      ],
    }],
    properties: [
      "firstname", "lastname", "email", "hubspot_owner_id",
      "total_revenue", "last_order_date",
      "revenue_last_90_days", "revenue_prior_90_days",
      "num_associated_deals",
    ],
    sorts: [{ propertyName: "total_revenue", direction: "DESCENDING" }],
    limit: 100,
  });

  const whales = (data.results ?? []).map((c: any) => {
    const p = c.properties;
    const ltv = parseFloat(p.total_revenue ?? "0");
    const last90 = parseFloat(p.revenue_last_90_days ?? "0");
    const prior90 = parseFloat(p.revenue_prior_90_days ?? "0");
    const growth = prior90 > 0 ? ((last90 - prior90) / prior90) * 100 : null;
    const lastOrder = p.last_order_date;
    const days = lastOrder ? differenceInDays(new Date(), new Date(lastOrder)) : null;

    const tier = ltv >= 10000 ? "Platinum" : ltv >= 5000 ? "Gold" : "Silver";

    return {
      id: c.id,
      accountName: `${p.firstname ?? ""} ${p.lastname ?? ""}`.trim(),
      email: p.email,
      assignedRep: REP_MAP[p.hubspot_owner_id] ?? "Unassigned",
      ltv,
      revenuelast90: last90,
      revenuePrior90: prior90,
      growthPct: growth,
      aov: parseInt(p.num_associated_deals ?? "1") > 0
        ? ltv / parseInt(p.num_associated_deals)
        : ltv,
      orderCount: parseInt(p.num_associated_deals ?? "0"),
      lastOrderDate: lastOrder,
      daysSinceLastOrder: days,
      tier,
      atRisk: isWhaleAtRisk(lastOrder),
    };
  });

  return NextResponse.json(whales);
  } catch (err) {
    console.error("[whale]", err);
    return NextResponse.json({ error: "Failed to fetch whale accounts" }, { status: 500 });
  }
}
