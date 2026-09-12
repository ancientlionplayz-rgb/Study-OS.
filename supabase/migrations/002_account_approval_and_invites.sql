-- ============================================================================
-- StudyOS Standalone Database Schema Migration (Part 2)
-- Migration: 002_account_approval_and_invites.sql
-- Purpose: Adds account approval states, user roles, invite codes,
--          friendship relations, safe social summaries, and anti-LMS safeguards.
-- NOTE: Never execute this against Astha D Destiny LMS or any production LMS!
-- ============================================================================

-- STRICT SAFETY ASSERTION:
-- Verifies that this migration will NEVER run on an external LMS project.
DO 
BEGIN
  IF current_database() ~* 'destiny|astha|lms' THEN
    RAISE EXCEPTION 'CRITICAL SAFETY ABORT: Attempted execution on external LMS database (%s). StudyOS must remain isolated!', current_database();
  END IF;
END ;

-- 1. Extend profiles with roles, approval states, and invite tracking
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected', 'blocked')),
  ADD COLUMN IF NOT EXISTS invite_code_used TEXT,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 2. Create Invite Codes Table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 5,
  times_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial Default Invite Codes if not present
INSERT INTO public.invite_codes (code, max_uses, times_used, status)
VALUES 
  ('ICSE2027', 50, 1, 'active'),
  ('STUDYOS-FRIENDS', 25, 0, 'active')
ON CONFLICT (code) DO NOTHING;

-- 3. Friendships Table (Bidirectional Peer Management)
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_friendship_pair UNIQUE(user_id, friend_id),
  CONSTRAINT no_self_friending CHECK (user_id != friend_id)
);

-- 4. Safe Public / Friend Profile Summary View
-- CRITICAL PRIVACY ARCHITECTURE:
-- Omits all private notes, doubts, mistakes, schedule details, and emails.
CREATE OR REPLACE VIEW public.profile_summaries AS
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.grade,
  p.earned_points,
  p.current_streak,
  p.account_status,
  p.created_at
FROM public.profiles p
WHERE p.account_status = 'approved';

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 6. Policies for Invite Codes
-- Public read of valid codes for validation during registration
CREATE POLICY Anyone can validate active invite codes ON public.invite_codes
  FOR SELECT USING (status = 'active');

-- Admins can manage invite codes
CREATE POLICY Admins manage invite codes ON public.invite_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 7. Policies for Friendships
CREATE POLICY Users view their own friendships ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY Users can send friend requests ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY Users can update their friendship status ON public.friendships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY Users can remove friendships ON public.friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 8. Admin Policies for Profiles
CREATE POLICY Admins can view and update all profiles ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
