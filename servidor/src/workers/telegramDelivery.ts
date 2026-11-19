import { createHash } from 'node:crypto';
import { pool } from '../db/pool';
import { env } from '../config/env';
import { createInvitationResponseToken } from '../lib/invitationResponseToken';
import { getUpdates, sendMessage, TelegramError } from '../lib/telegram';

interface ClaimedRecipient {
  id: string;
  invitation_id: string;
  recipient_name: string;
  recipient_address: string;
  protocol_id: string;
  activity_id: string;
  delivery_attempts: number;
}

async function saveOffset(offset: number): Promise<void> {
  await pool.query(
    `INSERT INTO worker_state (state_key, state_value) VALUES ('telegram_update_offset', $1)
     ON CONFLICT (state_key) DO UPDATE SET state_value = EXCLUDED.state_value, updated_at = now()`,
    [String(offset)],
  );
}

export async function processTelegramLinks(): Promise<number> {
  const state = await pool.query<{ state_value: string }>("SELECT state_value FROM worker_state WHERE state_key = 'telegram_update_offset'");
  const savedOffset = state.rows[0]?.state_value;
  const updates = await getUpdates(savedOffset ? Number(savedOffset) : undefined);
  let linked = 0;

  for (const update of updates) {
    const message = update.message;
    const match = message?.text?.match(/^\/start(?:\s+([A-Za-z0-9_-]{20,64}))?$/);
    if (message && match?.[1]) {
      const tokenHash = createHash('sha256').update(match[1]).digest('hex');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const link = await client.query<{ contact_id: string }>(
          `UPDATE telegram_contact_links
           SET used_at = now()
           WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
           RETURNING contact_id`,
          [tokenHash],
        );
        if (link.rowCount) {
          await client.query('UPDATE contacts SET telegram_chat_id = $1 WHERE id = $2', [String(message.chat.id), link.rows[0]!.contact_id]);
          await client.query('COMMIT');
          await sendMessage(String(message.chat.id), 'Listo. Tu cuenta de Telegram quedó vinculada a Protocolos.');
          linked += 1;
        } else {
          await client.query('ROLLBACK');
          await sendMessage(String(message.chat.id), 'Ese enlace ya fue usado o venció. Pide uno nuevo a quien te invitó.');
        }
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    } else if (message?.text?.startsWith('/start')) {
      await sendMessage(String(message.chat.id), 'Hola. Abre el enlace de invitación que te compartieron para vincular este chat.');
    }
    await saveOffset(update.update_id + 1);
  }
  return linked;
}

async function claimRecipients(batchSize: number): Promise<ClaimedRecipient[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE invitation_recipients
       SET status = 'pending', processing_started_at = NULL, next_attempt_at = now()
       WHERE status = 'processing' AND processing_started_at < now() - interval '5 minutes'`,
    );
    const result = await client.query<ClaimedRecipient>(
      `WITH jobs AS (
         SELECT recipient.id
         FROM invitation_recipients recipient
         JOIN invitations invitation ON invitation.id = recipient.invitation_id
         WHERE recipient.status = 'pending'
           AND invitation.status = 'pending'
           AND (recipient.next_attempt_at IS NULL OR recipient.next_attempt_at <= now())
         ORDER BY recipient.created_at ASC
         FOR UPDATE OF recipient SKIP LOCKED
         LIMIT $1
       )
       UPDATE invitation_recipients recipient
       SET status = 'processing', processing_started_at = now(), delivery_attempts = delivery_attempts + 1
       FROM jobs, invitations invitation
       WHERE recipient.id = jobs.id AND invitation.id = recipient.invitation_id
       RETURNING recipient.id, recipient.invitation_id, recipient.recipient_name, recipient.recipient_address,
                 invitation.protocol_id, invitation.activity_id, recipient.delivery_attempts`,
      [batchSize],
    );
    await client.query('COMMIT');
    return result.rows;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function refreshInvitation(invitationId: string): Promise<void> {
  await pool.query(
    `UPDATE invitations invitation
     SET status = CASE
       WHEN EXISTS (SELECT 1 FROM invitation_recipients WHERE invitation_id = invitation.id AND status = 'processing') THEN 'processing'
       WHEN EXISTS (SELECT 1 FROM invitation_recipients WHERE invitation_id = invitation.id AND status = 'pending') THEN 'pending'
       WHEN EXISTS (SELECT 1 FROM invitation_recipients WHERE invitation_id = invitation.id AND status = 'failed') THEN 'failed'
       ELSE 'completed'
     END
     WHERE id = $1`,
    [invitationId],
  );
}

export async function deliverPendingRecipients(batchSize: number): Promise<{ sent: number; failed: number }> {
  const recipients = await claimRecipients(batchSize);
  let sent = 0;
  let failed = 0;
  for (const recipient of recipients) {
    try {
      const responseUrl = new URL(`/invitaciones/${createInvitationResponseToken(recipient.id)}`, env.CORS_ORIGIN).toString();
      await sendMessage(recipient.recipient_address, `Tienes una invitación: ${recipient.protocol_id} · ${recipient.activity_id}.\n\nResponde aquí: ${responseUrl}`);
      await pool.query(
        `UPDATE invitation_recipients
         SET status = 'sent', sent_at = now(), processing_started_at = NULL, last_error = NULL
         WHERE id = $1 AND status = 'processing'`,
        [recipient.id],
      );
      sent += 1;
    } catch (error) {
      const telegramError = error instanceof TelegramError ? error : new TelegramError('telegram_delivery_failed');
      const retryable = !telegramError.status || telegramError.status === 429 || telegramError.status >= 500;
      const canRetry = retryable && recipient.delivery_attempts < 3;
      const delayMs = 30_000 * 2 ** (recipient.delivery_attempts - 1);
      await pool.query(
        `UPDATE invitation_recipients
         SET status = $2, processing_started_at = NULL, last_error = $3,
             next_attempt_at = $4
         WHERE id = $1 AND status = 'processing'`,
        [recipient.id, canRetry ? 'pending' : 'failed', telegramError.message.slice(0, 500), canRetry ? new Date(Date.now() + delayMs) : null],
      );
      if (!canRetry) failed += 1;
    }
    await refreshInvitation(recipient.invitation_id);
  }
  return { sent, failed };
}
