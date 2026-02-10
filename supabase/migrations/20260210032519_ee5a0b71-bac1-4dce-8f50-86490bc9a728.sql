
-- Fix RLS policies: is_org_member expects (_user_id, _organization_id) but we passed them in wrong order
DROP POLICY IF EXISTS "Users can view own org usage preferences" ON public.usage_preferences;
DROP POLICY IF EXISTS "Users can insert own org usage preferences" ON public.usage_preferences;
DROP POLICY IF EXISTS "Users can update own org usage preferences" ON public.usage_preferences;
DROP POLICY IF EXISTS "Users can view own org daily usage" ON public.daily_usage;
DROP POLICY IF EXISTS "Users can insert own org daily usage" ON public.daily_usage;
DROP POLICY IF EXISTS "Users can update own org daily usage" ON public.daily_usage;
DROP POLICY IF EXISTS "Users can view own org monthly charges" ON public.monthly_usage_charges;

CREATE POLICY "Users can view own org usage preferences"
ON public.usage_preferences FOR SELECT
USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert own org usage preferences"
ON public.usage_preferences FOR INSERT
WITH CHECK (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update own org usage preferences"
ON public.usage_preferences FOR UPDATE
USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can view own org daily usage"
ON public.daily_usage FOR SELECT
USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert own org daily usage"
ON public.daily_usage FOR INSERT
WITH CHECK (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update own org daily usage"
ON public.daily_usage FOR UPDATE
USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can view own org monthly charges"
ON public.monthly_usage_charges FOR SELECT
USING (public.is_org_member(auth.uid(), organization_id));
