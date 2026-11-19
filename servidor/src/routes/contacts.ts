import { createHash, randomBytes } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { getBotUsername, TelegramError } from '../lib/telegram';
import { requireAuth } from '../middleware/requireAuth';

interface ContactRow {
  id: string;
  name: string;
  channel: 'telegram';
  telegram_chat_id: string | null;
}

const input = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().max(100).optional().transform((value) => value || undefined),
});
const idInput = z.string().uuid();

const router = Router();
router.use(requireAuth);

function serialize(contact: ContactRow) {
  return { id: contact.id, name: contact.name, channel: contact.channel, contact: contact.telegram_chat_id ?? '' };
}

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query<ContactRow>(
      'SELECT id, name, channel, telegram_chat_id FROM contacts WHERE owner_user_id = $1 ORDER BY created_at DESC',
      [req.session.userId],
    );
    res.json({ contacts: result.rows.map(serialize) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const contact = input.parse(req.body);
    const result = await pool.query<ContactRow>(
      `INSERT INTO contacts (owner_user_id, name, channel, telegram_chat_id)
       VALUES ($1, $2, 'telegram', $3)
       RETURNING id, name, channel, telegram_chat_id`,
      [req.session.userId, contact.name, contact.contact ?? null],
    );
    res.status(201).json({ contact: serialize(result.rows[0]!) });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'invalid_contact' });
    if ((error as { code?: string }).code === '23505') return res.status(409).json({ error: 'contact_in_use' });
    return next(error);
  }
});

router.delete('/:contactId', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM contacts WHERE id = $1 AND owner_user_id = $2', [req.params.contactId, req.session.userId]);
    if (!result.rowCount) return res.status(404).json({ error: 'contact_not_found' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

router.post('/:contactId/telegram-link', async (req, res, next) => {
  try {
    const contactId = idInput.parse(req.params.contactId);
    const contact = await pool.query('SELECT id FROM contacts WHERE id = $1 AND owner_user_id = $2', [contactId, req.session.userId]);
    if (!contact.rowCount) return res.status(404).json({ error: 'contact_not_found' });

    const token = randomBytes(24).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO telegram_contact_links (contact_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [contactId, tokenHash, expiresAt],
    );
    const botUsername = await getBotUsername();
    return res.json({ link: `https://t.me/${botUsername}?start=${token}`, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'invalid_contact_id' });
    if (error instanceof TelegramError) return res.status(503).json({ error: 'telegram_unavailable' });
    return next(error);
  }
});

export { router as contactsRouter };
