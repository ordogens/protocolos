import { env } from '../config/env';

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

export interface TelegramUpdate {
  update_id: number;
  message?: { text?: string; chat: { id: number }; from?: { first_name?: string } };
}

export class TelegramError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

async function request<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new TelegramError('telegram_not_configured');
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json() as TelegramResponse<T>;
  if (!response.ok || !payload.ok || payload.result === undefined) {
    throw new TelegramError(payload.description ?? 'telegram_request_failed', payload.error_code ?? response.status);
  }
  return payload.result;
}

export async function getBotUsername(): Promise<string> {
  const bot = await request<{ username?: string }>('getMe');
  if (!bot.username) throw new TelegramError('telegram_bot_has_no_username');
  return bot.username;
}

export function getUpdates(offset?: number): Promise<TelegramUpdate[]> {
  return request<TelegramUpdate[]>('getUpdates', { timeout: 0, allowed_updates: ['message'], ...(offset === undefined ? {} : { offset }) });
}

export function sendMessage(chatId: string, text: string): Promise<{ message_id: number }> {
  return request<{ message_id: number }>('sendMessage', { chat_id: chatId, text });
}
