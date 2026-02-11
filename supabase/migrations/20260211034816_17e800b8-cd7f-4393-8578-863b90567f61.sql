
-- Add is_suspended column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;

-- Add suspended_reason for optional messaging
ALTER TABLE public.user_profiles
ADD COLUMN suspended_reason text;
