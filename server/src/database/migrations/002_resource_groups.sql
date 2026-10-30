CREATE TABLE resource_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES teachers(id) ON DELETE RESTRICT,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  cover_media_id UUID REFERENCES media_assets(id) ON DELETE RESTRICT,
  cover_crop JSONB NOT NULL DEFAULT '{"x":0.5,"y":0.5,"scale":1}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('draft','published','hidden')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_resource_groups_owner ON resource_groups(owner_id, sort_order, id);
CREATE INDEX idx_resource_groups_visibility ON resource_groups(visibility, sort_order, id);
CREATE INDEX idx_resource_groups_cover ON resource_groups(cover_media_id);
CREATE TABLE resource_group_members (
  group_id UUID NOT NULL REFERENCES resource_groups(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, resource_id)
);
CREATE INDEX idx_resource_group_members_resource ON resource_group_members(resource_id, group_id);
