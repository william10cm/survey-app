-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Surveys
CREATE TABLE IF NOT EXISTS surveys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  description  TEXT DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id   UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  type        VARCHAR(50) NOT NULL CHECK (type IN ('text', 'multiple_choice', 'rating', 'yes_no')),
  options     JSONB,
  required    BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Responses (one per survey submission)
CREATE TABLE IF NOT EXISTS responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id    UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Answers (one per question per response)
CREATE TABLE IF NOT EXISTS answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value       JSONB NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_questions_survey_id   ON questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_questions_order       ON questions(survey_id, order_index);
CREATE INDEX IF NOT EXISTS idx_responses_survey_id   ON responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_answers_response_id   ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id   ON answers(question_id);