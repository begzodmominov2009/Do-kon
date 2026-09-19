import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { OrderStatus } from "@/lib/types/db";
import {
  sendTelegramMessage,
  editTelegramMessage,
  type InlineKeyboard,
} from "./api";

// orders.delivery_method / payment_method store the option id from
// DeliveryMethod.tsx / PaymentMethod.tsx ("bts", "card") — only one of each
// exists today, but this maps the id to a display label rather than
// hardcoding it, so a new option only needs an entry here.
const DELIVERY_LABELS: Record<string, string> = { bts: "BTS pochta" };
const PAYMENT_LABELS: Record<string, string> = { card: "Kartadan kartaga" };

function labelFor(map: Record<string, string>, key: string): string {
  return map[key] ?? key;
}

type OrderRow = {
  id: number;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  region: string;
  district: string;
  street: string;
  note: string | null;
  delivery_method: string;
  payment_method: string;
  subtotal: number;
  discount: number;
  promo_code: string | null;
  total: number;
  telegram_msg_id: number | null;
  created_at: string;
};

type OrderItemRow = {
  product_name: string;
  color_name: string | null;
  price: number;
  qty: number;
};

const ORDER_COLUMNS =
  "id, order_number, status, customer_name, phone, region, district, street, note, delivery_method, payment_method, subtotal, discount, promo_code, total, telegram_msg_id, created_at";
const ORDER_ITEM_COLUMNS = "product_name, color_name, price, qty";

async function fetchOrder(
  orderId: number,
): Promise<{ order: OrderRow; items: OrderItemRow[] } | null> {
  const client = getSupabaseServerClient();

  const { data: orderData, error: orderError } = await client
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    console.error("telegram notify: buyurtmani yuklab bo'lmadi", orderError);
    return null;
  }
  if (!orderData) return null;

  const { data: itemRows, error: itemsError } = await client
    .from("order_items")
    .select(ORDER_ITEM_COLUMNS)
    .eq("order_id", orderId);

  if (itemsError) {
    console.error("telegram notify: mahsulotlarni yuklab bo'lmadi", itemsError);
    return null;
  }

  return { order: orderData as OrderRow, items: (itemRows ?? []) as OrderItemRow[] };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// "+998901234567" -> "+998 90 123 45 67"
function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.slice(-9);
  const countryCode = digits.slice(0, digits.length - 9) || "998";
  return `+${countryCode} ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
}

function getTashkentParts(date: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function formatTashkentDateTime(iso: string): string {
  const p = getTashkentParts(new Date(iso));
  return `${p.day}.${p.month}.${p.year}, ${p.hour}:${p.minute}`;
}

function formatTashkentTime(date: Date): string {
  const p = getTashkentParts(date);
  return `${p.hour}:${p.minute}`;
}

function buildOrderMessage(order: OrderRow, items: OrderItemRow[]): string {
  const lines: string[] = [];

  lines.push(`🛒 <b>YANGI BUYURTMA #${escapeHtml(order.order_number)}</b>`, "");
  lines.push(`👤 <b>Ism:</b> ${escapeHtml(order.customer_name)}`);
  lines.push(
    `📞 <b>Telefon:</b> <a href="tel:${escapeHtml(order.phone)}">${formatPhoneDisplay(order.phone)}</a>`,
  );
  lines.push(
    `📍 <b>Manzil:</b> ${escapeHtml(order.region)}, ${escapeHtml(order.district)}, ${escapeHtml(order.street)}`,
  );
  if (order.note && order.note.trim()) {
    lines.push(`📝 <b>Izoh:</b> ${escapeHtml(order.note)}`);
  }

  lines.push("", "<b>MAHSULOTLAR:</b>");
  for (const item of items) {
    const colorSuffix = item.color_name ? ` (${escapeHtml(item.color_name)})` : "";
    lines.push(
      `- ${escapeHtml(item.product_name)}${colorSuffix} × ${item.qty} — ${formatPrice(item.price * item.qty)} so'm`,
    );
  }

  lines.push("", `💰 <b>Mahsulotlar:</b> ${formatPrice(order.subtotal)} so'm`);
  if (order.promo_code && order.discount > 0) {
    lines.push(`🎟 <b>Promokod (${escapeHtml(order.promo_code)}):</b> −${formatPrice(order.discount)} so'm`);
  }
  lines.push(`🚚 <b>Yetkazib berish:</b> ${escapeHtml(labelFor(DELIVERY_LABELS, order.delivery_method))}`);
  lines.push(`💳 <b>To'lov:</b> ${escapeHtml(labelFor(PAYMENT_LABELS, order.payment_method))}`);

  lines.push("", `<b>JAMI: ${formatPrice(order.total)} so'm</b>`);
  lines.push("", `🕐 ${formatTashkentDateTime(order.created_at)}`);

  return lines.join("\n");
}

