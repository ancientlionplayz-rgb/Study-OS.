-- ============================================================================
-- StudyOS Standalone Database Schema Migration
-- Migration 001: Core Architecture, Tables, Constraints & Row Level Security
-- NOTE: This database schema is exclusively for StudyOS.
--       Do NOT apply this to any LMS database (e.g. Astha D Destiny LMS).
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Profiles & Core Preferences
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  grade TEXT NOT NULL DEFAULT 'Class 9 ICSE',
  target_exam_year INTEGER NOT NULL DEFAULT 2027,
  daily_study_target_minutes INTEGER NOT NULL DEFAULT 210,
  maths_mandatory_minutes INTEGER NOT NULL DEFAULT 60,
  earned_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  is_dev_test_mode BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  routine_type TEXT NOT NULL DEFAULT 'morning_heavy', -- morning_heavy, evening_tuition, custom
  wake_time TIME NOT NULL DEFAULT '05:45:00',
  sleep_time TIME NOT NULL DEFAULT '22:30:00',
  school_start TIME NOT NULL DEFAULT '07:30:00',
  school_end TIME NOT NULL DEFAULT '14:30:00',
  commute_minutes INTEGER NOT NULL DEFAULT 30,
  tuition_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  sports_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_study_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_weights JSONB NOT NULL DEFAULT '{"maths": 1.5, "science": 1.2}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. Daily Plans & Study Blocks
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  target_minutes_total INTEGER NOT NULL DEFAULT 210,
  maths_target_minutes INTEGER NOT NULL DEFAULT 60,
  is_weekend_academy_day BOOLEAN NOT NULL DEFAULT FALSE,
  academy_details JSONB,
  day_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.study_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  planned_minutes INTEGER NOT NULL DEFAULT 60,
  completed_minutes INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  type TEXT NOT NULL, -- morning_maths, core_subject, second_subject, recall_error_review
  time_slot_hint TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. Verified Study Sessions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  topic TEXT NOT NULL,
  planned_duration_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'core_subject',
  confidence_before INTEGER CHECK (confidence_before >= 1 AND confidence_before <= 5),
  confidence_after INTEGER CHECK (confidence_after >= 1 AND confidence_after <= 5),
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_maths_session BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. Doubts & Deliberate Error Journal (Mistakes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doubts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter_topic TEXT NOT NULL,
  doubt_description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  status TEXT NOT NULL DEFAULT 'unresolved', -- unresolved, resolving, resolved
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved_date DATE,
  resolution_notes TEXT,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mistakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter_topic TEXT NOT NULL,
  original_question_context TEXT NOT NULL,
  wrong_approach TEXT NOT NULL,
  correct_method TEXT NOT NULL,
  reason TEXT NOT NULL,
  error_category TEXT NOT NULL, -- Calculation Error, Sign Flip, Formula Recall, Misread Question, Conceptual Gap
  is_repeated BOOLEAN NOT NULL DEFAULT FALSE,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. Spaced Revisions (+1, +3, +7 Interval Cadence)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mistake_id UUID NOT NULL REFERENCES public.mistakes(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  interval_day INTEGER NOT NULL, -- 1, 3, 7
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, skipped
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. Personal Growth: Skills, Projects, Sports, Fitness, Reading
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_code TEXT NOT NULL, -- web_dev, python, game_dev, etc.
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_hours_invested NUMERIC(6,2) NOT NULL DEFAULT 0,
  active_project TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skill_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_track_id UUID REFERENCES public.skill_tracks(id) ON DELETE SET NULL,
  track_name TEXT NOT NULL,
  minutes_spent INTEGER NOT NULL,
  tangible_outcome TEXT NOT NULL,
  evidence_url TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  allocated_minutes_per_week INTEGER NOT NULL DEFAULT 120,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.football_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_type TEXT NOT NULL, -- academy, individual_drills, scrimmage
  duration_minutes INTEGER NOT NULL,
  drills_worked JSONB NOT NULL DEFAULT '[]'::jsonb,
  energy_rating INTEGER CHECK (energy_rating >= 1 AND energy_rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_type TEXT NOT NULL, -- pushups, pullups, core, stretching
  sets INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reading_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  book_title TEXT NOT NULL,
  author TEXT,
  pages_read INTEGER NOT NULL CHECK (pages_read >= 0),
  key_insight TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. Rewards Economy & Anti-Cheat Ledger
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reward_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_key TEXT NOT NULL, -- Unique idempotent key: {date}_{action}_{id}
  category TEXT NOT NULL, -- study, maths, error_log, revision, reading, workout
  points INTEGER NOT NULL CHECK (points >= 0),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_key)
);

CREATE TABLE IF NOT EXISTS public.personal_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cost_points INTEGER NOT NULL CHECK (cost_points > 0),
  description TEXT,
  requires_parent_signoff BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES public.personal_rewards(id) ON DELETE SET NULL,
  reward_title TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'completed'
);

-- ----------------------------------------------------------------------------
-- 8. Tutorial & Onboarding State
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tutorial_state (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutorial_started BOOLEAN NOT NULL DEFAULT FALSE,
  tutorial_completed BOOLEAN NOT NULL DEFAULT FALSE,
  current_tutorial_step INTEGER NOT NULL DEFAULT 1,
  dismissed_feature_hints JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_mini_tutorials JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_tour_active BOOLEAN NOT NULL DEFAULT FALSE,
  last_dismissed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. Social, Groups, Teams & Normalized Competition
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  team_name TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  goal_metric TEXT NOT NULL, -- consistency_percentage, revisions_completed, maths_days
  target_value NUMERIC(6,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  week_date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  normalized_completion_pct NUMERIC(5,2) NOT NULL,
  consistency_score NUMERIC(5,2) NOT NULL,
  revisions_completed_count INTEGER NOT NULL,
  capped_weekly_points INTEGER NOT NULL,
  dragon_egg_winner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, week_date, user_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Own row editable; Safe summary viewable by authenticated users
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view public profile fields" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Strict Private Data (auth.uid() = user_id ONLY)
CREATE POLICY "Users own student preferences" ON public.student_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own daily plans" ON public.daily_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own study blocks" ON public.study_blocks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own study sessions" ON public.study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own doubts" ON public.doubts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own mistakes" ON public.mistakes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own revisions" ON public.revisions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own skill tracks" ON public.skill_tracks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own skill sessions" ON public.skill_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own football sessions" ON public.football_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own workout sessions" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own reading logs" ON public.reading_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own reward events" ON public.reward_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own personal rewards" ON public.personal_rewards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own redemptions" ON public.redemptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own tutorial state" ON public.tutorial_state
  FOR ALL USING (auth.uid() = user_id);

-- 3. Groups & Social Policies (Members only)
CREATE POLICY "Group members can view their group" ON public.study_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = study_groups.id
      AND group_members.user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create study groups" ON public.study_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group members can view members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group members can view challenges" ON public.weekly_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = weekly_challenges.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can view leaderboard snapshots" ON public.leaderboard_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = leaderboard_snapshots.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Auto-create profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS 
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'student_' || SUBSTRING(NEW.id::text FROM 1 FOR 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'StudyOS Student'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.tutorial_state (user_id, tutorial_started, is_tour_active, current_tutorial_step)
  VALUES (NEW.id, FALSE, FALSE, 1);

  RETURN NEW;
END;
 LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
