-- =============================================================================
-- Wibookly - Full PostgreSQL Schema Export (Schema Only, No Data)
-- Exported from Supabase/Lovable Cloud
-- Date: 2026-02-11
-- Equivalent to: pg_dump --schema-only --no-owner --no-privileges
-- =============================================================================

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
-- Note: The following are Supabase-specific extensions. Include only if your
-- Aurora setup supports them, otherwise remove:
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";
-- CREATE EXTENSION IF NOT EXISTS "pg_graphql";
-- CREATE EXTENSION IF NOT EXISTS "pg_net";
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
-- CREATE EXTENSION IF NOT EXISTS "supabase_vault";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'super_admin');

-- =============================================================================
-- TABLES
-- =============================================================================

-- organizations
CREATE TABLE public.organizations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- user_profiles
CREATE TABLE public.user_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    is_suspended boolean NOT NULL DEFAULT false,
    email text NOT NULL,
    full_name text,
    title text,
    email_signature text,
    phone text,
    mobile text,
    website text,
    signature_logo_url text,
    signature_font text DEFAULT 'Arial'::text,
    signature_color text DEFAULT '#333333'::text,
    suspended_reason text,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- organization_members
CREATE TABLE public.organization_members (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    role text NOT NULL DEFAULT 'member'::text,
    CONSTRAINT organization_members_pkey PRIMARY KEY (id),
    CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id),
    CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- user_roles
CREATE TABLE public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    role public.app_role NOT NULL DEFAULT 'member'::public.app_role,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_roles_pkey PRIMARY KEY (id),
    CONSTRAINT user_roles_user_id_organization_id_role_key UNIQUE (user_id, organization_id, role),
    CONSTRAINT user_roles_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- provider_connections
CREATE TABLE public.provider_connections (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_connected boolean NOT NULL DEFAULT false,
    connected_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    calendar_connected boolean NOT NULL DEFAULT false,
    calendar_connected_at timestamp with time zone,
    connected_email text,
    provider text NOT NULL,
    CONSTRAINT provider_connections_pkey PRIMARY KEY (id),
    CONSTRAINT provider_connections_organization_id_user_id_provider_key UNIQUE (organization_id, user_id, provider),
    CONSTRAINT provider_connections_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- categories
CREATE TABLE public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    is_enabled boolean NOT NULL DEFAULT true,
    ai_draft_enabled boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    auto_reply_enabled boolean NOT NULL DEFAULT false,
    last_synced_at timestamp with time zone,
    connection_id uuid,
    name text NOT NULL,
    color text NOT NULL DEFAULT '#6366f1'::text,
    writing_style text NOT NULL DEFAULT 'professional'::text,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id),
    CONSTRAINT categories_connection_id_fkey FOREIGN KEY (connection_id)
        REFERENCES public.provider_connections(id)
);

-- rules
CREATE TABLE public.rules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    category_id uuid NOT NULL,
    is_enabled boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    is_advanced boolean NOT NULL DEFAULT false,
    last_synced_at timestamp with time zone,
    connection_id uuid,
    subject_contains text,
    body_contains text,
    condition_logic text NOT NULL DEFAULT 'and'::text,
    recipient_filter text,
    rule_type text NOT NULL,
    rule_value text NOT NULL,
    CONSTRAINT rules_pkey PRIMARY KEY (id),
    CONSTRAINT rules_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id),
    CONSTRAINT rules_category_id_fkey FOREIGN KEY (category_id)
        REFERENCES public.categories(id),
    CONSTRAINT rules_connection_id_fkey FOREIGN KEY (connection_id)
        REFERENCES public.provider_connections(id)
);

-- ai_settings
CREATE TABLE public.ai_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    connection_id uuid,
    writing_style text NOT NULL DEFAULT 'professional'::text,
    ai_draft_label_color text DEFAULT '#3B82F6'::text,
    ai_sent_label_color text DEFAULT '#F97316'::text,
    ai_calendar_event_color text DEFAULT '#9333EA'::text,
    CONSTRAINT ai_settings_pkey PRIMARY KEY (id),
    CONSTRAINT ai_settings_organization_id_key UNIQUE (organization_id),
    CONSTRAINT ai_settings_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id),
    CONSTRAINT ai_settings_connection_id_fkey FOREIGN KEY (connection_id)
        REFERENCES public.provider_connections(id)
);

