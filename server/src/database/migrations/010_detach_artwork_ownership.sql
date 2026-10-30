-- Preserve artwork identity and private ownership before retiring room records.
ALTER TABLE artworks ADD COLUMN owner_id UUID REFERENCES teachers(id) ON DELETE RESTRICT;
ALTER TABLE artworks ADD COLUMN author_name TEXT;
ALTER TABLE artworks ADD COLUMN author_avatar_key TEXT;

