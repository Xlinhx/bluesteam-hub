ALTER TABLE resource_group_members ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_resource_group_members_order ON resource_group_members(group_id, sort_order, resource_id);
