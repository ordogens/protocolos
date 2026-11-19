import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/requireAuth';

type InvitationStatus = 'pending' | 'scheduled' | 'processing' | 'completed' | 'cancelled' | 'failed';
type RecipientStatus = 'pending' | 'scheduled' | 'sent' | 'failed' | 'cancelled';

interface ContactRow {
  id: string;
  name: string;
  channel: 'telegram';
  telegram_chat_id: string;
}

interface InvitationRow {
  id: string;
  protocol_id: string;
  activity_id: string;
  scheduled_at: Date | null;
  status: InvitationStatus;
  created_at: Date;
  cancelled_at: Date | null;
  recipient_id: string | null;
  contact_id: string | null;
  recipient_name: string | null;
  channel: 'telegram' | null;
  recipient_address: string | null;
  recipient_status: RecipientStatus | null;
  sent_at: Date | null;
  response_status: 'pending' | 'accepted' | 'declined' | null;
  responded_at: Date | null;
}

const input = z.object({
  protocolId: z.string().trim().min(1).max(100),
  activityId: z.string().trim().min(1).max(100),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
  recipientIds: z.array(z.string().uuid()).min(1).max(50),
}).superRefine((value, context) => {
  if (new Set(value.recipientIds).size !== value.recipientIds.length) {
    context.addIssue({ code: 'custom', path: ['recipientIds'], message: 'duplicate recipients' });
  }
});

const idInput = z.string().uuid();

function serialize(rows: InvitationRow[]) {
  const first = rows[0];
  if (!first) return null;
  return {
    id: first.id,
    protocolId: first.protocol_id,
    activityId: first.activity_id,
    scheduledAt: first.scheduled_at?.toISOString() ?? null,
    status: first.status,
    createdAt: first.created_at.toISOString(),
    cancelledAt: first.cancelled_at?.toISOString() ?? null,
    recipients: rows.flatMap((row) => row.recipient_id && row.recipient_name && row.channel && row.recipient_address && row.recipient_status ? [{
      id: row.recipient_id,
      contactId: row.contact_id,
      name: row.recipient_name,
      channel: row.channel,
      contact: row.recipient_address,
      status: row.recipient_status,
      sentAt: row.sent_at?.toISOString() ?? null,
      responseStatus: row.response_status,
      respondedAt: row.responded_at?.toISOString() ?? null,
    }] : []),
  };
}

async function getInvitationRows(ownerUserId: string, invitationId?: string) {
  const result = await pool.query<InvitationRow>(
    `SELECT i.id, i.protocol_id, i.activity_id, i.scheduled_at, i.status, i.created_at, i.cancelled_at,
            ir.id AS recipient_id, ir.contact_id, ir.recipient_name, ir.channel, ir.recipient_address,
            ir.status AS recipient_status, ir.sent_at, ir.response_status, ir.responded_at
     FROM invitations i
     LEFT JOIN invitation_recipients ir ON ir.invitation_id = i.id
     WHERE i.owner_user_id = $1 ${invitationId ? 'AND i.id = $2' : ''}
     ORDER BY i.created_at DESC, ir.created_at ASC`,
    invitationId ? [ownerUserId, invitationId] : [ownerUserId],
  );
  return result.rows;
}

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const ownerUserId = req.session.userId;
    if (!ownerUserId) return res.status(401).json({ error: 'authentication_required' });
    const rows = await getInvitationRows(ownerUserId);
    const grouped = new Map<string, InvitationRow[]>();
    for (const row of rows) grouped.set(row.id, [...(grouped.get(row.id) ?? []), row]);
    res.json({ invitations: [...grouped.values()].map(serialize) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const ownerUserId = req.session.userId;
    if (!ownerUserId) return res.status(401).json({ error: 'authentication_required' });
    const invitation = input.parse(req.body);
    const scheduledAt = invitation.scheduledAt ? new Date(invitation.scheduledAt) : null;
    if (scheduledAt && scheduledAt.getTime() <= Date.now()) {
      return res.status(422).json({ error: 'scheduled_at_must_be_future' });
    }

    await client.query('BEGIN');
    const contacts = await client.query<ContactRow>(
      `SELECT id, name, channel, telegram_chat_id
       FROM contacts
       WHERE owner_user_id = $1 AND id = ANY($2::uuid[])`,
      [ownerUserId, invitation.recipientIds],
    );
    if (contacts.rowCount !== invitation.recipientIds.length) {
      await client.query('ROLLBACK');
      return res.status(422).json({ error: 'recipient_not_found' });
    }

    const status: InvitationStatus = scheduledAt ? 'scheduled' : 'pending';
    const recipientStatus: RecipientStatus = scheduledAt ? 'scheduled' : 'pending';
    const created = await client.query<{ id: string }>(
      `INSERT INTO invitations (owner_user_id, protocol_id, activity_id, scheduled_at, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [ownerUserId, invitation.protocolId, invitation.activityId, scheduledAt, status],
    );
    const invitationId = created.rows[0]!.id;
    for (const contact of contacts.rows) {
      await client.query(
        `INSERT INTO invitation_recipients
         (invitation_id, contact_id, recipient_name, channel, recipient_address, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [invitationId, contact.id, contact.name, contact.channel, contact.telegram_chat_id, recipientStatus],
      );
    }
    await client.query('COMMIT');

    const rows = await getInvitationRows(ownerUserId, invitationId);
    return res.status(201).json({ invitation: serialize(rows) });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'invalid_invitation' });
    return next(error);
  } finally {
    client.release();
  }
});

router.post('/:invitationId/cancel', async (req, res, next) => {
  try {
    const ownerUserId = req.session.userId;
    if (!ownerUserId) return res.status(401).json({ error: 'authentication_required' });
    const invitationId = idInput.parse(req.params.invitationId);
    const result = await pool.query<{ id: string }>(
      `UPDATE invitations
       SET status = 'cancelled', cancelled_at = now()
       WHERE id = $1 AND owner_user_id = $2 AND status IN ('pending', 'scheduled')
       RETURNING id`,
      [invitationId, ownerUserId],
    );
    if (!result.rowCount) return res.status(404).json({ error: 'invitation_not_found_or_not_cancellable' });
    await pool.query(
      `UPDATE invitation_recipients SET status = 'cancelled'
       WHERE invitation_id = $1 AND status IN ('pending', 'scheduled')`,
      [invitationId],
    );
    const rows = await getInvitationRows(ownerUserId, invitationId);
    return res.json({ invitation: serialize(rows) });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'invalid_invitation_id' });
    return next(error);
  }
});

export { router as invitationsRouter };
