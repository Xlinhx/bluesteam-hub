-- Published columns remain the stable runtime contract. Editing never overwrites them.
ALTER TABLE creative_templates ADD COLUMN IF NOT EXISTS draft_data JSONB;
ALTER TABLE creative_templates ADD COLUMN IF NOT EXISTS edit_version INT NOT NULL DEFAULT 1;
ALTER TABLE creative_materials ADD COLUMN IF NOT EXISTS draft_data JSONB;
ALTER TABLE creative_materials ADD COLUMN IF NOT EXISTS edit_version INT NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS creative_template_materials (
  template_id UUID NOT NULL REFERENCES creative_templates(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES creative_materials(id) ON DELETE RESTRICT,
  revision TEXT NOT NULL CHECK (revision IN ('draft', 'published')),
  PRIMARY KEY (template_id, material_id, revision)
);
CREATE INDEX IF NOT EXISTS idx_creative_material_usage ON creative_template_materials(material_id, template_id);
