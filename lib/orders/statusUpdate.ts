import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { syncOrderTelegramMessage, type OrderStatusChange } from "@/lib/telegram/notify";
import type { OrderStatus } from "@/lib/types/db";

export type AssignableOrderStatus = Exclude<OrderStatus, "new">;

export type OrderStatusChangeResult =
  | { ok: true; changed: boolean }
  | { ok: false; error: string };

type UpdateOrderStatusRpcRow = { out_changed: boolean; out_previous_status: OrderStatus };

// The single place that changes an order's status. Restoring stock on
// cancellation happens inside the update_order_status RPC (see
// supabase/update_order_status_rpc.sql), so it runs atomically no matter
// which caller triggers it — the Telegram webhook here, or the admin panel,
// which must call this same function (or the RPC directly) instead of
// writing orders.status itself.
export async function applyOrderStatusChange(
  orderId: number,
  newStatus: AssignableOrderStatus,
  change?: OrderStatusChange,
): Promise<OrderStatusChangeResult> {
  const client = getSupabaseServerClient();

  const { data, error } = await client.rpc("update_order_status", {
    p_order_id: orderId,
    p_new_status: newStatus,
  } as never);

  if (error) {
    console.error("applyOrderStatusChange: update_order_status RPC xato berdi", error);
    return { ok: false, error: error.message };
  }

  const result = (Array.isArray(data) ? data[0] : data) as UpdateOrderStatusRpcRow | undefined;
  if (!result?.out_changed) {
    return { ok: true, changed: false };
  }

  await syncOrderTelegramMessage(orderId, change);
  return { ok: true, changed: true };
}
