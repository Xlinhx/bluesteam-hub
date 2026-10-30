-- Add learner accounts without changing existing teacher identities or sessions.
-- Rollback requires revoking learner sessions before dropping these added objects.
SET LOCAL lock_timeout = '5s';
CREATE TABLE learners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL CHECK (email = lower(btrim(email))),
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE auth_sessions ALTER COLUMN teacher_id DROP NOT NULL;
ALTER TABLE auth_sessions ADD COLUMN learner_id UUID REFERENCES learners(id) ON DELETE CASCADE;
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_one_account
  CHECK ((teacher_id IS NOT NULL) <> (learner_id IS NOT NULL));
CREATE INDEX idx_auth_sessions_learner_id ON auth_sessions(learner_id);
