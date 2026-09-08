import { NextResponse, type NextRequest } from "next/server";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { getProducts, type ProductSort } from "@/lib/api/products";

// Client-side filtering/search/pagination (catalog, favorites) goes through
// this route instead of querying Supabase directly from the browser, so it
// always runs with the anon key and stays behind RLS.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const sortParam = params.get("sort");
  const sort: ProductSort =
    sortParam === "cheap" || sortParam === "expensive" ? sortParam : "newest";

  try {
    const result = await getProducts(
      {
        categorySlug: params.get("category") ?? undefined,
        minPrice: params.has("minPrice") ? Number(params.get("minPrice")) : undefined,
        maxPrice: params.has("maxPrice") ? Number(params.get("maxPrice")) : undefined,
        discountOnly: params.get("discountOnly") === "true",
        inStockOnly: params.get("inStockOnly") === "true",
        search: params.get("search") ?? undefined,
        sort,
        limit: params.has("limit") ? Number(params.get("limit")) : undefined,
        offset: params.has("offset") ? Number(params.get("offset")) : undefined,
      },
      supabaseBrowserClient,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
