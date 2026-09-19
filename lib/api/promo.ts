import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/db";

export type PromoValidationReason = "not_found" | "inactive" | "expired" | "limit" | "min_order";

export type PromoValidationResult =
  | {
      ok: true;
      code: string;
      discount: number;
      discountType: "fixed" | "percent";
      discountValue: number;
    }
  | {
      ok: false;
      reason: PromoValidationReason;
      minOrder?: number;
    };

type PromoRow = {
  id: number;
  code: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
};

// Core promo-code business rules — shared by /api/promo/validate (check
// only) and /api/order (check, then the create_order RPC consumes a use).
// Throws on a database error; callers decide how to map that to a response.
export async function validatePromoCode(
  client: SupabaseClient<Database>,
  rawCode: string,
  subtotal: number,
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase();

  const { data: promoRow, error } = await client
    .from("promo_codes")
    .select(
      "id, code, discount_type, discount_value, min_order, max_uses, used_count, is_active, expires_at",
    )
    .eq("code", code)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const promo = promoRow as PromoRow | null;
  if (!promo) return { ok: false, reason: "not_found" };
  if (!promo.is_active) return { ok: false, reason: "inactive" };

  if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  // used_count is only ever incremented once an order is actually placed
  // (create_order RPC) — checking it here never consumes a use.
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    return { ok: false, reason: "limit" };
  }

  if (promo.min_order !== null && subtotal < promo.min_order) {
    return { ok: false, reason: "min_order", minOrder: promo.min_order };
  }

  const discount = Math.min(
    promo.discount_type === "percent"
      ? Math.round((subtotal * promo.discount_value) / 100)
      : promo.discount_value,
    subtotal,
  );

  return {
    ok: true,
    code: promo.code,
    discount,
    discountType: promo.discount_type,
    discountValue: promo.discount_value,
  };
}
