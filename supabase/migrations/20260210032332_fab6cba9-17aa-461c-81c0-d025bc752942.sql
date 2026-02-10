
-- Usage preferences and tracking for metered billing
CREATE TABLE public.usage_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  usage_billing_enabled BOOLEAN NOT NULL DEFAULT false,
  additional_drafts_limit INTEGER NOT NULL DEFAULT 0,
  additional_messages_limit INTEGER NOT NULL DEFAULT 0,
  monthly_spend_cap NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Daily usage counters
CREATE TABLE public.daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  auto_drafts_used INTEGER NOT NULL DEFAULT 0,
  ai_messages_used INTEGER NOT NULL DEFAULT 0,
  additional_drafts_used INTEGER NOT NULL DEFAULT 0,
  additional_messages_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, usage_date)
);

-- Monthly overage tracking
CREATE TABLE public.monthly_usage_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  month_year TEXT NOT NULL, -- e.g. '2026-02'
  additional_drafts_total INTEGER NOT NULL DEFAULT 0,
  additional_messages_total INTEGER NOT NULL DEFAULT 0,
  total_charges NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  stripe_invoice_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, month_year)
);

-- Enable RLS
ALTER TABLE public.usage_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_usage_charges ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage_preferences
CREATE POLICY "Users can view own org usage preferences"
ON public.usage_preferences FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Users can insert own org usage preferences"
ON public.usage_preferences FOR INSERT
WITH CHECK (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Users can update own org usage preferences"
ON public.usage_preferences FOR UPDATE
USING (public.is_org_member(organization_id, auth.uid()));

-- RLS policies for daily_usage
CREATE POLICY "Users can view own org daily usage"
ON public.daily_usage FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Users can insert own org daily usage"
ON public.daily_usage FOR INSERT
WITH CHECK (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Users can update own org daily usage"
ON public.daily_usage FOR UPDATE
USING (public.is_org_member(organization_id, auth.uid()));

-- RLS policies for monthly_usage_charges
CREATE POLICY "Users can view own org monthly charges"
ON public.monthly_usage_charges FOR SELECT
USING (public.is_org_member(organization_id, auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_usage_preferences_updated_at
BEFORE UPDATE ON public.usage_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_usage_charges_updated_at
BEFORE UPDATE ON public.monthly_usage_charges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
