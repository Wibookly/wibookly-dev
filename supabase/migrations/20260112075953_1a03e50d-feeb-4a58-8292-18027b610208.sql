-- Create subscriptions table to track user plans
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their organization's subscription
CREATE POLICY "Users can view their organization subscription"
ON public.subscriptions
FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

-- Only allow updates through edge functions (no direct client updates for security)
CREATE POLICY "No direct client updates for subscriptions"
ON public.subscriptions
FOR UPDATE
USING (false);

-- Allow insert during signup
CREATE POLICY "Users can create subscription for their org"
ON public.subscriptions
FOR INSERT
WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND user_id = auth.uid());

-- Create trigger to update updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create default starter subscription for existing organizations
INSERT INTO public.subscriptions (organization_id, user_id, plan, status)
SELECT o.id, om.user_id, 'starter', 'active'
FROM public.organizations o
JOIN public.organization_members om ON o.id = om.organization_id
WHERE om.role = 'admin'
ON CONFLICT (organization_id) DO NOTHING;