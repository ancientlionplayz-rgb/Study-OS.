-- ==============================================================================
-- STUDYOS DATABASE MIGRATION 005
-- Global Themes, Custom Skills, Annual Tracker, Feature Voting, and Storage Bucket
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

-- 2. Custom User-Created Skills
CREATE TABLE IF NOT EXISTS public.custom_skills (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_level TEXT NOT NULL DEFAULT 'Beginner',
  target_level TEXT NOT NULL DEFAULT 'Intermediate',
  why_learn TEXT,
  learning_goal TEXT NOT NULL,
  estimated_hours_per_week NUMERIC NOT NULL DEFAULT 3,
  preferred_days TEXT[] DEFAULT ARRAY['Monday', 'Wednesday', 'Saturday'],
  resource_links TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom Skill Practice Sessions
CREATE TABLE IF NOT EXISTS public.custom_skill_sessions (
  id TEXT PRIMARY KEY,
  skill_id TEXT REFERENCES public.custom_skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  topic TEXT NOT NULL,
  what_practiced TEXT NOT NULL,
  what_built TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Moderate',
  confidence_before INTEGER NOT NULL DEFAULT 3,
  confidence_after INTEGER NOT NULL DEFAULT 4,
  proof_of_work TEXT NOT NULL,
  deliverable_url TEXT,
  notes TEXT,
  next_step TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Community Feature Requests & Roadmaps
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id TEXT PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_username TEXT NOT NULL,
  author_display_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_solved TEXT NOT NULL,
  why_helpful TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Study',
  screenshot_url TEXT,
  votes_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Submitted',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature Upvotes (1 vote per registered user per feature)
CREATE TABLE IF NOT EXISTS public.feature_votes (
  id TEXT PRIMARY KEY,
  feature_id TEXT REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature_id, user_id)
);

-- 4. User Preferences (Theme Template & Reduced Motion)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_template TEXT NOT NULL DEFAULT 'focus-light',
  reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  daily_study_target_minutes INTEGER NOT NULL DEFAULT 210,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.custom_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_skill_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Custom Skills Policies (Strict isolation to owner)
CREATE POLICY "Users can manage their own custom skills"
  ON public.custom_skills
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skill sessions"
  ON public.custom_skill_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Feature Requests Policies (Public read for all registered users, owner insert/update)
CREATE POLICY "Registered users can read all feature requests"
  ON public.feature_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can submit their own feature requests"
  ON public.feature_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Feature Votes Policies (Users can read all votes, toggle only their own)
CREATE POLICY "Users can read all feature votes"
  ON public.feature_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own feature vote"
  ON public.feature_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own feature vote"
  ON public.feature_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Preferences Policies
CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Storage Bucket for Team Logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy for team-logos: public read, authenticated upload
CREATE POLICY "Anyone can view team logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-logos');

CREATE POLICY "Authenticated users can upload team logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'team-logos');
