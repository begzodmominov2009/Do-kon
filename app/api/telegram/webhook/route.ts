import { NextResponse, type NextRequest } from "next/server";
import { answerCallbackQuery } from "@/lib/telegram/api";
import { applyOrderStatusChange, type AssignableOrderStatus } from "@/lib/orders/statusUpdate";

export const dynamic = "force-dynamic";

const ASSIGNABLE_STATUSES: AssignableOrderStatus[] = [
  "accepted",
  "shipping",
  "delivered",
  "cancelled",
];

const STATUS_VERB: Record<AssignableOrderStatus, string> = {
  accepted: "✅ Qabul qilindi",
  shipping: "🚚 Yo'lga chiqdi",
  delivered: "📦 Yetkazildi",
  cancelled: "❌ Bekor qilindi",
};

type TelegramUser = { id: number; username?: string; first_name: string };
type CallbackQuery = { id: string; from: TelegramUser; data?: string };
type TelegramUpdate = { callback_query?: CallbackQuery };

function isAssignableStatus(value: string): value is AssignableOrderStatus {
  return (ASSIGNABLE_STATUSES as string[]).includes(value);
}

function actorLabel(user: TelegramUser): string {
  return user.username ? `@${user.username}` : user.first_name;
}

// This route sits on the open internet — anyone who finds the URL could try
// to flip order statuses without the secret check below. Telegram sends the
// secret it was configured with (see setWebhook in app/api/telegram/setup)
// on every request; a mismatch must short-circuit before touching anything.
export async function POST(request: NextRequest) {
  const providedSecret = request.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const callback = update.callback_query;
  if (!callback?.data) {
    return NextResponse.json({ ok: true });
  }

  const match = /^order:(\d+):([a-z]+)$/.exec(callback.data);
  if (!match || !isAssignableStatus(match[2])) {
    await answerCallbackQuery(callback.id, "Noto'g'ri so'rov");
    return NextResponse.json({ ok: true });
  }

  const orderId = Number(match[1]);
  const newStatus = match[2];

  // Telegram waits ~10s for a response — everything below is one RPC call
  // plus at most two outgoing Telegram API calls, so this stays well inside
  // that budget.
  try {
    const result = await applyOrderStatusChange(orderId, newStatus, {
      verb: STATUS_VERB[newStatus],
      actor: actorLabel(callback.from),
    });

    if (!result.ok) {
      await answerCallbackQuery(callback.id, "Xatolik yuz berdi");
    } else if (!result.changed) {
      await answerCallbackQuery(callback.id, "Allaqachon o'zgartirilgan");
    } else {
      await answerCallbackQuery(callback.id, "Yangilandi");
    }
  } catch (error) {
    console.error("telegram webhook: kutilmagan xatolik", error);
    await answerCallbackQuery(callback.id, "Xatolik yuz berdi");
  }

  return NextResponse.json({ ok: true });
}
