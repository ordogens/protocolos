CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  channel text NOT NULL CHECK (channel IN ('telegram')),
  telegram_chat_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, channel, telegram_chat_id)
);

CREATE INDEX contacts_owner_user_id_idx ON contacts(owner_user_id);
