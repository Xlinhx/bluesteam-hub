CREATE TABLE interactive_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES teachers(id),
  title TEXT NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 100),
  cover_media_id UUID REFERENCES media_assets(id),
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('draft','published','hidden')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX interactive_groups_owner_idx ON interactive_groups(owner_id);
CREATE TABLE interactive_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES interactive_groups(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models_3d(id) ON DELETE CASCADE,
  CHECK ((activity_id IS NOT NULL)::int + (model_id IS NOT NULL)::int = 1),
  UNIQUE(group_id,activity_id),
  UNIQUE(group_id,model_id)
);
CREATE INDEX interactive_members_activity_idx ON interactive_group_members(activity_id) WHERE activity_id IS NOT NULL;
CREATE INDEX interactive_members_model_idx ON interactive_group_members(model_id) WHERE model_id IS NOT NULL;
