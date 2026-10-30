-- Preserve edits while bringing older published records onto the revision counter.
UPDATE creative_templates SET edit_version=GREATEST(edit_version,version);
UPDATE creative_materials SET edit_version=GREATEST(edit_version,version);
