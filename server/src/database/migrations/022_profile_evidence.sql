SET LOCAL lock_timeout = '5s';

ALTER TABLE creative_submissions ADD COLUMN learner_id uuid REFERENCES learners(id);
ALTER TABLE creative_submissions ADD COLUMN study_context_id uuid;
ALTER TABLE creative_submissions ADD CONSTRAINT creative_submission_context
  FOREIGN KEY(learner_id,study_context_id) REFERENCES learner_study_contexts(learner_id,id);
CREATE INDEX creative_submission_learner ON creative_submissions(learner_id,study_context_id);

CREATE TABLE learner_badge_grants (
  learner_id uuid NOT NULL,
  context_id uuid NOT NULL,
  badge_id text NOT NULL,
  rule_version integer NOT NULL,
  rule_snapshot jsonb NOT NULL,
  evidence jsonb NOT NULL,
  earned_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(learner_id,context_id,badge_id,rule_version),
  FOREIGN KEY(learner_id,context_id) REFERENCES learner_study_contexts(learner_id,id)
);

-- Serialize recording against archive/end transitions. Historical rows are untouched.
CREATE FUNCTION assert_recordable_context(actor uuid, context uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE class uuid; closed boolean; enrollment text;
BEGIN
  SELECT class_id INTO class FROM learner_study_contexts WHERE id=context AND learner_id=actor;
  IF class IS NULL THEN RETURN; END IF;
  SELECT archived INTO closed FROM school_classes WHERE id=class FOR SHARE;
  SELECT status INTO enrollment FROM class_enrollments WHERE class_id=class AND learner_id=actor FOR SHARE;
  IF closed OR enrollment IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Class no longer accepts records' USING ERRCODE='23514';
  END IF;
END $$;

CREATE FUNCTION check_species_context() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM assert_recordable_context(NEW.learner_id,NEW.context_id);
  RETURN NEW;
END $$;
CREATE TRIGGER species_recordable BEFORE INSERT ON learner_studied_species
  FOR EACH ROW EXECUTE FUNCTION check_species_context();

CREATE FUNCTION check_game_context() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE actor uuid; context uuid;
BEGIN
  SELECT learner_id,study_context_id INTO actor,context FROM interactive_usage_runs WHERE id=NEW.run_id;
  IF context IS NOT NULL THEN PERFORM assert_recordable_context(actor,context); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER game_recordable BEFORE INSERT ON interactive_usage_interactions
  FOR EACH ROW EXECUTE FUNCTION check_game_context();

CREATE FUNCTION check_creative_context() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.study_context_id IS NOT NULL THEN PERFORM assert_recordable_context(NEW.learner_id,NEW.study_context_id); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER creative_recordable BEFORE INSERT ON creative_submissions
  FOR EACH ROW EXECUTE FUNCTION check_creative_context();
