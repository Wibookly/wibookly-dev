-- Remove the blanket "deny all SELECT" policy
DROP POLICY IF EXISTS "no_direct_profile_select" ON public.user_profiles;

-- Allow authenticated users to read their own profile row
CREATE POLICY "users_select_own_profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);