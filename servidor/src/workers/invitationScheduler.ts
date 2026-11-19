import { pool } from '../db/pool';

export interface SchedulerResult {
  invitationsReleased: number;
  recipientsReleased: number;
}

/**
 * Claims a small batch of due invitations and makes their recipients available
 * to the future Telegram delivery worker. SKIP LOCKED makes concurrent workers safe.
 */
export async function releaseDueInvitations(batchSize: number): Promise<SchedulerResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const invitations = await client.query<{ id: string }>(
      `WITH due AS (
         SELECT id
         FROM invitations
         WHERE status = 'scheduled' AND scheduled_at <= now()
         ORDER BY scheduled_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT $1
       )
       UPDATE invitations AS invitation
       SET status = 'pending'
       FROM due
       WHERE invitation.id = due.id
       RETURNING invitation.id`,
      [batchSize],
    );

    const invitationIds = invitations.rows.map((invitation) => invitation.id);
    let recipientsReleased = 0;
    if (invitationIds.length > 0) {
      const recipients = await client.query<{ id: string }>(
        `UPDATE invitation_recipients
         SET status = 'pending'
         WHERE invitation_id = ANY($1::uuid[]) AND status = 'scheduled'
         RETURNING id`,
        [invitationIds],
      );
      recipientsReleased = recipients.rowCount ?? 0;
    }

    await client.query('COMMIT');
    return { invitationsReleased: invitationIds.length, recipientsReleased };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export function startInvitationScheduler(intervalMs: number, batchSize: number): () => void {
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      const result = await releaseDueInvitations(batchSize);
      if (result.invitationsReleased > 0) {
        console.info(`Scheduler released ${result.invitationsReleased} invitation(s) and ${result.recipientsReleased} recipient(s).`);
      }
    } catch (error) {
      console.error('Scheduler iteration failed:', error);
    } finally {
      running = false;
    }
  };

  void run();
  const timer = setInterval(() => { void run(); }, intervalMs);
  return () => clearInterval(timer);
}
