-- BlueSTEAM r2 Canonical PostgreSQL Schema (A2)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Teachers & Auth Sessions
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_teacher_id ON auth_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);

-- 2. Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'audio', 'video', 'pdf')),
  storage_key TEXT UNIQUE NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size > 0),
  width INT,
  height INT,
  duration_ms INT,
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
  original_filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_owner_status ON media_assets(owner_id, status, created_at DESC);

-- 3. Topics
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- 4. Resources (Flashcards, Videos, Printables)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('flashcard', 'card', 'image', 'audio', 'video', 'coloring', 'worksheet', 'poster', 'print')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('seed', 'draft', 'published', 'hidden')),
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_visibility_updated ON resources(visibility, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_resources_owner_updated ON resources(owner_id, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_resources_kind ON resources(kind);

CREATE TABLE IF NOT EXISTS resource_topics (
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_topics_topic_id ON resource_topics(topic_id, resource_id);

CREATE TABLE IF NOT EXISTS resource_links (
  source_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  target_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  relation_kind TEXT NOT NULL DEFAULT 'variant',
  PRIMARY KEY (source_resource_id, target_resource_id),
  CHECK (source_resource_id <> target_resource_id)
);

-- 5. Interactive Activities (Games, Scenarios, Simulations)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('game', 'scenario', 'simulation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  template_key TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  schema_version INT NOT NULL DEFAULT 1,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('seed', 'draft', 'published', 'hidden')),
  version INT NOT NULL DEFAULT 1,
  cover_media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  narration_media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_visibility_updated ON activities(visibility, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_activities_owner_updated ON activities(owner_id, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_activities_kind ON activities(kind);

CREATE TABLE IF NOT EXISTS activity_topics (
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (activity_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_topics_topic_id ON activity_topics(topic_id, activity_id);

-- 6. 3D Models (Sketchfab)
CREATE TABLE IF NOT EXISTS models_3d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'sketchfab' CHECK (provider = 'sketchfab'),
  model_uid TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  narration_media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('seed', 'draft', 'published', 'hidden')),
  version INT NOT NULL DEFAULT 1,
  attribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models_3d_visibility_updated ON models_3d(visibility, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_models_3d_owner_updated ON models_3d(owner_id, updated_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS model_topics (
  model_id UUID NOT NULL REFERENCES models_3d(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (model_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_model_topics_topic_id ON model_topics(topic_id, model_id);

-- 7. Creative Studio Templates & Materials
CREATE TABLE IF NOT EXISTS creative_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('drawing', 'habitat')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  schema_version INT NOT NULL DEFAULT 1,
  media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('seed', 'draft', 'published', 'hidden')),
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_templates_visibility_updated ON creative_templates(visibility, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_creative_templates_owner_updated ON creative_templates(owner_id, updated_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS creative_template_topics (
  template_id UUID NOT NULL REFERENCES creative_templates(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_creative_template_topics_topic_id ON creative_template_topics(topic_id, template_id);

CREATE TABLE IF NOT EXISTS creative_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('stamp', 'habitat_item')),
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('seed', 'draft', 'published', 'hidden')),
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_materials_visibility_updated ON creative_materials(visibility, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_creative_materials_owner_updated ON creative_materials(owner_id, updated_at DESC, id DESC);

-- 8. Rooms, Queue, Participants, Immutable Rounds
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  participation_mode TEXT NOT NULL CHECK (participation_mode IN ('individual-devices', 'shared-display', 'individual_devices', 'shared_display')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'ended')),
  join_code TEXT CHECK (join_code IS NULL OR join_code ~ '^[0-9]{6}$'),
  join_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  client_request_id TEXT,
  revision INT NOT NULL DEFAULT 1,
  active_round_id UUID,
  presentation_state JSONB NOT NULL DEFAULT '{"mode":"activity"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  UNIQUE (teacher_id, client_request_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_active_join_code
  ON rooms(join_code)
  WHERE status <> 'ended' AND join_enabled = TRUE AND join_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rooms_teacher_status_created
  ON rooms(teacher_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS room_queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  position INT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('resource', 'activity', 'model3d', 'creative_template')),
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, id)
);

CREATE INDEX IF NOT EXISTS idx_room_queue_items_room_position
  ON room_queue_items(room_id, position ASC);

CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  alias TEXT NOT NULL CHECK (char_length(alias) BETWEEN 1 AND 30),
  avatar_key TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'device' CHECK (kind IN ('device', 'teacher_managed')),
  token_hash TEXT UNIQUE,
  client_request_id TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, id),
  UNIQUE (room_id, client_request_id)
);

CREATE INDEX IF NOT EXISTS idx_room_participants_room_joined
  ON room_participants(room_id, joined_at ASC, id ASC);

CREATE TABLE IF NOT EXISTS room_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  queue_item_id UUID REFERENCES room_queue_items(id) ON DELETE SET NULL,
  content_snapshot JSONB NOT NULL,
  content_version INT NOT NULL DEFAULT 1,
  sequence INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  UNIQUE (room_id, sequence),
  UNIQUE (room_id, id)
);

CREATE INDEX IF NOT EXISTS idx_room_rounds_room_sequence
  ON room_rounds(room_id, sequence ASC);

-- 9. Submissions, Point Ledger, Artworks, Notes, Events, Display Sessions
CREATE TABLE IF NOT EXISTS round_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  round_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  client_event_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect', 'recorded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (participant_id, client_event_id),
  FOREIGN KEY (room_id, round_id) REFERENCES room_rounds(room_id, id) ON DELETE CASCADE,
  FOREIGN KEY (room_id, participant_id) REFERENCES room_participants(room_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_round_submissions_round_participant
  ON round_submissions(round_id, participant_id);

CREATE TABLE IF NOT EXISTS point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  round_id UUID,
  participant_id UUID NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('objective', 'teacher', 'reversal')),
  source_event_key TEXT UNIQUE NOT NULL,
  delta INT NOT NULL CHECK (delta <> 0),
  reason TEXT NOT NULL,
  created_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reverses_id UUID UNIQUE REFERENCES point_events(id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id, participant_id) REFERENCES room_participants(room_id, id) ON DELETE CASCADE,
  FOREIGN KEY (room_id, round_id) REFERENCES room_rounds(room_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_point_events_room_participant_created
  ON point_events(room_id, participant_id, created_at ASC);

CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  round_id UUID,
  participant_id UUID NOT NULL,
  client_submission_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('drawing', 'habitat')),
  title TEXT NOT NULL DEFAULT '',
  source_media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  preview_media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  scene_payload JSONB,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (participant_id, client_submission_id),
  FOREIGN KEY (room_id, participant_id) REFERENCES room_participants(room_id, id) ON DELETE CASCADE,
  FOREIGN KEY (room_id, round_id) REFERENCES room_rounds(room_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_artworks_room_created
  ON artworks(room_id, created_at DESC);

CREATE TABLE IF NOT EXISTS artwork_notes (
  artwork_id UUID PRIMARY KEY REFERENCES artworks(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sequence INT NOT NULL,
  event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, sequence)
);

CREATE INDEX IF NOT EXISTS idx_room_events_room_sequence
  ON room_events(room_id, sequence ASC);

CREATE TABLE IF NOT EXISTS display_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  scope TEXT NOT NULL DEFAULT 'readonly' CHECK (scope IN ('readonly', 'interactive_host')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Seed Mappings (Idempotent Traceability)
CREATE TABLE IF NOT EXISTS seed_mappings (
  source_key TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  source_checksum TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
