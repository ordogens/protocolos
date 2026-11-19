import { Router, type Request } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { env } from '../config/env';
import { pool } from '../db/pool';
import { hashPassword, verifyPassword } from '../lib/password';

const credentials = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const router = Router();

function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => req.session.regenerate((error: Error | null) => error ? reject(error) : resolve()));
}

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    if (!env.ALLOW_REGISTRATION) return res.status(403).json({ error: 'registration_closed' });
    const input = credentials.parse(req.body);
    const passwordHash = await hashPassword(input.password);
    const result = await pool.query<{ id: string; email: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [input.email, passwordHash],
    );
    await regenerateSession(req);
    req.session.userId = result.rows[0]!.id;
    return res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'invalid_credentials' });
    if ((error as { code?: string }).code === '23505') return res.status(409).json({ error: 'email_in_use' });
    return next(error);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const input = credentials.parse(req.body);
    const result = await pool.query<{ id: string; email: string; password_hash: string }>('SELECT id, email, password_hash FROM users WHERE email = $1', [input.email]);
    const user = result.rows[0];
    if (!user || !(await verifyPassword(input.password, user.password_hash))) return res.status(401).json({ error: 'invalid_credentials' });
    await regenerateSession(req);
    req.session.userId = user.id;
    return res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'invalid_credentials' });
    return next(error);
  }
});

router.post('/logout', (req, res, next) => req.session.destroy((error) => error ? next(error) : res.status(204).end()));

router.get('/me', async (req, res, next) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'authentication_required' });
    const result = await pool.query<{ id: string; email: string }>('SELECT id, email FROM users WHERE id = $1', [req.session.userId]);
    if (!result.rows[0]) return res.status(401).json({ error: 'authentication_required' });
    return res.json({ user: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

export { router as authRouter };
