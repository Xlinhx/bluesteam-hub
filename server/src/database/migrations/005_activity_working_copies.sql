-- Public activities and room snapshots continue to use the published columns.
-- A teacher's incomplete working copy is separate until an explicit publish.
ALTER TABLE activities ADD COLUMN draft_content jsonb;
