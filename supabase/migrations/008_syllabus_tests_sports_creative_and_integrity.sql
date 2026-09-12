-- ==============================================================================
-- STUDYOS DATABASE MIGRATION 008
-- Complete Academic Syllabus Engine, Per-Student Topic Tracker,
-- Test Paper Generator, Fair Test Integrity System,
-- Sports & Athletics Engine, Creative Arts Module, and Theme Engine
--
-- LMS SAFETY BARRIER:
-- Never connects to or modifies Astha D Destiny LMS tables.
-- ==============================================================================

-- 1. Ensure LMS Safety Assertions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name IN ('courses', 'batches', 'lms_enrollments')) THEN
    RAISE EXCEPTION 'SAFETY VIOLATION: LMS tables detected. Refusing to run StudyOS migrations against LMS database.';
  END IF;
END $$;

-- 2. ACADEMIC SYLLABUS HIERARCHY TABLES

CREATE TABLE IF NOT EXISTS public.boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL DEFAULT 'India',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.academic_years (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.grades (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  numeric_level INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_id, numeric_level)
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  grade_id TEXT NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'core' CHECK (category IN ('core', 'science', 'humanities', 'language', 'technical', 'elective')),
  color TEXT NOT NULL DEFAULT '#3B82F6',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_id, grade_id, code)
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id);

CREATE TABLE IF NOT EXISTS public.topics (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_chapter_id ON public.topics(chapter_id);

CREATE TABLE IF NOT EXISTS public.subtopics (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtopics_topic_id ON public.subtopics(topic_id);

-- 3. PER-STUDENT TOPIC PROGRESS (DECOUPLED FROM COVERAGE)

CREATE TABLE IF NOT EXISTS public.student_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'Learning', 'Practicing', 'Revision Due', 'Strong', 'Completed')),
  confidence INTEGER NOT NULL DEFAULT 1 CHECK (confidence >= 1 AND confidence <= 5),
  first_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_revised_at TIMESTAMPTZ,
  revision_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON public.student_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_status ON public.student_topic_progress(user_id, status);

-- 4. TEST PAPER GENERATOR TABLES

