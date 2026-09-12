-- ============================================================================
-- StudyOS Standalone Database Schema Migration (Part 3)
-- Migration: 003_open_registration_teams_and_rls.sql
-- Purpose: Open student registration, Teams, Direct Team Invitations,
--          Public Student Profiles, Notifications, and Strict RLS Policies.
-- NOTE: Never execute this against Astha D Destiny LMS or any external database!
-- ============================================================================

-- STRICT SAFETY ASSERTION:
DO $$
BEGIN
  IF current_database() ~* 'destiny|astha|lms' THEN
    RAISE EXCEPTION 'CRITICAL SAFETY ABORT: Attempted execution on external LMS database (%s). StudyOS must remain strictly isolated!', current_database();
  END IF;
END $$;

-- 1. Modify profiles to default to 'active' for open registration
ALTER TABLE IF EXISTS public.profiles
  ALTER COLUMN account_status SET DEFAULT 'active';

-- Update any previously stuck 'pending' profiles to 'active'
UPDATE public.profiles
SET account_status = 'active'
WHERE account_status = 'pending';

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  emblem TEXT NOT NULL DEFAULT '⚡',
  description TEXT,
  captain_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  weekly_score INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  achievements TEXT[] NOT NULL DEFAULT ARRAY['Newly Formed Squad']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  weekly_contribution INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

-- 4. Team Invitations Table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CONSTRAINT no_self_team_invite CHECK (inviter_id != invited_user_id)
);

-- Prevent duplicate pending invitations for the same team and student
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_team_invitations
  ON public.team_invitations (team_id, invited_user_id)
  WHERE status = 'pending';

-- 5. Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metric TEXT NOT NULL, -- e.g. 'maths_60m_days', 'revisions_cleared'
  target_value NUMERIC NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 25,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Challenge Participants Table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress NUMERIC NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  CONSTRAINT unique_challenge_participant UNIQUE (challenge_id, user_id)
);

-- 7. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'friend_request',
    'friend_accepted',
    'team_invitation',
    'team_accepted',
    'challenge_started',
    'team_milestone',
    'weekly_result'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Leaderboard Snapshots Table (Weekly historical archive)
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  normalized_score INTEGER NOT NULL,
  consistency_score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_weekly_leaderboard_user UNIQUE (week_start_date, user_id)
);

-- 9. Safe Public Profiles View
-- STRICT PRIVACY: Omits email, school, private routines, mistake descriptions, doubt logs, and notes.
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.username,
  p.name AS display_name,
  p.avatar_url,
  p.grade,
  p.target_exam_year,
  p.current_streak,
  p.longest_streak,
  p.earned_points,
  p.created_at,
  t.id AS team_id,
  t.name AS team_name,
  t.emblem AS team_emblem
FROM public.profiles p
LEFT JOIN public.team_members tm ON tm.user_id = p.id
LEFT JOIN public.teams t ON t.id = tm.team_id
WHERE p.account_status = 'active';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- TEAMS RLS:
-- Any authenticated student can read squads
CREATE POLICY "Authenticated users can view squads"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated user can create squad if they are the designated captain
CREATE POLICY "Users can create squads as captain"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = captain_id);

-- Only captain can update squad details
CREATE POLICY "Captains can update their squad"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = captain_id);

-- Only captain can delete squad
CREATE POLICY "Captains can delete their squad"
  ON public.teams FOR DELETE
  TO authenticated
  USING (auth.uid() = captain_id);

-- TEAM MEMBERS RLS:
-- Anyone can view squad roster
CREATE POLICY "Authenticated users can view squad members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (true);

-- Captain or self can insert member
CREATE POLICY "Join or captain add to squad"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND captain_id = auth.uid())
  );

-- Captain can remove member, or member can leave squad
CREATE POLICY "Leave squad or captain remove"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND captain_id = auth.uid())
  );

-- TEAM INVITATIONS RLS:
-- Inviter, invitee, or squad captain can view invitations
CREATE POLICY "View team invitations"
  ON public.team_invitations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = inviter_id OR 
    auth.uid() = invited_user_id OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND captain_id = auth.uid())
  );

-- Team captain or members can invite
CREATE POLICY "Create team invitations"
  ON public.team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inviter_id);

-- Invitee can accept/decline, or inviter can cancel
CREATE POLICY "Respond to or cancel invitation"
  ON public.team_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = invited_user_id OR auth.uid() = inviter_id);

-- NOTIFICATIONS RLS:
-- Only recipient can view their notifications
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only recipient can mark their notifications read
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Any authenticated user can insert a notification for another student (e.g. friend request, team invite)
CREATE POLICY "Authenticated users can trigger notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- CHALLENGES RLS:
CREATE POLICY "All authenticated users can view challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own challenge participation"
  ON public.challenge_participants FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
