-- Retire drafts without publishing unfinished material or changing identity/links.
SET LOCAL lock_timeout = '5s';
UPDATE resources SET visibility = 'hidden' WHERE visibility = 'draft';
UPDATE resource_groups SET visibility = 'hidden' WHERE visibility = 'draft';

ALTER TABLE resources ALTER COLUMN visibility SET DEFAULT 'hidden';
ALTER TABLE resources DROP CONSTRAINT resources_visibility_check;
ALTER TABLE resources ADD CONSTRAINT resources_visibility_check
  CHECK (visibility IN ('seed', 'published', 'hidden')) NOT VALID;
ALTER TABLE resources VALIDATE CONSTRAINT resources_visibility_check;

ALTER TABLE resource_groups ALTER COLUMN visibility SET DEFAULT 'hidden';
ALTER TABLE resource_groups DROP CONSTRAINT resource_groups_visibility_check;
ALTER TABLE resource_groups ADD CONSTRAINT resource_groups_visibility_check
  CHECK (visibility IN ('published', 'hidden')) NOT VALID;
ALTER TABLE resource_groups VALIDATE CONSTRAINT resource_groups_visibility_check;
