SET LOCAL lock_timeout = '5s';

ALTER TABLE teachers ADD COLUMN birth_date date;

CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 150),
  owner_id uuid NOT NULL REFERENCES teachers(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX schools_owner ON schools(owner_id);
CREATE TABLE school_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id),
  name text NOT NULL,
  UNIQUE(school_id,name),
  UNIQUE(school_id,id)
);
CREATE TABLE school_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  year_id uuid NOT NULL,
  name text NOT NULL,
  age_group text NOT NULL DEFAULT '',
  archived boolean NOT NULL DEFAULT false,
  invite_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8),'hex'),
  invite_expires_at timestamptz NOT NULL DEFAULT now() + interval '14 days',
  FOREIGN KEY(school_id,year_id) REFERENCES school_years(school_id,id),
  UNIQUE(year_id,name)
);
CREATE INDEX school_classes_school ON school_classes(school_id);
CREATE TABLE class_teachers (
  class_id uuid NOT NULL REFERENCES school_classes(id),
  teacher_id uuid NOT NULL REFERENCES teachers(id),
  role text NOT NULL CHECK (role IN ('lead','assistant')),
  PRIMARY KEY(class_id,teacher_id)
);
CREATE INDEX class_teachers_teacher ON class_teachers(teacher_id,class_id);
ALTER TABLE learner_study_contexts ADD COLUMN class_id uuid REFERENCES school_classes(id);
ALTER TABLE learner_study_contexts DROP CONSTRAINT learner_study_contexts_learner_id_school_school_year_class__key;
CREATE UNIQUE INDEX learner_context_legacy_name ON learner_study_contexts(learner_id,school,school_year,class_name) WHERE class_id IS NULL;
CREATE UNIQUE INDEX learner_context_managed_class ON learner_study_contexts(learner_id,class_id) WHERE class_id IS NOT NULL;
CREATE TABLE class_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES school_classes(id),
  learner_id uuid NOT NULL REFERENCES learners(id),
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','ended','rejected')),
  context_id uuid,
  requested_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz,
  ended_at timestamptz,
  FOREIGN KEY(learner_id,context_id) REFERENCES learner_study_contexts(learner_id,id),
  UNIQUE(class_id,learner_id)
);
CREATE INDEX class_enrollments_learner ON class_enrollments(learner_id,status);
