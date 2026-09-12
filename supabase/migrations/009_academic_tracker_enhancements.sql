-- Migration 009: Academic Tracker Enhancements

-- Add new columns to student_topic_progress
ALTER TABLE student_topic_progress ADD COLUMN coverage_percent INTEGER DEFAULT 0;
ALTER TABLE student_topic_progress ADD COLUMN questions_attempted INTEGER DEFAULT 0;
ALTER TABLE student_topic_progress ADD COLUMN questions_correct INTEGER DEFAULT 0;
ALTER TABLE student_topic_progress ADD COLUMN mistakes_count INTEGER DEFAULT 0;
ALTER TABLE student_topic_progress ADD COLUMN revisions_completed INTEGER DEFAULT 0;
ALTER TABLE student_topic_progress ADD COLUMN last_studied_at TIMESTAMPTZ;

-- Add new columns to chapters
ALTER TABLE chapters ADD COLUMN chapter_number INTEGER;
ALTER TABLE chapters ADD COLUMN weight INTEGER DEFAULT 1;

-- Add new columns to topics
ALTER TABLE topics ADD COLUMN weight INTEGER DEFAULT 1;
ALTER TABLE topics ADD COLUMN difficulty INTEGER DEFAULT 1;

-- Add new column to subtopics
ALTER TABLE subtopics ADD COLUMN description TEXT;

-- Create new tables
CREATE TABLE student_academic_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    board_id UUID NOT NULL,
    grade_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE student_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    target_grade UUID,
    current_confidence INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE progress_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR NOT NULL,
    coverage_threshold INTEGER NOT NULL,
    confidence_threshold INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    topic_id UUID NOT NULL,
    due_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for new tables (example, using auth.uid())
ALTER TABLE student_academic_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY  user_profile_access ON student_academic_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_profile_insert ON student_academic_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_profile_update ON student_academic_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE student_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_subjects_access ON student_subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_subjects_insert ON student_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_subjects_update ON student_subjects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE progress_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_thresholds ON progress_thresholds FOR SELECT USING (true);

ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_revisions_access ON revisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_revisions_insert ON revisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_revisions_update ON revisions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- End of migration
