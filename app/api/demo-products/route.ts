import { NextRequest, NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { ProductCategory } from "@/lib/transport";

/**
 * A single source of demo listings, used by three different pages before
 * real data exists for them:
 *   - Buyer marketplace / categories, when Supabase isn't configured yet
 *     (or has no real listings)
 *   - A newly signed-up farmer's dashboard, so it doesn't look broken
 *     before they've listed anything
 *
 * Swap the body of this route for a real query once you'd rather serve
 * curated/rotating sample data from a database table instead of this
 * static list — the pages calling it don't need to change either way.
 */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as ProductCategory | null;

  const products = category ? MOCK_PRODUCTS.filter((p) => p.category === category) : MOCK_PRODUCTS;

  return NextResponse.json({ products, isDemoData: true });
}
