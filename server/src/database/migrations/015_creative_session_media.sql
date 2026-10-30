CREATE TABLE creative_scan_media (
 session_id uuid NOT NULL REFERENCES creative_scan_sessions(id) ON DELETE CASCADE,
 media_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
 PRIMARY KEY(session_id,media_id)
);
CREATE INDEX creative_scan_media_asset ON creative_scan_media(media_id);
