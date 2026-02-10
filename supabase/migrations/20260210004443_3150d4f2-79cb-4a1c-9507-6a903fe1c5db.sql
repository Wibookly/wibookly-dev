
-- White-label branding configuration per user
CREATE TABLE public.white_label_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  subdomain_slug text UNIQUE,
  brand_name text NOT NULL DEFAULT 'Wibookly',
  logo_url text,
  is_enabled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;

-- Super admins can fully manage
CREATE POLICY "Super admins can view all white label configs"
ON public.white_label_configs FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can create white label configs"
ON public.white_label_configs FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update white label configs"
ON public.white_label_configs FOR UPDATE TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete white label configs"
ON public.white_label_configs FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Users can read their own config (for branding display)
CREATE POLICY "Users can view own white label config"
ON public.white_label_configs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Public read by subdomain slug (for unauthenticated auth page)
-- Using a security definer function to allow public lookup
CREATE OR REPLACE FUNCTION public.get_white_label_by_subdomain(_slug text)
RETURNS TABLE(brand_name text, logo_url text, is_enabled boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wl.brand_name, wl.logo_url, wl.is_enabled
  FROM public.white_label_configs wl
  WHERE wl.subdomain_slug = _slug
    AND wl.is_enabled = true
  LIMIT 1;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_white_label_configs_updated_at
BEFORE UPDATE ON public.white_label_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
