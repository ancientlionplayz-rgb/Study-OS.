-- =========================================================================
-- StudyOS Migration 007: Recurring Commitments & Custom Student Cadence
-- Supports custom per-student school, tuition, sports, academies and clubs
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.recurring_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('school', 'tuition', 'sports', 'academy', 'club', 'custom')),
  title TEXT NOT NULL,
  subject TEXT,
  sport_type TEXT,
  recurrence_type TEXT NOT NULL DEFAULT 'weekly' CHECK (recurrence_type IN ('weekly', 'specific_date', 'date_range', 'one_time')),
  days_of_week JSONB NOT NULL DEFAULT '[]'::jsonb,
  specific_date DATE,
  start_date DATE,
  end_date DATE,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  commute_before_minutes INTEGER NOT NULL DEFAULT 0,
  commute_after_minutes INTEGER NOT NULL DEFAULT 0,
  location_label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commitments_user_id ON public.recurring_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_commitments_type ON public.recurring_commitments(type);

ALTER TABLE public.recurring_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring commitments"
  ON public.recurring_commitments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
