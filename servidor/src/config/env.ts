import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  ALLOW_REGISTRATION: z.enum(['true', 'false']).default('true').transform((value) => value === 'true'),
  WORKER_INTERVAL_MS: z.coerce.number().int().min(1_000).max(300_000).default(30_000),
  WORKER_BATCH_SIZE: z.coerce.number().int().min(1).max(100).default(25),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
});

export const env = schema.parse(process.env);
