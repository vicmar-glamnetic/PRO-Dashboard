import { NextResponse } from "next/server";
import { searchCRM, REP_MAP } from "@/lib/hubspot";
import { getCustomerStatus, isApproachingChurn } from "@/lib/status";
import { differenceInDays, subDays } from "date-fns";

export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate   = searchParams.get("endDate");

  // Default: contacts whose last order was 90–150 days ago (churn window)
  const cutoffMs    = startDate
    ? new Date(startDate).getTime()
    : subDays(new Date(), 150).getTime();
  const thresholdMs = endDate
    ? new Date(endDate).getTime() + 86399999
    : subDays(new Date(), 90).getTime();

  const data = await searchCRM("contacts", {
    filterGroups: [{
      filters: [
        { propertyName: "last_order_date", operator: "GTE", value: cutoffMs.toString() },
        { propertyName: "last_order_date", operator: "LTE", value: thresholdMs.toString() },
      ],
    }],
    properties: [
      "firstname", "lastname", "email", "hubspot_owner_id",
      "last_order_date", "total_revenue", "num_associated_deals",
      "createdate", "hs_lead_status",
    ],
    sorts: [{ propertyName: "total_revenue", direction: "DESCENDING" }],
    limit: 100,
  });

  const accounts = (data.results ?? []).map((c: any) => {
    const p = c.properties;
    const lastOrder = p.last_order_date;
    const days = lastOrder ? differenceInDays(new Date(), new Date(lastOrder)) : null;
    return {
      id: c.id,
      accountName: `${p.firstname ?? ""} ${p.lastname ?? ""}`.trim(),
      email: p.email,
      assignedRep: REP_MAP[p.hubspot_owner_id] ?? "Unassigned",
      status: getCustomerStatus(lastOrder),
      lastOrderDate: lastOrder,
      daysSinceLastOrder: days,
      ltv: parseFloat(p.total_revenue ?? "0"),
      totalOrders: parseInt(p.num_associated_deals ?? "0"),
      firstOrderDate: p.createdate,
      approachingChurn: isApproachingChurn(lastOrder),
    };
  });

  // Sort: NewChurn first, then Fading, both by LTV desc
  accounts.sort((a: any, b: any) => {
    const rank = (s: string) => (s === "NewChurn" ? 0 : 1);
    if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
    return b.ltv - a.ltv;
  });

  return NextResponse.json(accounts);
  } catch (err) {
    console.error("[churned]", err);
    return NextResponse.json({ error: "Failed to fetch churned accounts" }, { status: 500 });
  }
}
