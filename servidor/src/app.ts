import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import { env } from './config/env';
import { pool } from './db/pool';
import { authRouter } from './routes/auth';
import { contactsRouter } from './routes/contacts';
import { invitationsRouter } from './routes/invitations';
import { invitationResponsesRouter } from './routes/invitationResponses';

const PgSession = connectPgSimple(session);
export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '16kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(session({
  name: 'protocol.sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PgSession({ pool, createTableIfMissing: true }),
  cookie: { httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/invitation-responses', invitationResponsesRouter);

app.use((_req, res) => res.status(404).json({ error: 'not_found' }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'internal_error' });
});
