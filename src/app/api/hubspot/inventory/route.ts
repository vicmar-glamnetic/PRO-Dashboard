import { NextResponse } from "next/server";
import { searchCRM } from "@/lib/hubspot";

export async function GET(request: Request) {
  try {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate   = searchParams.get("endDate");

  const dateFilters = startDate && endDate ? [
    { propertyName: "createdate", operator: "GTE", value: new Date(startDate).getTime().toString() },
    { propertyName: "createdate", operator: "LTE", value: new Date(endDate + "T23:59:59").getTime().toString() },
  ] : [];

  const data = await searchCRM("products", {
    filterGroups: dateFilters.length ? [{ filters: dateFilters }] : [],
    properties: ["name", "price", "hs_sku", "description", "hs_cost_of_goods_sold"],
    sorts: [{ propertyName: "name", direction: "ASCENDING" }],
    limit: 100,
  });

  const products = data.results ?? [];
  return NextResponse.json({ count: products.length, products });
  } catch (err) {
    console.error("[inventory]", err);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}
