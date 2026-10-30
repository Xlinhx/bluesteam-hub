-- Additive standalone usage only. Room, identity, points and artwork data are untouched.
CREATE TABLE interactive_usage_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  open_key UUID NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('activity','model3d')),
  content_id UUID NOT NULL,
  content_version INTEGER NOT NULL CHECK (content_version > 0),
  kind TEXT NOT NULL CHECK (kind IN ('model3d','game','simulation','scenario')),
  definition_version INTEGER NOT NULL DEFAULT 1,
  snapshot JSONB NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX interactive_usage_runs_period_idx ON interactive_usage_runs(kind,opened_at);
CREATE INDEX interactive_usage_runs_content_idx ON interactive_usage_runs(content_type,content_id,content_version,opened_at);
CREATE TABLE interactive_usage_interactions (
  id BIGSERIAL PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES interactive_usage_runs(id),
  client_event_id UUID NOT NULL,
  payload JSONB NOT NULL,
  item_id TEXT NOT NULL,
  result JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id,client_event_id)
);
CREATE INDEX interactive_usage_interactions_run_idx ON interactive_usage_interactions(run_id,received_at,id);
