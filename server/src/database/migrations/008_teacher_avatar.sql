-- Additive change: existing accounts continue to use initials until an avatar is saved.
ALTER TABLE teachers ADD COLUMN avatar_key TEXT;
ALTER TABLE teachers ADD COLUMN avatar_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE teachers ADD CONSTRAINT teachers_avatar_source CHECK (avatar_key IS NULL OR avatar_media_id IS NULL);
