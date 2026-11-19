ALTER TABLE invitation_recipients DROP CONSTRAINT invitation_recipients_status_check;
ALTER TABLE invitation_recipients ADD CONSTRAINT invitation_recipients_status_check
  CHECK (status IN ('pending', 'scheduled', 'processing', 'sent', 'failed', 'cancelled'));
ALTER TABLE invitation_recipients ADD COLUMN processing_started_at timestamptz;
ALTER TABLE invitation_recipients ADD COLUMN next_attempt_at timestamptz;

CREATE INDEX invitation_recipients_pending_delivery_idx
  ON invitation_recipients(next_attempt_at, created_at)
  WHERE status = 'pending';

CREATE TABLE telegram_contact_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE worker_state (
  state_key text PRIMARY KEY,
  state_value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
