SET LOCAL lock_timeout = '5s';

CREATE SEQUENCE learner_student_number;
ALTER TABLE learners
  ADD COLUMN student_number bigint NOT NULL DEFAULT nextval('learner_student_number'),
  ADD COLUMN avatar_key text NOT NULL DEFAULT ((ARRAY[
    'turtle','crab','clownfish','starfish','dolphin','octopus','seahorse','jellyfish',
    'shark','whale','seal','otter','stingray','pufferfish','shrimp','squid','duck','penguin','frog','crocodile'
  ])[1+floor(random()*20)::int]);
ALTER SEQUENCE learner_student_number OWNED BY learners.student_number;
ALTER TABLE learners ADD CONSTRAINT learners_student_number_unique UNIQUE(student_number);

CREATE FUNCTION classroom_invite_code() RETURNS text LANGUAGE sql VOLATILE AS $$
  SELECT left(code,4)||'-'||right(code,4)
  FROM (
    SELECT string_agg(substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ',1+(get_byte(bytes,i)&31),1),'' ORDER BY i) AS code
    FROM (SELECT gen_random_bytes(8) AS bytes) random_bytes CROSS JOIN generate_series(0,7) AS offsets(i)
  ) generated
$$;

ALTER TABLE school_classes
  ADD COLUMN legacy_invite_code text UNIQUE,
  ALTER COLUMN invite_code SET DEFAULT classroom_invite_code();
UPDATE school_classes
SET legacy_invite_code = invite_code, invite_code = classroom_invite_code();

ALTER TABLE class_enrollments
  ADD COLUMN transfer_to_class_id uuid REFERENCES school_classes(id);