-- ai_activity_logs
CREATE TABLE public.ai_activity_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid,
    category_name text NOT NULL,
    activity_type text NOT NULL,
    email_subject text,
    email_from text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    connection_id uuid,
    CONSTRAINT ai_activity_logs_pkey PRIMARY KEY (id),
    CONSTRAINT ai_activity_logs_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id),
    CONSTRAINT ai_activity_logs_category_id_fkey FOREIGN KEY (category_id)
        REFERENCES public.categories(id),
    CONSTRAINT ai_activity_logs_connection_id_fkey FOREIGN KEY (connection_id)
        REFERENCES public.provider_connections(id)
);

-- ai_chat_conversations
CREATE TABLE public.ai_chat_conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    connection_id uuid,
    title text NOT NULL DEFAULT 'New Chat'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT ai_chat_conversations_pkey PRIMARY KEY (id),
    CONSTRAINT ai_chat_conversations_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id),
    CONSTRAINT ai_chat_conversations_connection_id_fkey FOREIGN KEY (connection_id)
        REFERENCES public.provider_connections(id)
);

-- ai_chat_messages
CREATE TABLE public.ai_chat_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT ai_chat_messages_pkey PRIMARY KEY (id),
    CONSTRAINT ai_chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id)
        REFERENCES public.ai_chat_conversations(id) ON DELETE CASCADE
);

-- availability_hours
CREATE TABLE public.availability_hours (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    connection_id uuid NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL DEFAULT '09:00:00'::time without time zone,
    end_time time without time zone NOT NULL DEFAULT '17:00:00'::time without time zone,
    is_available boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT availability_hours_pkey PRIMARY KEY (id),
    CONSTRAINT availability_hours_connection_id_day_of_week_key UNIQUE (connection_id, day_of_week),
    CONSTRAINT availability_hours_connection_id_fkey FOREIGN KEY (connection_id)
        REFERENCES public.provider_connections(id),
    CONSTRAINT availability_hours_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- connect_attempts
CREATE TABLE public.connect_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    provider text NOT NULL,
    stage text NOT NULL,
    error_code text,
    error_message text,
    app_origin text,
    meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT connect_attempts_pkey PRIMARY KEY (id)
);

-- daily_usage
CREATE TABLE public.daily_usage (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    usage_date date NOT NULL DEFAULT CURRENT_DATE,
    auto_drafts_used integer NOT NULL DEFAULT 0,
    ai_messages_used integer NOT NULL DEFAULT 0,
    additional_drafts_used integer NOT NULL DEFAULT 0,
    additional_messages_used integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT daily_usage_pkey PRIMARY KEY (id),
    CONSTRAINT daily_usage_organization_id_usage_date_key UNIQUE (organization_id, usage_date),
    CONSTRAINT daily_usage_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- email_profiles
CREATE TABLE public.email_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    connection_id uuid NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    signature_enabled boolean NOT NULL DEFAULT false,
    show_profile_photo boolean DEFAULT false,
    show_company_logo boolean DEFAULT true,
    default_meeting_duration integer NOT NULL DEFAULT 30,
    phone text,
    mobile text,
    website text,
    email_signature text,
    signature_logo_url text,
    signature_font text DEFAULT 'Arial, sans-serif'::text,
    signature_color text DEFAULT '#333333'::text,
    profile_photo_url text,
    full_name text,
    title text,
    CONSTRAINT email_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT email_profiles_connection_id_key UNIQUE (connection_id),
    CONSTRAINT email_profiles_connection_id_fkey FOREIGN KEY (connection_id)
        REFERENCES public.provider_connections(id),
    CONSTRAINT email_profiles_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- jobs
CREATE TABLE public.jobs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    job_type text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    error_message text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT jobs_pkey PRIMARY KEY (id),
    CONSTRAINT jobs_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- monthly_usage_charges
CREATE TABLE public.monthly_usage_charges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    month_year text NOT NULL,
    additional_drafts_total integer NOT NULL DEFAULT 0,
    additional_messages_total integer NOT NULL DEFAULT 0,
    total_charges numeric NOT NULL DEFAULT 0.00,
    stripe_invoice_id text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT monthly_usage_charges_pkey PRIMARY KEY (id),
    CONSTRAINT monthly_usage_charges_organization_id_month_year_key UNIQUE (organization_id, month_year),
    CONSTRAINT monthly_usage_charges_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- oauth_token_vault
CREATE TABLE public.oauth_token_vault (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    provider text NOT NULL,
    encrypted_access_token text NOT NULL,
    encrypted_refresh_token text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT oauth_token_vault_pkey PRIMARY KEY (id),
    CONSTRAINT oauth_token_vault_user_id_provider_key UNIQUE (user_id, provider)
);

-- processed_emails
CREATE TABLE public.processed_emails (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid NOT NULL,
    email_id text NOT NULL,
    provider text NOT NULL,
    action_type text NOT NULL,
    draft_id text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT processed_emails_pkey PRIMARY KEY (id),
    CONSTRAINT unique_email_processing UNIQUE (user_id, email_id, category_id, action_type),
    CONSTRAINT processed_emails_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id),
    CONSTRAINT processed_emails_category_id_fkey FOREIGN KEY (category_id)
        REFERENCES public.categories(id)
);

