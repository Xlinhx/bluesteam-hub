SET LOCAL lock_timeout = '5s';

ALTER TABLE learner_study_contexts ADD COLUMN personal boolean NOT NULL DEFAULT false;
ALTER TABLE learner_study_contexts ADD CONSTRAINT learner_personal_context_shape
  CHECK (NOT personal OR (class_id IS NULL AND school = '' AND school_year = '' AND class_name = ''));
CREATE UNIQUE INDEX learner_context_personal ON learner_study_contexts (learner_id) WHERE personal;

CREATE FUNCTION learner_recording_context(actor uuid) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE selected uuid; result uuid;
BEGIN
  IF actor IS NULL THEN RETURN NULL; END IF;
  SELECT p.context_id INTO selected FROM learner_personal_information p
    WHERE p.learner_id = actor FOR SHARE;
  IF selected IS NOT NULL THEN
    SELECT x.id INTO result FROM learner_study_contexts x
      LEFT JOIN school_classes c ON c.id = x.class_id
      WHERE x.id = selected AND (x.class_id IS NULL OR (NOT c.archived AND EXISTS (
        SELECT 1 FROM class_enrollments e WHERE e.context_id = x.id AND e.learner_id = actor AND e.status = 'active'
      )));
    RETURN result;
  END IF;
  SELECT id INTO result FROM learner_study_contexts WHERE learner_id = actor AND personal;
  IF result IS NULL THEN
    INSERT INTO learner_study_contexts (learner_id, school, school_year, class_name, personal)
      VALUES (actor, '', '', '', true) ON CONFLICT DO NOTHING RETURNING id INTO result;
    IF result IS NULL THEN
      SELECT id INTO result FROM learner_study_contexts WHERE learner_id = actor AND personal;
    END IF;
  END IF;
  RETURN result;
END $$;
