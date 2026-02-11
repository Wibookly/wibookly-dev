-- Add unique constraint on user_profiles.email to prevent duplicates
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Add unique constraint on user_profiles.user_id to prevent duplicate user entries
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);