-- subscriptions
CREATE TABLE public.subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    plan text NOT NULL DEFAULT 'starter'::text,
    status text NOT NULL DEFAULT 'active'::text,
    stripe_customer_id text,
    stripe_subscription_id text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT subscriptions_organization_id_key UNIQUE (organization_id),
    CONSTRAINT subscriptions_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- usage_preferences
CREATE TABLE public.usage_preferences (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    usage_billing_enabled boolean NOT NULL DEFAULT false,
    additional_drafts_limit integer NOT NULL DEFAULT 0,
    additional_messages_limit integer NOT NULL DEFAULT 0,
    monthly_spend_cap numeric NOT NULL DEFAULT 50.00,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT usage_preferences_pkey PRIMARY KEY (id),
    CONSTRAINT usage_preferences_organization_id_key UNIQUE (organization_id),
    CONSTRAINT usage_preferences_organization_id_fkey FOREIGN KEY (organization_id)
        REFERENCES public.organizations(id)
);

-- user_plan_overrides
CREATE TABLE public.user_plan_overrides (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    granted_by uuid NOT NULL,
    granted_plan text NOT NULL DEFAULT 'starter'::text,
    is_active boolean NOT NULL DEFAULT true,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_plan_overrides_pkey PRIMARY KEY (id)
);

-- white_label_configs
CREATE TABLE public.white_label_configs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    brand_name text NOT NULL DEFAULT 'Wibookly'::text,
    logo_url text,
    subdomain_slug text,
    is_enabled boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT white_label_configs_pkey PRIMARY KEY (id)
);

-- =============================================================================
-- INDEXES (non-primary-key)
-- =============================================================================

-- ai_activity_logs
CREATE INDEX idx_ai_activity_logs_connection_id ON public.ai_activity_logs USING btree (connection_id);
CREATE INDEX idx_ai_activity_logs_org_date ON public.ai_activity_logs USING btree (organization_id, created_at DESC);
CREATE INDEX idx_ai_activity_logs_type ON public.ai_activity_logs USING btree (activity_type);
CREATE INDEX idx_ai_activity_logs_user_date ON public.ai_activity_logs USING btree (user_id, created_at DESC);

-- ai_chat_conversations
CREATE INDEX idx_ai_chat_conversations_created_at ON public.ai_chat_conversations USING btree (created_at DESC);
CREATE INDEX idx_ai_chat_conversations_user_id ON public.ai_chat_conversations USING btree (user_id);

-- ai_chat_messages
CREATE INDEX idx_ai_chat_messages_conversation_id ON public.ai_chat_messages USING btree (conversation_id);
CREATE INDEX idx_ai_chat_messages_created_at ON public.ai_chat_messages USING btree (created_at);

-- ai_settings
CREATE INDEX idx_ai_settings_connection_id ON public.ai_settings USING btree (connection_id);

-- categories
CREATE INDEX idx_categories_connection_id ON public.categories USING btree (connection_id);

