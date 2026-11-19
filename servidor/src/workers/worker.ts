import { env } from '../config/env';
import { pool } from '../db/pool';
import { releaseDueInvitations, startInvitationScheduler } from './invitationScheduler';
import { deliverPendingRecipients, processTelegramLinks } from './telegramDelivery';

async function runOnce(): Promise<void> {
  const result = await releaseDueInvitations(env.WORKER_BATCH_SIZE);
  if (env.TELEGRAM_BOT_TOKEN) {
    const linked = await processTelegramLinks();
    const delivery = await deliverPendingRecipients(env.WORKER_BATCH_SIZE);
    console.info(`Worker completed: ${result.invitationsReleased} invitation(s), ${result.recipientsReleased} recipient(s) released, ${linked} link(s), ${delivery.sent} sent, ${delivery.failed} failed.`);
  } else {
    console.info(`Worker completed: ${result.invitationsReleased} invitation(s), ${result.recipientsReleased} recipient(s) released. Telegram is not configured.`);
  }
}

async function main(): Promise<void> {
  if (process.argv.includes('--once')) {
    try {
      await runOnce();
    } finally {
      await pool.end();
    }
    return;
  }

  const stop = startInvitationScheduler(env.WORKER_INTERVAL_MS, env.WORKER_BATCH_SIZE);
  const telegramTimer = env.TELEGRAM_BOT_TOKEN
    ? setInterval(() => { void runOnce().catch((error) => console.error('Telegram worker iteration failed:', error)); }, env.WORKER_INTERVAL_MS)
    : undefined;
  console.info(`Invitation scheduler listening every ${env.WORKER_INTERVAL_MS}ms.`);
  const shutdown = async () => {
    stop();
    if (telegramTimer) clearInterval(telegramTimer);
    await pool.end();
    process.exit(0);
  };
  process.once('SIGINT', () => { void shutdown(); });
  process.once('SIGTERM', () => { void shutdown(); });
}

main().catch((error) => {
  console.error('Worker failed to start:', error);
  process.exitCode = 1;
});
