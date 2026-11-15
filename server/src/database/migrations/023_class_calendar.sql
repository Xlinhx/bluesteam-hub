SET LOCAL lock_timeout = '5s';
ALTER TABLE school_classes ADD COLUMN start_date date;
ALTER TABLE school_classes ADD COLUMN end_date date;
ALTER TABLE school_classes ADD CONSTRAINT school_class_calendar_order
  CHECK(start_date IS NULL OR end_date IS NULL OR start_date<=end_date);