-- connect_attempts
CREATE INDEX idx_connect_attempts_org_created_at ON public.connect_attempts USING btree (organization_id, created_at DESC);
CREATE INDEX idx_connect_attempts_user_created_at ON public.connect_attempts USING btree (user_id, created_at DESC);

-- email_profiles
CREATE INDEX idx_email_profiles_connection_id ON public.email_profiles USING btree (connection_id);
CREATE INDEX idx_email_profiles_user_id ON public.email_profiles USING btree (user_id);

-- processed_emails
CREATE INDEX idx_processed_emails_created_at ON public.processed_emails USING btree (created_at DESC);
CREATE INDEX idx_processed_emails_email_id ON public.processed_emails USING btree (email_id);
CREATE INDEX idx_processed_emails_user_category ON public.processed_emails USING btree (user_id, category_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_last_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.role = 'admin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE organization_id = OLD.organization_id
        AND role = 'admin'
        AND id != OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot delete the last admin role in the organization';
    END IF;
  END IF;
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT organization_id FROM public.user_profiles WHERE user_id = _user_id LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id uuid)
RETURNS TABLE(id uuid, name text, role text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT DISTINCT 
    o.id,
    o.name,
    COALESCE(ur.role::text, om.role) as role
  FROM organizations o
  LEFT JOIN user_profiles up ON up.organization_id = o.id AND up.user_id = _user_id
  LEFT JOIN user_roles ur ON ur.organization_id = o.id AND ur.user_id = _user_id
  LEFT JOIN organization_members om ON om.organization_id = o.id AND om.user_id = _user_id
  WHERE up.user_id = _user_id 
     OR ur.user_id = _user_id 
     OR om.user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.get_white_label_by_subdomain(_slug text)
RETURNS TABLE(brand_name text, logo_url text, is_enabled boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT wl.brand_name, wl.logo_url, wl.is_enabled
  FROM public.white_label_configs wl
  WHERE wl.subdomain_slug = _slug
    AND wl.is_enabled = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _organization_id
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$function$;

-- NOTE: The following functions reference auth.uid() which is Supabase-specific.
-- For AWS Aurora, you'll need to implement an equivalent authentication mechanism.

CREATE OR REPLACE FUNCTION public.disconnect_provider(_provider text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _connection_id uuid;
BEGIN
  -- NOTE: auth.uid() is Supabase-specific. Replace with your auth mechanism.
  SELECT id INTO _connection_id
  FROM public.provider_connections
  WHERE user_id = auth.uid() AND provider = _provider
  LIMIT 1;
  
  IF _connection_id IS NULL THEN
    RETURN false;
  END IF;
  
  DELETE FROM public.availability_hours WHERE connection_id = _connection_id;
  DELETE FROM public.email_profiles WHERE connection_id = _connection_id;
  DELETE FROM public.ai_settings WHERE connection_id = _connection_id;
  DELETE FROM public.ai_activity_logs WHERE connection_id = _connection_id;
  DELETE FROM public.ai_chat_conversations WHERE connection_id = _connection_id;
  DELETE FROM public.rules WHERE connection_id = _connection_id;
  DELETE FROM public.categories WHERE connection_id = _connection_id;
  DELETE FROM public.oauth_token_vault WHERE user_id = auth.uid() AND provider = _provider;
  DELETE FROM public.provider_connections WHERE id = _connection_id;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_my_connections()
RETURNS TABLE(connected_at text, id uuid, is_connected boolean, organization_id uuid, provider text, connected_email text, calendar_connected boolean, calendar_connected_at text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pc.connected_at::text,
    pc.id,
    pc.is_connected,
    pc.organization_id,
    pc.provider,
    COALESCE(pc.connected_email, up.email) as connected_email,
    pc.calendar_connected,
    pc.calendar_connected_at::text
  FROM provider_connections pc
  LEFT JOIN user_profiles up ON pc.user_id = up.user_id
  WHERE pc.user_id = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE(id uuid, user_id uuid, organization_id uuid, email text, full_name text, title text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    up.id,
    up.user_id,
    up.organization_id,
    up.email,
    up.full_name,
    up.title,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid()
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_email_connection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_profile RECORD;
  default_cats TEXT[][] := ARRAY[
    ['Urgent', '#EF4444'],
    ['Follow Up', '#F97316'],
    ['Approvals', '#EAB308'],
    ['Events', '#22C55E'],
    ['Customers', '#06B6D4'],
    ['Vendors', '#3B82F6'],
    ['Internal', '#8B5CF6'],
    ['Projects', '#EC4899'],
    ['Finance', '#14B8A6'],
    ['FYI', '#6B7280']
  ];
  i INT;
BEGIN
  IF NEW.is_connected = true AND (OLD IS NULL OR OLD.is_connected = false) THEN
    SELECT full_name, title, phone, mobile, website, email_signature, 
           signature_logo_url, signature_font, signature_color
    INTO v_user_profile
    FROM public.user_profiles
    WHERE user_id = NEW.user_id
    LIMIT 1;
    
    INSERT INTO public.email_profiles (
      connection_id, user_id, organization_id,
      full_name, title, phone, mobile, website, email_signature,
      signature_logo_url, signature_font, signature_color
    )
    VALUES (
      NEW.id, NEW.user_id, NEW.organization_id,
      COALESCE(v_user_profile.full_name, ''),
      v_user_profile.title,
      v_user_profile.phone,
      v_user_profile.mobile,
      v_user_profile.website,
      v_user_profile.email_signature,
      v_user_profile.signature_logo_url,
      COALESCE(v_user_profile.signature_font, 'Arial, sans-serif'),
      COALESCE(v_user_profile.signature_color, '#333333')
    )
    ON CONFLICT (connection_id) DO NOTHING;
    
    IF NOT EXISTS (
      SELECT 1 FROM public.categories 
      WHERE connection_id = NEW.id
    ) THEN
      FOR i IN 1..array_length(default_cats, 1) LOOP
        INSERT INTO public.categories (
          organization_id, connection_id, name, color, sort_order, is_enabled
        )
        VALUES (
          NEW.organization_id, NEW.id, default_cats[i][1], default_cats[i][2], i - 1, true
        );
      END LOOP;
    END IF;
    
    INSERT INTO public.ai_settings (
      organization_id, connection_id, writing_style
    )
    VALUES (
      NEW.organization_id, NEW.id, 'professional'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_connections_updated_at
    BEFORE UPDATE ON public.provider_connections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_connection_established
    AFTER INSERT OR UPDATE ON public.provider_connections
    FOR EACH ROW EXECUTE FUNCTION public.initialize_email_connection();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rules_updated_at
    BEFORE UPDATE ON public.rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at
    BEFORE UPDATE ON public.ai_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_chat_conversations_updated_at
    BEFORE UPDATE ON public.ai_chat_conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_hours_updated_at
    BEFORE UPDATE ON public.availability_hours
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_profiles_updated_at
    BEFORE UPDATE ON public.email_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_preferences_updated_at
    BEFORE UPDATE ON public.usage_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_plan_overrides_updated_at
    BEFORE UPDATE ON public.user_plan_overrides
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_white_label_configs_updated_at
    BEFORE UPDATE ON public.white_label_configs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_usage_charges_updated_at
    BEFORE UPDATE ON public.monthly_usage_charges
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER prevent_last_admin_deletion
    BEFORE DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.check_last_admin_role();

-- =============================================================================
-- NOTES FOR AWS AURORA MIGRATION
-- =============================================================================
-- 1. Functions referencing auth.uid() are Supabase-specific. You'll need to
--    implement an equivalent authentication context (e.g., via session variables
--    like SET app.current_user_id or pass user_id as function parameters).
--
-- 2. RLS (Row Level Security) policies are NOT included in this export as they
--    reference Supabase auth functions. You'll need to re-implement access
--    control at the application/API layer (e.g., API Gateway + Lambda).
--
-- 3. The pgcrypto and uuid-ossp extensions are available on Aurora PostgreSQL.
--    Other Supabase-specific extensions (pg_net, pg_graphql, supabase_vault,
--    pg_cron) are NOT available on Aurora and must be replaced with AWS
--    equivalents (e.g., EventBridge for pg_cron, AWS Secrets Manager for vault).
--
-- 4. Storage bucket "signature-logos" is managed by Supabase Storage.
--    Migrate to S3 with appropriate IAM policies.
-- =============================================================================
