-- =========================================================================
-- StudyOS Migration 006: Full-Day Routine, Holidays & Notifications Engine
-- Standalone dedicated StudyOS Schema with Row Level Security (RLS)
-- =========================================================================

-- 1. HOLIDAYS TABLE (System, School & User Defined)
CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_name TEXT NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  type TEXT NOT NULL DEFAULT 'school_holiday' CHECK (type IN ('school_holiday', 'national_holiday', 'local_holiday', 'vacation', 'exam_holiday', 'teacher_announced', 'personal_day')),
  school_closed BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'system',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays(date);
CREATE INDEX IF NOT EXISTS idx_holidays_user_id ON public.holidays(user_id);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Allow reading all system holidays and user's own holidays
CREATE POLICY "Users can view system and own holidays"
  ON public.holidays FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own holidays"
  ON public.holidays FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. STUDENT ROUTINE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.student_routine_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wake_time TEXT NOT NULL DEFAULT '05:45',
  sleep_time TEXT NOT NULL DEFAULT '22:00',
  difficulty_waking BOOLEAN NOT NULL DEFAULT FALSE,
  school_days JSONB NOT NULL DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
  school_start_time TEXT NOT NULL DEFAULT '07:30',
  school_end_time TEXT NOT NULL DEFAULT '14:15',
  commute_minutes INTEGER NOT NULL DEFAULT 30,
  breakfast_time TEXT NOT NULL DEFAULT '07:00',
  lunch_time TEXT NOT NULL DEFAULT '14:30',
  dinner_time TEXT NOT NULL DEFAULT '20:00',
  tuition_commitments JSONB NOT NULL DEFAULT '[]'::jsonb,
  sports_and_academy JSONB NOT NULL DEFAULT '[]'::jsonb,
  workout_preference TEXT NOT NULL DEFAULT 'evening',
  workout_duration_minutes INTEGER NOT NULL DEFAULT 30,
  daily_reading_goal_minutes INTEGER NOT NULL DEFAULT 20,
  skill_tracks JSONB NOT NULL DEFAULT '["AI & Machine Learning"]'::jsonb,
  personal_projects JSONB NOT NULL DEFAULT '["StudyOS Companion"]'::jsonb,
  weekend_differences JSONB NOT NULL DEFAULT '{"saturdayWakeTime": "06:30", "saturdaySleepTime": "22:30", "sundayWakeTime": "07:00", "sundaySleepTime": "22:00"}'::jsonb,
  subjects JSONB NOT NULL DEFAULT '{"strong": ["Mathematics"], "weak": ["Physics", "Chemistry"], "targetDailyStudyMinutes": 210}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.student_routine_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit own routine profile"
  ON public.student_routine_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. FULL-DAY ROUTINE BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.full_day_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
  holiday_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_full_day_routines_user_date ON public.full_day_routines(user_id, date);

ALTER TABLE public.full_day_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own daily routines"
  ON public.full_day_routines FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. TOMORROW BRIEFS TABLE
CREATE TABLE IF NOT EXISTS public.tomorrow_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
  holiday_name TEXT,
  wake_time TEXT NOT NULL,
  sleep_target_time TEXT NOT NULL,
  school_hours TEXT,
  key_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  revisions_due JSONB NOT NULL DEFAULT '[]'::jsonb,
  exams_tomorrow JSONB NOT NULL DEFAULT '[]'::jsonb,
  viewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_tomorrow_briefs_user_date ON public.tomorrow_briefs(user_id, date);

ALTER TABLE public.tomorrow_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tomorrow briefs"
  ON public.tomorrow_briefs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. NOTIFICATION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tomorrow_schedule_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  tomorrow_schedule_time TEXT NOT NULL DEFAULT '20:45',
  revision_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  task_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  exam_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  team_invitations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  challenge_updates_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit own notification settings"
  ON public.notification_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. IN-APP NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('team_invite', 'friend_request', 'challenge', 'schedule', 'revision', 'system')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_in_app_notifs_user_created ON public.in_app_notifications(user_id, created_at DESC);

ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage own in-app notifications"
  ON public.in_app_notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