CREATE TABLE IF NOT EXISTS public.generated_tests (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  title TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_marks INTEGER NOT NULL DEFAULT 40,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  mode TEXT NOT NULL DEFAULT 'chapter' CHECK (mode IN ('chapter', 'topic', 'subject', 'revision', 'mock', 'adaptive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tests_user_id ON public.generated_tests(user_id);

CREATE TABLE IF NOT EXISTS public.test_questions (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL REFERENCES public.generated_tests(id) ON DELETE CASCADE,
  topic_id TEXT,
  topic_title TEXT,
  question TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MCQ', 'Short Answer', 'Long Answer', 'Numerical', 'Reasoning', 'Diagram-based', 'True/False', 'Programming')),
  marks INTEGER NOT NULL DEFAULT 1,
  options JSONB,
  answer_key TEXT NOT NULL,
  explanation TEXT NOT NULL,
  marking_logic TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON public.test_questions(test_id);

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL REFERENCES public.generated_tests(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_marks INTEGER NOT NULL DEFAULT 40,
  accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  integrity_status TEXT NOT NULL DEFAULT 'clear' CHECK (integrity_status IN ('clear', 'warning', 'review_required', 'resolved')),
  integrity_flags_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON public.test_attempts(user_id);

CREATE TABLE IF NOT EXISTS public.test_answers (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
  student_answer TEXT NOT NULL,
  marks_awarded NUMERIC(5,2) NOT NULL DEFAULT 0,
  feedback TEXT,
  mistake_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_answers_attempt_id ON public.test_answers(attempt_id);

-- 5. FAIR TEST INTEGRITY SYSTEM (CONFIDENTIAL - NEVER SHAMED)

CREATE TABLE IF NOT EXISTS public.integrity_events (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('tab_switch', 'window_blur', 'unusual_navigation', 'copy_paste', 'interruption')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical'))
);

CREATE INDEX IF NOT EXISTS idx_integrity_events_attempt ON public.integrity_events(attempt_id);
CREATE INDEX IF NOT EXISTS idx_integrity_events_user ON public.integrity_events(user_id);

CREATE TABLE IF NOT EXISTS public.integrity_reviews (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Clear' CHECK (status IN ('Clear', 'Warning', 'Review Required', 'Resolved')),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  student_explanation TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrity_reviews_attempt ON public.integrity_reviews(attempt_id);

-- 6. SPORTS & ATHLETICS ENGINE TABLES

CREATE TABLE IF NOT EXISTS public.sports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('team', 'racquet', 'individual', 'combat', 'fitness', 'other')),
  icon TEXT NOT NULL DEFAULT 'Trophy',
  is_builtin BOOLEAN NOT NULL DEFAULT TRUE,
  default_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_sports (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_id TEXT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_position TEXT,
  level TEXT NOT NULL DEFAULT 'School Team' CHECK (level IN ('Recreational', 'School Team', 'Academy', 'District / State', 'National')),
  academy_club TEXT,
  goals TEXT,
  training_days JSONB NOT NULL DEFAULT '["Saturday", "Sunday"]'::jsonb,
  training_time TEXT NOT NULL DEFAULT '16:00',
  competitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills_tracked JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sports_user_id ON public.user_sports(user_id);

CREATE TABLE IF NOT EXISTS public.sport_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_id TEXT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  sport_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TEXT NOT NULL DEFAULT '16:00',
  end_time TEXT NOT NULL DEFAULT '18:00',
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  training_type TEXT NOT NULL DEFAULT 'academy_training' CHECK (training_type IN ('academy_training', 'solo_drills', 'match', 'recovery', 'conditioning')),
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  intensity TEXT NOT NULL DEFAULT 'Moderate' CHECK (intensity IN ('Light', 'Moderate', 'Intense', 'Maximum')),
  performance_rating INTEGER NOT NULL DEFAULT 4 CHECK (performance_rating >= 1 AND performance_rating <= 5),
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  improvement TEXT,
  next_target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sport_sessions_user_id ON public.sport_sessions(user_id);

-- 7. CREATIVE & PERFORMING ARTS MODULE TABLES

CREATE TABLE IF NOT EXISTS public.creative_skills (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Drawing', 'Painting', 'Digital Art', 'Photography', 'Design', 'Dance', 'Singing', 'Instrument', 'Music Production', 'Acting', 'Theatre', 'Writing', 'Public Speaking', 'Other')),
  skill_name TEXT NOT NULL,
  current_level TEXT NOT NULL DEFAULT 'Beginner',
  goal TEXT NOT NULL,
  weekly_target_minutes INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_skills_user ON public.creative_skills(user_id);

CREATE TABLE IF NOT EXISTS public.creative_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creative_skill_id TEXT NOT NULL REFERENCES public.creative_skills(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  piece_or_project TEXT NOT NULL,
  technique_practiced TEXT NOT NULL,
  rhythm_or_tempo TEXT,
  theory_notes TEXT,
  completed_output_url TEXT,
  notes TEXT,
  next_target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_sessions_user ON public.creative_sessions(user_id);

-- 8. CUSTOM THEMES & PREFERENCES

CREATE TABLE IF NOT EXISTS public.custom_themes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL,
  typography TEXT NOT NULL DEFAULT 'Inter',
  radius TEXT NOT NULL DEFAULT '1rem',
  density TEXT NOT NULL DEFAULT 'comfortable',
  card_style TEXT NOT NULL DEFAULT 'elevated',
  nav_style TEXT NOT NULL DEFAULT 'sidebar',
  progress_style TEXT NOT NULL DEFAULT 'bar',
  motion_level TEXT NOT NULL DEFAULT 'balanced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_themes_user ON public.custom_themes(user_id);

-- 9. ROW LEVEL SECURITY (RLS) CONFIGURATION

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_topic_progress ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.generated_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.creative_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_themes ENABLE ROW LEVEL SECURITY;

-- Public Academic Structure Read Access (All Authenticated & Anon can read verified syllabus)
CREATE POLICY "Public read boards" ON public.boards FOR SELECT USING (true);
CREATE POLICY "Public read academic years" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "Public read grades" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public read chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public read subtopics" ON public.subtopics FOR SELECT USING (true);
CREATE POLICY "Public read sports catalogue" ON public.sports FOR SELECT USING (true);

-- User-Private Academic Progress Policies
CREATE POLICY "Users manage own topic progress"
  ON public.student_topic_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User-Private Test Policies
CREATE POLICY "Users manage own generated tests"
  ON public.generated_tests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view questions for own tests"
  ON public.test_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.generated_tests WHERE id = test_questions.test_id AND user_id = auth.uid()));

CREATE POLICY "Users manage own test attempts"
  ON public.test_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own test answers"
  ON public.test_answers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.test_attempts WHERE id = test_answers.attempt_id AND user_id = auth.uid()));

-- Strict Integrity Privacy Policies (CONFIDENTIAL: Student and Authorized Reviewers Only)
CREATE POLICY "Users view own integrity events"
  ON public.integrity_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own integrity events during test"
  ON public.integrity_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own integrity reviews and submit appeals"
  ON public.integrity_reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM public.test_attempts WHERE id = integrity_reviews.attempt_id AND user_id = auth.uid()));

-- User-Private Sports Policies
CREATE POLICY "Users manage own user_sports"
  ON public.user_sports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own sport sessions"
  ON public.sport_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User-Private Creative Policies
CREATE POLICY "Users manage own creative skills"
  ON public.creative_skills FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own creative sessions"
  ON public.creative_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User-Private Custom Themes
CREATE POLICY "Users manage own custom themes"
  ON public.custom_themes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
