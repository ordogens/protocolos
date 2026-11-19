CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  protocol_id text NOT NULL CHECK (char_length(trim(protocol_id)) BETWEEN 1 AND 100),
  activity_id text NOT NULL CHECK (char_length(trim(activity_id)) BETWEEN 1 AND 100),
  scheduled_at timestamptz,
  status text NOT NULL CHECK (status IN ('pending', 'scheduled', 'processing', 'completed', 'cancelled', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

CREATE TABLE invitation_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  recipient_name text NOT NULL CHECK (char_length(trim(recipient_name)) BETWEEN 1 AND 100),
  channel text NOT NULL CHECK (channel IN ('telegram')),
  recipient_address text NOT NULL CHECK (char_length(trim(recipient_address)) BETWEEN 1 AND 100),
  status text NOT NULL CHECK (status IN ('pending', 'scheduled', 'sent', 'failed', 'cancelled')),
  delivery_attempts integer NOT NULL DEFAULT 0 CHECK (delivery_attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invitation_id, contact_id)
);

CREATE INDEX invitations_owner_created_at_idx ON invitations(owner_user_id, created_at DESC);
CREATE INDEX invitations_scheduled_at_idx ON invitations(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX invitation_recipients_invitation_id_idx ON invitation_recipients(invitation_id);
