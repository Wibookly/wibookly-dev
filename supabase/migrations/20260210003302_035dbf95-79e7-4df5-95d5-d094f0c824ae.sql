
-- Create user_plan_overrides table
CREATE TABLE public.user_plan_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  granted_plan text NOT NULL DEFAULT 'starter',
  granted_by uuid NOT NULL,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_plan_overrides ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- RLS: Only super_admins can manage overrides
CREATE POLICY "Super admins can view all overrides"
ON public.user_plan_overrides FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can create overrides"
ON public.user_plan_overrides FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update overrides"
ON public.user_plan_overrides FOR UPDATE TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete overrides"
ON public.user_plan_overrides FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Users can read their own override
CREATE POLICY "Users can view their own override"
ON public.user_plan_overrides FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Super admins can view all user profiles for admin dashboard
CREATE POLICY "Super admins can view all profiles"
ON public.user_profiles FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Super admins can view all subscriptions
CREATE POLICY "Super admins can view all subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_plan_overrides_updated_at
BEFORE UPDATE ON public.user_plan_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
