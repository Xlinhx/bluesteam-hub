CREATE TABLE learner_model_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES auth_sessions(id) ON DELETE CASCADE,
  model_id text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('vr','inspector')),
  started_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE learner_model_awards (
  learner_id uuid NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  model_id text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('vr','inspector')),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id,model_id,mode)
);
