ALTER TABLE resource_links ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_resource_links_target ON resource_links(target_resource_id);
