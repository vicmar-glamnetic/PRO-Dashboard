import { NextResponse } from "next/server";
import { searchCRM } from "@/lib/hubspot";

export async function GET() {
  try {
    const data = await searchCRM("products", {
      filterGroups: [],
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
