import { NextResponse } from "next/server";
import { searchCRM, REP_MAP } from "@/lib/hubspot";

export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate   = searchParams.get("endDate");

  const start = startDate ? new Date(startDate).getTime() : null;
  const end   = endDate   ? new Date(endDate).getTime() + 86399999 : null;

  const data = await searchCRM("carts", {
    filterGroups: [{
      filters: [
        { propertyName: "hs_cart_status", operator: "EQ", value: "abandoned" },
      ],
    }],
    properties: [
      "hs_cart_value", "hs_abandoned_at", "hs_line_items",
      "hubspot_owner_id", "hs_recovery_url",
      "associated_contact_email", "associated_contact_name",
    ],
    sorts: [{ propertyName: "hs_cart_value", direction: "DESCENDING" }],
    limit: 100,
  });

  const carts = (data.results ?? []).filter((c: any) => {
    if (start === null || end === null) return true;
    const t = c.properties.hs_abandoned_at ? new Date(c.properties.hs_abandoned_at).getTime() : null;
    return t !== null && t >= start && t <= end;
  }).map((c: any) => {
    const p = c.properties;
    const abandonedAt = p.hs_abandoned_at;
    const hoursSince = abandonedAt
      ? Math.round((Date.now() - new Date(abandonedAt).getTime()) / 36e5)
      : null;
    const cartValue = parseFloat(p.hs_cart_value ?? "0");

    return {
      id: c.id,
      accountName: p.associated_contact_name ?? "Unknown",
      email: p.associated_contact_email,
      assignedRep: REP_MAP[p.hubspot_owner_id] ?? "Unassigned",
      cartValue,
      itemsInCart: p.hs_line_items ?? "—",
      abandonedAt,
      hoursSinceAbandonment: hoursSince,
      recoveryUrl: p.hs_recovery_url,
      isUrgent: cartValue >= 300 && (hoursSince ?? 999) < 48,
    };
  });

  return NextResponse.json(carts);
  } catch (err) {
    console.error("[abandon-cart]", err);
    return NextResponse.json({ error: "Failed to fetch abandoned carts" }, { status: 500 });
  }
}
