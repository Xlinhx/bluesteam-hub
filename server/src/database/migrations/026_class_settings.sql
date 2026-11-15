SET LOCAL lock_timeout = '5s';

ALTER TABLE school_classes
  ADD COLUMN class_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  ADD COLUMN requires_approval boolean NOT NULL DEFAULT true;
