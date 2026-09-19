import "server-only";

// Thin wrapper around the Telegram Bot API — the only place that knows the
// HTTP shape of sendMessage / editMessageText / answerCallbackQuery /
// setWebhook. Both lib/telegram/notify.ts and the webhook route call these
// instead of hitting fetch() directly, so retry/error handling lives once.

const TELEGRAM_API_BASE = "https://api.telegram.org";

export type InlineKeyboardButton = { text: string; callback_data: string };
export type InlineKeyboard = InlineKeyboardButton[][];

type TelegramApiResult<T> =
  | { ok: true; result: T }
  | {
      ok: false;
      error_code: number;
      description: string;
      parameters?: { retry_after?: number };
    };

function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

async function callTelegramApi<T>(
  method: string,
  payload: Record<string, unknown>,
): Promise<TelegramApiResult<T> | null> {
  const token = getBotToken();
  if (!token) {
    console.error(`telegram: TELEGRAM_BOT_TOKEN sozlanmagan, ${method} chaqirilmadi`);
    return null;
  }

  const url = `${TELEGRAM_API_BASE}/bot${token}/${method}`;

  const doCall = async (): Promise<TelegramApiResult<T>> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await response.json()) as TelegramApiResult<T>;
  };

  try {
    let result = await doCall();

    if (!result.ok && result.error_code === 429 && result.parameters?.retry_after) {
      const waitMs = Math.min(result.parameters.retry_after, 10) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      result = await doCall();
    }

    if (!result.ok) {
      console.error(`telegram: ${method} failed`, result.description);
    }
    return result;
  } catch (error) {
    console.error(`telegram: ${method} request failed`, error);
    return null;
  }
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<{ message_id: number } | null> {
  const result = await callTelegramApi<{ message_id: number }>("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined,
  });
  return result?.ok ? result.result : null;
}

// Returns false (never throws) when Telegram refuses the edit — e.g. the
// message was deleted, or the text+markup are already identical. Callers
// treat that as a no-op, not an error.
export async function editTelegramMessage(
  chatId: string,
  messageId: number,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<boolean> {
  const result = await callTelegramApi<unknown>("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard ?? [] },
  });
  if (!result || !result.ok) return false;
  return true;
}

// Always call this for every callback_query, even on failure — otherwise
// the button in Telegram spins forever waiting for a response.
export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  await callTelegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

export async function setTelegramWebhook(
  url: string,
  secretToken: string,
): Promise<TelegramApiResult<boolean> | null> {
  return callTelegramApi<boolean>("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["callback_query"],
  });
}
