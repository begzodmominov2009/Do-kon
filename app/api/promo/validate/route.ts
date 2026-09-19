import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { validatePromoCode, type PromoValidationReason } from "@/lib/api/promo";
import { createRateLimiter, getClientIp } from "@/lib/utils/rateLimit";

// promo_codes is RLS-locked — this is the only place that may read it, and
// only with the service_role client.
export const dynamic = "force-dynamic";

type ValidateItem = {
  productId: string;
  qty: number;
};

type ValidateRequestBody = {
  code: string;
  items: ValidateItem[];
};

type ValidateFailureReason = PromoValidationReason | "invalid_request" | "rate_limited" | "server_error";

type ValidateResponse =
  | {
      ok: true;
      code: string;
      discount: number;
      discountType: "fixed" | "percent";
      discountValue: number;
    }
  | {
      ok: false;
      reason: ValidateFailureReason;
      minOrder?: number;
    };

const isRateLimited = createRateLimiter(10, 60_000);

// Product ids are accepted as either a string or a number — the products
// table's primary key is numeric, but items are normalized to strings here
// so the rest of the route only ever deals with one representation.
function parseBody(value: unknown): ValidateRequestBody | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.code !== "string" || body.code.trim().length === 0) return null;
  if (!Array.isArray(body.items)) return null;

  const items: ValidateItem[] = [];
  for (const entry of body.items) {
    if (!entry || typeof entry !== "object") return null;
    const item = entry as Record<string, unknown>;
    const rawId = item.productId;
    if ((typeof rawId !== "string" && typeof rawId !== "number") || typeof item.qty !== "number") {
      return null;
    }
    items.push({ productId: String(rawId), qty: item.qty });
  }

  return { code: body.code, items };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json<ValidateResponse>(
      { ok: false, reason: "rate_limited" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ValidateResponse>(
      { ok: false, reason: "invalid_request" },
      { status: 400 },
    );
  }

  const parsedBody = parseBody(body);
  if (!parsedBody) {
    return NextResponse.json<ValidateResponse>(
      { ok: false, reason: "invalid_request" },
      { status: 400 },
    );
  }

  const client = getSupabaseServerClient();

  // Never trust a client-provided subtotal — recompute it from the current
  // database prices for the given product ids and quantities.
  const productIds = [...new Set(parsedBody.items.map((item) => item.productId))];
  let subtotal = 0;
  if (productIds.length > 0) {
    const { data: productRows, error: productsError } = await client
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productsError) {
      return NextResponse.json<ValidateResponse>(
        { ok: false, reason: "server_error" },
        { status: 500 },
      );
    }

    // The products table's id column is numeric — normalize to string so
    // lookups match the (already string-normalized) request items.
    const priceRows = (productRows ?? []) as { id: string | number; price: number }[];
    const priceById = new Map(priceRows.map((row) => [String(row.id), row.price]));
    subtotal = parsedBody.items.reduce((sum, item) => {
      const price = priceById.get(item.productId);
      if (price === undefined) return sum;
      const qty = Math.max(0, Math.floor(item.qty));
      return sum + price * qty;
    }, 0);
  }

  try {
    const result = await validatePromoCode(client, parsedBody.code, subtotal);
    return NextResponse.json<ValidateResponse>(result);
  } catch {
    return NextResponse.json<ValidateResponse>(
      { ok: false, reason: "server_error" },
      { status: 500 },
    );
  }
}
