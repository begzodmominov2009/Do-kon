import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { validatePromoCode } from "@/lib/api/promo";
import { sendOrderNotification } from "@/lib/telegram/notify";
import { createRateLimiter, getClientIp } from "@/lib/utils/rateLimit";

export const dynamic = "force-dynamic";

type OrderErrorCode =
  | "validation"
  | "product_unavailable"
  | "out_of_stock"
  | "promo_invalid"
  | "server_error";

type OrderResponse =
  | { ok: true; orderNumber: string; total: number }
  | { ok: false; error: OrderErrorCode; detail?: string };

function errorResponse(error: OrderErrorCode, status: number, detail?: string) {
  return NextResponse.json<OrderResponse>({ ok: false, error, detail }, { status });
}

const isRateLimited = createRateLimiter(3, 60_000);

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return null;
}

const orderItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  colorId: z.coerce.number().int().positive().optional(),
  qty: z.number().int().min(1).max(100),
});

const orderRequestSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  customer: z.object({
    name: z.string().trim().min(2).max(60),
    phone: z
      .string()
      .transform((value, ctx) => {
        const normalized = normalizePhone(value);
        if (!normalized) {
          ctx.addIssue({ code: "custom", message: "invalid phone" });
          return z.NEVER;
        }
        return normalized;
      }),
    region: z.string().trim().min(1),
    district: z.string().trim().min(1),
    street: z.string().trim().min(5).max(200),
    note: z.string().trim().max(500).optional(),
  }),
  promoCode: z.string().trim().min(1).optional(),
});

type ProductRow = {
  id: number;
  price: number;
  stock: number;
  is_active: boolean;
  name_uz: string;
  product_images: { url: string; sort_order: number }[];
};

type ColorRow = {
  id: number;
  product_id: number;
  name_uz: string;
  hex: string;
  in_stock: boolean;
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return errorResponse("validation", 429, "rate_limited");
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse("validation", 400);
  }

  const parsed = orderRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    console.warn("create order: validation failed", parsed.error.issues);
    return errorResponse("validation", 400);
  }
  const body = parsed.data;

  const client = getSupabaseServerClient();

  try {
    // 1. Fetch every referenced product in one query (no per-item loop).
    const productIds = [...new Set(body.items.map((item) => item.productId))];
    const { data: productRows, error: productsError } = await client
      .from("products")
      .select("id, price, stock, is_active, name_uz, product_images(url, sort_order)")
      .in("id", productIds);

    if (productsError) {
      console.error("create order: products lookup failed", productsError);
      return errorResponse("server_error", 500);
    }

    const products = (productRows ?? []) as ProductRow[];
    const productById = new Map(products.map((row) => [row.id, row]));

    // Same for colors, batched.
    const colorIds = [
      ...new Set(
        body.items
          .map((item) => item.colorId)
          .filter((id): id is number => id !== undefined),
      ),
    ];
    let colorById = new Map<number, ColorRow>();
    if (colorIds.length > 0) {
      const { data: colorRows, error: colorsError } = await client
        .from("product_colors")
        .select("id, product_id, name_uz, hex, in_stock")
        .in("id", colorIds);

      if (colorsError) {
        console.error("create order: colors lookup failed", colorsError);
        return errorResponse("server_error", 500);
      }
      colorById = new Map((colorRows as ColorRow[] | null ?? []).map((row) => [row.id, row]));
    }

    // 2. Validate every item against the just-fetched data.
    for (const item of body.items) {
      const product = productById.get(item.productId);
      if (!product || !product.is_active) {
        return errorResponse("product_unavailable", 400, `product ${item.productId}`);
      }
      if (product.stock < item.qty) {
        return errorResponse("out_of_stock", 400, product.name_uz);
      }
      if (item.colorId !== undefined) {
        const color = colorById.get(item.colorId);
        if (!color || color.product_id !== item.productId || !color.in_stock) {
          return errorResponse("product_unavailable", 400, `color ${item.colorId}`);
        }
      }
    }

    // 3. subtotal — server-computed only, never trust a client value.
    const subtotal = body.items.reduce((sum, item) => {
      const product = productById.get(item.productId);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);

    // 4. Promo code, reusing the exact same rules as /api/promo/validate.
    let discount = 0;
    let normalizedPromoCode: string | null = null;
    if (body.promoCode) {
      const promoResult = await validatePromoCode(client, body.promoCode, subtotal);
      if (!promoResult.ok) {
        return errorResponse("promo_invalid", 400, promoResult.reason);
      }
      discount = promoResult.discount;
      normalizedPromoCode = promoResult.code;
    }

    const deliveryPrice = 0;
    const total = Math.max(0, subtotal - discount + deliveryPrice);

    const rpcItems = body.items.map((item) => {
      const product = productById.get(item.productId) as ProductRow;
      const color = item.colorId !== undefined ? colorById.get(item.colorId) : undefined;
      const images = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);
      return {
        product_id: item.productId,
        product_name: product.name_uz,
        color_name: color?.name_uz ?? null,
        color_hex: color?.hex ?? null,
        price: product.price,
        qty: item.qty,
        image_url: images[0]?.url ?? null,
      };
    });

    const { data: rpcData, error: rpcError } = await client.rpc("create_order", {
      p_customer_name: body.customer.name,
      p_phone: body.customer.phone,
      p_region: body.customer.region,
      p_district: body.customer.district,
      p_street: body.customer.street,
      p_note: body.customer.note ?? null,
      p_items: rpcItems,
      p_subtotal: subtotal,
      p_discount: discount,
      p_delivery_price: deliveryPrice,
      p_total: total,
      p_promo_code: normalizedPromoCode,
    } as never);

    if (rpcError) {
      const message = rpcError.message ?? "";
      if (message.includes("out_of_stock")) {
        return errorResponse("out_of_stock", 409);
      }
      if (message.includes("promo_invalid")) {
        return errorResponse("promo_invalid", 409);
      }
      console.error("create order: create_order RPC failed", rpcError);
      return errorResponse("server_error", 500);
    }

    const resultRow = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as {
      out_order_id: number;
      out_order_number: string;
    };

    try {
      await sendOrderNotification(resultRow.out_order_id);
    } catch (notifyError) {
      console.error("create order: sendOrderNotification failed", notifyError);
    }

    return NextResponse.json<OrderResponse>({
      ok: true,
      orderNumber: resultRow.out_order_number,
      total,
    });
  } catch (error) {
    console.error("create order: unexpected failure", error);
    return errorResponse("server_error", 500);
  }
}