function buildKeyboard(status: OrderStatus, orderId: number): InlineKeyboard | undefined {
  switch (status) {
    case "new":
      return [
        [
          { text: "✅ Qabul qilish", callback_data: `order:${orderId}:accepted` },
          { text: "❌ Bekor qilish", callback_data: `order:${orderId}:cancelled` },
        ],
      ];
    case "accepted":
      return [
        [
          { text: "🚚 Yo'lga chiqdi", callback_data: `order:${orderId}:shipping` },
          { text: "❌ Bekor qilish", callback_data: `order:${orderId}:cancelled` },
        ],
      ];
    case "shipping":
      return [[{ text: "📦 Yetkazildi", callback_data: `order:${orderId}:delivered` }]];
    case "delivered":
    case "cancelled":
      return undefined;
  }
}

// sendTelegramMessage/editTelegramMessage already no-op (and log) when the
// bot token is missing — this only needs to additionally guard the chat id.
function getTelegramChatId(): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("telegram notify: TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan");
    return null;
  }
  return chatId;
}

// Sends the initial "new order" notification and remembers its message_id
// so later status changes can edit the same message. Never throws — a
// Telegram outage must not fail the order itself.
export async function sendOrderNotification(orderId: number): Promise<void> {
  try {
    const chatId = getTelegramChatId();
    if (!chatId) return;

    const data = await fetchOrder(orderId);
    if (!data) {
      console.error(`telegram notify: buyurtma #${orderId} topilmadi`);
      return;
    }

    const text = buildOrderMessage(data.order, data.items);
    const keyboard = buildKeyboard(data.order.status, data.order.id);
    const sent = await sendTelegramMessage(chatId, text, keyboard);
    if (!sent) return;

    const { error } = await getSupabaseServerClient()
      .from("orders")
      .update({ telegram_msg_id: sent.message_id } as never)
      .eq("id", orderId);

    if (error) {
      console.error("telegram notify: telegram_msg_id saqlanmadi", error);
    }
  } catch (error) {
    console.error("telegram notify: kutilmagan xatolik", error);
  }
}

export type OrderStatusChange = { verb: string; actor: string };

// Re-renders the existing Telegram message after orders.status changes —
// current text, current buttons, plus a one-line "who/when" note when the
// change came from a known actor (bot button click). Called by both the
// webhook and (once wired up) the admin panel via
// lib/orders/statusUpdate.ts, so this is the one place that formats the
// synced message.
export async function syncOrderTelegramMessage(
  orderId: number,
  change?: OrderStatusChange,
): Promise<void> {
  try {
    const chatId = getTelegramChatId();
    if (!chatId) return;

    const data = await fetchOrder(orderId);
    if (!data || data.order.telegram_msg_id === null) return;

    let text = buildOrderMessage(data.order, data.items);
    if (change) {
      text += `\n\n${change.verb} — ${escapeHtml(change.actor)}, ${formatTashkentTime(new Date())}`;
    }

    const keyboard = buildKeyboard(data.order.status, data.order.id);
    // A failed edit (message deleted, or text unchanged) is logged inside
    // editTelegramMessage and swallowed here — never an error to the caller.
    await editTelegramMessage(chatId, data.order.telegram_msg_id, text, keyboard);
  } catch (error) {
    console.error("telegram notify: xabarni yangilab bo'lmadi", error);
  }
}
