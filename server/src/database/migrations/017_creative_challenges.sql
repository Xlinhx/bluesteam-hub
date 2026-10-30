ALTER TABLE creative_scan_sessions ADD COLUMN challenge jsonb,
 ADD COLUMN client_request_id uuid, ADD COLUMN create_request_hash text,
 ADD CONSTRAINT creative_challenge_kind CHECK(challenge IS NULL OR kind='habitat'),
 ADD CONSTRAINT creative_create_request UNIQUE(owner_id,client_request_id);
CREATE INDEX creative_submission_project_revision ON creative_submissions(session_id,participant_id,client_submission_id,edit_version DESC,created_at DESC,id);
