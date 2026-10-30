-- Room histories are intentionally retired. Restore the pre-migration backup
-- to recover them; artwork rows, media and notes remain in the active database.
ALTER TABLE artworks ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE artworks ALTER COLUMN author_name SET NOT NULL;
ALTER TABLE artworks ALTER COLUMN author_avatar_key SET NOT NULL;
CREATE INDEX idx_artworks_owner_created ON artworks(owner_id, created_at DESC, id DESC);
ALTER TABLE artworks DROP COLUMN room_id, DROP COLUMN round_id,
  DROP COLUMN participant_id, DROP COLUMN client_submission_id;
DROP TABLE display_sessions, room_events, point_events, round_submissions,
  room_rounds, room_queue_items, room_participants, rooms;
DELETE FROM seed_mappings WHERE target_type IN
  ('room', 'room_participant', 'point_event');
