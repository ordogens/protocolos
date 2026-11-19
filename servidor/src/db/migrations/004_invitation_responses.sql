ALTER TABLE invitation_recipients
  ADD COLUMN response_status text NOT NULL DEFAULT 'pending'
  CHECK (response_status IN ('pending', 'accepted', 'declined')),
  ADD COLUMN responded_at timestamptz,
  ADD COLUMN responder_user_id uuid REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX invitation_recipients_response_idx
  ON invitation_recipients(response_status)
  WHERE response_status = 'pending';
