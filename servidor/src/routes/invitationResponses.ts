import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { readInvitationResponseToken } from '../lib/invitationResponseToken';
import { requireAuth } from '../middleware/requireAuth';

const responseInput = z.object({ response: z.enum(['accepted', 'declined']) });

function recipientIdFromToken(token: string) {
  return readInvitationResponseToken(token);
}

const router = Router();
router.use(requireAuth);

router.get('/:token', async (req, res, next) => {
  try {
    const recipientId = recipientIdFromToken(req.params.token);
    if (!recipientId) return res.status(404).json({ error: 'invitation_not_found' });
    const result = await pool.query(
      `SELECT invitation.protocol_id, invitation.activity_id, invitation.scheduled_at,
              recipient.response_status, recipient.responded_at
       FROM invitation_recipients recipient
       JOIN invitations invitation ON invitation.id = recipient.invitation_id
       WHERE recipient.id = $1`,
      [recipientId],
    );
    if (!result.rowCount) return res.status(404).json({ error: 'invitation_not_found' });
    const row = result.rows[0]!;
    return res.json({ invitation: {
      protocolId: row.protocol_id,
      activityId: row.activity_id,
      scheduledAt: row.scheduled_at?.toISOString() ?? null,
      responseStatus: row.response_status,
      respondedAt: row.responded_at?.toISOString() ?? null,
    } });
  } catch (error) { return next(error); }
});

router.post('/:token', async (req, res, next) => {
  try {
    const ownerUserId = req.session.userId;
    if (!ownerUserId) return res.status(401).json({ error: 'authentication_required' });
    const recipientId = recipientIdFromToken(req.params.token);
    if (!recipientId) return res.status(404).json({ error: 'invitation_not_found' });
    const { response } = responseInput.parse(req.body);
    const result = await pool.query(
      `UPDATE invitation_recipients
       SET response_status = $2, responded_at = now(), responder_user_id = $3
       WHERE id = $1 AND response_status = 'pending'
       RETURNING response_status, responded_at`,
      [recipientId, response, ownerUserId],
    );
    if (!result.rowCount) return res.status(409).json({ error: 'invitation_already_answered' });
    const row = result.rows[0]!;
    return res.json({ responseStatus: row.response_status, respondedAt: row.responded_at.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'invalid_response' });
    return next(error);
  }
});

export { router as invitationResponsesRouter };
