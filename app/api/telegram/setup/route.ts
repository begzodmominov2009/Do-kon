import { NextResponse, type NextRequest } from "next/server";
import { setTelegramWebhook } from "@/lib/telegram/api";

export const dynamic = "force-dynamic";

// One-time (or re-run-after-URL-change) helper: registers this deployment's
// /api/telegram/webhook with Telegram. Not something end users ever hit —
// gated to local development, or production with the webhook secret passed
// as ?key=.
export async function GET(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const isDev = process.env.NODE_ENV !== "production";
  const providedKey = request.nextUrl.searchParams.get("key");

  if (!isDev && (!secret || providedKey !== secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_WEBHOOK_SECRET sozlanmagan" },
      { status: 500 },
    );
  }

  if (request.nextUrl.protocol !== "https:") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Telegram webhook faqat HTTPS manzilda ishlaydi. Bu so'rovni Vercel'ga deploy qilingandan keyin, ochiq https manzil orqali yuboring.",
      },
      { status: 400 },
    );
  }

  const webhookUrl = `${request.nextUrl.origin}/api/telegram/webhook`;
  const result = await setTelegramWebhook(webhookUrl, secret);

  if (!result?.ok) {
    return NextResponse.json(
      { ok: false, error: result?.description ?? "setWebhook so'rovi muvaffaqiyatsiz tugadi" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, webhookUrl });
}
