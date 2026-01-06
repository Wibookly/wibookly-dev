-- Add profile photo and toggles to email_profiles table
ALTER TABLE public.email_profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url text,
ADD COLUMN IF NOT EXISTS show_profile_photo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_company_logo boolean DEFAULT true;