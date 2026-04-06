import { NextResponse } from "next/server";
import { searchCRM } from "@/lib/hubspot";

export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate   = searchParams.get("endDate");

  const start = startDate ? new Date(startDate).getTime() : null;
  const end   = endDate   ? new Date(endDate).getTime() + 86399999 : null;

  const data = await searchCRM("products", {
    filterGroups: [],
    properties: ["name", "price", "hs_sku", "description", "hs_cost_of_goods_sold"],
    sorts: [{ propertyName: "name", direction: "ASCENDING" }],
    limit: 100,
  });

  const products = (data.results ?? []).filter((p: any) => {
    if (start === null || end === null) return true;
    const t = p.properties.createdate ? new Date(p.properties.createdate).getTime() : null;
    return t !== null && t >= start && t <= end;
  });
  return NextResponse.json({ count: products.length, products });
  } catch (err) {
    console.error("[inventory]", err);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}
