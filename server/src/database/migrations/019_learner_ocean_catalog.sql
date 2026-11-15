SET LOCAL lock_timeout = '5s';

CREATE TABLE learner_catalog_versions (
  version text PRIMARY KEY,
  checksum text NOT NULL,
  zones jsonb NOT NULL
);
CREATE TABLE learner_catalog_active (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  version text NOT NULL REFERENCES learner_catalog_versions(version)
);
CREATE TABLE learner_catalog_items (
  version text NOT NULL REFERENCES learner_catalog_versions(version),
  id text NOT NULL,
  kind text NOT NULL,
  zone text NOT NULL DEFAULT '',
  group_name text NOT NULL,
  search_name text NOT NULL,
  position integer NOT NULL,
  body jsonb NOT NULL,
  PRIMARY KEY (version,id),
  UNIQUE (version,position)
);
CREATE INDEX learner_catalog_zone_page ON learner_catalog_items(version, zone, kind, group_name, position);
CREATE INDEX learner_catalog_kind_page ON learner_catalog_items(version, kind, position);

CREATE TABLE learner_study_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  school text NOT NULL,
  school_year text NOT NULL,
  class_name text NOT NULL,
  UNIQUE (learner_id,id),
  UNIQUE (learner_id,school,school_year,class_name)
);
CREATE TABLE learner_personal_information (
  learner_id uuid PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,
  context_id uuid NOT NULL,
  FOREIGN KEY (learner_id,context_id) REFERENCES learner_study_contexts(learner_id,id)
);
CREATE TABLE learner_studied_species (
  learner_id uuid NOT NULL,
  context_id uuid NOT NULL,
  organism_id text NOT NULL,
  studied_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id,context_id,organism_id),
  FOREIGN KEY (learner_id,context_id) REFERENCES learner_study_contexts(learner_id,id) ON DELETE CASCADE
);
CREATE INDEX learner_studied_recent ON learner_studied_species(learner_id,context_id,studied_at DESC);
ALTER TABLE interactive_usage_runs ADD COLUMN learner_id uuid;
ALTER TABLE interactive_usage_runs ADD COLUMN study_context_id uuid;
ALTER TABLE interactive_usage_runs ADD CONSTRAINT interactive_usage_study_context
  FOREIGN KEY (learner_id,study_context_id) REFERENCES learner_study_contexts(learner_id,id) ON DELETE SET NULL;
CREATE INDEX interactive_usage_study_games ON interactive_usage_runs(learner_id,study_context_id,opened_at DESC)
  WHERE kind='game';
