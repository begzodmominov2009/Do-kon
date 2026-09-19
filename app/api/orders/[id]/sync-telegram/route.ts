import { NextResponse, type NextRequest } from "next/server";
import { syncOrderTelegramMessage } from "@/lib/telegram/notify";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

// Internal-only: lets another trusted backend (the admin panel, a separate
// deployment that shares this project's Supabase database) ask this app to
// re-render an order's Telegram message after it changed orders.status
// directly. Re-uses TELEGRAM_WEBHOOK_SECRET as the shared secret between
// the two backends — no new secret to provision.
//
// Deliberately does NOT change orders.status itself or touch stock — that
// stays solely inside the update_order_status RPC (see
// supabase/update_order_status_rpc.sql) so the logic is never duplicated.
// The caller must run that RPC (or otherwise write the new status) first;
// this endpoint just re-reads the order and re-renders the message.
export async function POST(request: NextRequest, { params }: RouteParams) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const provided = request.headers.get("x-internal-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  await syncOrderTelegramMessage(orderId);
  return NextResponse.json({ ok: true });
}
