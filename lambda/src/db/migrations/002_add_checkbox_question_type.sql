ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_type_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_type_check
  CHECK (type IN ('text', 'multiple_choice', 'checkbox', 'rating', 'yes_no'));
