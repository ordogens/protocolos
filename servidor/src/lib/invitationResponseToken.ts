import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { env } from '../config/env';

function signature(recipientId: string): string {
  return createHmac('sha256', env.SESSION_SECRET).update(`invitation-response:${recipientId}`).digest('base64url');
}

export function createInvitationResponseToken(recipientId: string): string {
  return `${recipientId}.${signature(recipientId)}`;
}

export function readInvitationResponseToken(token: string): string | null {
  const [recipientId, providedSignature, ...extra] = token.split('.');
  if (!recipientId || !providedSignature || extra.length > 0 || !z.string().uuid().safeParse(recipientId).success) return null;
  const expectedSignature = signature(recipientId);
  const actual = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return recipientId;
}
