SET LOCAL lock_timeout = '5s';

CREATE TABLE learner_resource_views (
  learner_id uuid NOT NULL,
  context_id uuid NOT NULL,
  resource_kind text NOT NULL CHECK (resource_kind IN ('source', 'published')),
  resource_id text NOT NULL,
  title text NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id, context_id, resource_kind, resource_id),
  FOREIGN KEY (learner_id, context_id)
    REFERENCES learner_study_contexts (learner_id, id) ON DELETE CASCADE
);
