-- Narrow creative destinations only; no class, lesson, round or room entities.
CREATE TABLE creative_scan_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
 title text NOT NULL CHECK (length(title) BETWEEN 1 AND 120), kind text NOT NULL CHECK (kind IN ('scan','habitat')),
 code char(6) UNIQUE NOT NULL, state text NOT NULL DEFAULT 'open' CHECK (state IN ('open','paused','ended')),
 environment_id text NOT NULL DEFAULT 'reef', motion_paused boolean NOT NULL DEFAULT false, review_required boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '1 day'
);
CREATE INDEX creative_scan_owner_created ON creative_scan_sessions(owner_id,created_at DESC,id);
CREATE TABLE creative_scan_tokens (
 token_hash text PRIMARY KEY, session_id uuid NOT NULL REFERENCES creative_scan_sessions(id) ON DELETE CASCADE,
 participant_id uuid NOT NULL DEFAULT gen_random_uuid(), role text NOT NULL CHECK(role IN ('participant','operator','display')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX creative_scan_token_session ON creative_scan_tokens(session_id);
CREATE TABLE creative_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES creative_scan_sessions(id) ON DELETE CASCADE,
 participant_id uuid NOT NULL, client_submission_id text NOT NULL, edit_version int NOT NULL CHECK(edit_version>=0),
 alias text NOT NULL CHECK(length(alias) BETWEEN 1 AND 80), kind text NOT NULL CHECK(kind IN ('scan','habitat')),
 status text NOT NULL CHECK(status IN ('ready','released','needs_retry')), preview text NOT NULL,
 document jsonb NOT NULL, content_hash text NOT NULL, teacher_note text NOT NULL DEFAULT '', hidden boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(session_id,participant_id,client_submission_id,edit_version)
);
CREATE INDEX creative_submission_session_created ON creative_submissions(session_id,created_at DESC,id);
CREATE TABLE creative_scan_events (
 seq bigserial PRIMARY KEY, session_id uuid NOT NULL REFERENCES creative_scan_sessions(id) ON DELETE CASCADE,
 event_type text NOT NULL, submission_id uuid REFERENCES creative_submissions(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX creative_scan_event_resume ON creative_scan_events(session_id,seq);
