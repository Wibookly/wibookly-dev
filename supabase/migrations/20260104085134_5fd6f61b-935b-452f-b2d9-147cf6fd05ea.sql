-- Create audited endpoint to fetch the current user's profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  organization_id uuid,
  email text,
  full_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    up.id,
    up.user_id,
    up.organization_id,
    up.email,
    up.full_name,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid()
  LIMIT 1;
$$;

-- Prevent direct SELECT access to user_profiles from the client API.
-- Profile reads should go through get_my_profile().
DROP POLICY IF EXISTS users_read_own_profile_only ON public.user_profiles;
CREATE POLICY no_direct_profile_select
ON public.user_profiles
FOR SELECT
USING (false);
