CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'member'
);


--
-- Name: check_last_admin_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_last_admin_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Check if this is the last admin role in the organization
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
$$;


--
-- Name: disconnect_provider(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.disconnect_provider(_provider text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _connection_id uuid;
BEGIN
  -- Get the connection ID for this provider
  SELECT id INTO _connection_id
  FROM public.provider_connections
  WHERE user_id = auth.uid() AND provider = _provider
  LIMIT 1;
  
  IF _connection_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Delete availability hours for this connection
  DELETE FROM public.availability_hours
  WHERE connection_id = _connection_id;
  
  -- Delete email profiles for this connection
  DELETE FROM public.email_profiles
  WHERE connection_id = _connection_id;
  
  -- Delete AI settings for this connection
  DELETE FROM public.ai_settings
  WHERE connection_id = _connection_id;
  
  -- Delete AI activity logs for this connection
  DELETE FROM public.ai_activity_logs
  WHERE connection_id = _connection_id;
  
  -- Delete AI chat conversations for this connection (messages cascade)
  DELETE FROM public.ai_chat_conversations
  WHERE connection_id = _connection_id;
  
  -- Delete rules for this connection
  DELETE FROM public.rules
  WHERE connection_id = _connection_id;
  
  -- Delete categories for this connection
  DELETE FROM public.categories
  WHERE connection_id = _connection_id;
  
  -- Delete processed emails (need to handle by user_id since no connection_id column)
  -- These are tied to the user, so we keep them for audit purposes
  
  -- Delete tokens from vault
  DELETE FROM public.oauth_token_vault
  WHERE user_id = auth.uid() AND provider = _provider;
  
  -- Delete the connection record itself
  DELETE FROM public.provider_connections
  WHERE id = _connection_id;
  
  RETURN true;
END;
$$;


--
-- Name: get_my_connections(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_connections() RETURNS TABLE(connected_at text, id uuid, is_connected boolean, organization_id uuid, provider text, connected_email text, calendar_connected boolean, calendar_connected_at text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: get_my_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_profile() RETURNS TABLE(id uuid, user_id uuid, organization_id uuid, email text, full_name text, title text, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: get_user_organization_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_organization_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT organization_id FROM public.user_profiles WHERE user_id = _user_id LIMIT 1
$$;


--
-- Name: get_user_organizations(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_organizations(_user_id uuid) RETURNS TABLE(id uuid, name text, role text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: initialize_email_connection(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.initialize_email_connection() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
  -- Only run when connection becomes active
  IF NEW.is_connected = true AND (OLD IS NULL OR OLD.is_connected = false) THEN
    -- Get user profile data
    SELECT full_name, title, phone, mobile, website, email_signature, 
           signature_logo_url, signature_font, signature_color
    INTO v_user_profile
    FROM public.user_profiles
    WHERE user_id = NEW.user_id
    LIMIT 1;
    
    -- Create email profile if it doesn't exist
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
    
    -- Create default categories if none exist for this connection
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
    
    -- Create default AI settings if none exist for this connection
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
$$;


--
-- Name: is_org_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_org_member(_user_id uuid, _organization_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _organization_id
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ai_activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid,
    category_name text NOT NULL,
    activity_type text NOT NULL,
    email_subject text,
    email_from text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    connection_id uuid,
    CONSTRAINT ai_activity_logs_activity_type_check CHECK ((activity_type = ANY (ARRAY['draft'::text, 'auto_reply'::text])))
);


--
-- Name: ai_chat_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_chat_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    connection_id uuid,
    title text DEFAULT 'New Chat'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text])))
);


--
-- Name: ai_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    writing_style text DEFAULT 'professional'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    ai_draft_label_color text DEFAULT '#3B82F6'::text,
    ai_sent_label_color text DEFAULT '#F97316'::text,
    connection_id uuid,
    ai_calendar_event_color text DEFAULT '#9333EA'::text
);


--
-- Name: availability_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    connection_id uuid NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone DEFAULT '09:00:00'::time without time zone NOT NULL,
    end_time time without time zone DEFAULT '17:00:00'::time without time zone NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT availability_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6366f1'::text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    ai_draft_enabled boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    auto_reply_enabled boolean DEFAULT false NOT NULL,
    writing_style text DEFAULT 'professional'::text NOT NULL,
    last_synced_at timestamp with time zone,
    connection_id uuid
);


--
-- Name: connect_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connect_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    provider text NOT NULL,
    stage text NOT NULL,
    error_code text,
    error_message text,
    app_origin text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: email_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    connection_id uuid NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    full_name text,
    title text,
    phone text,
    mobile text,
    website text,
    email_signature text,
    signature_logo_url text,
    signature_font text DEFAULT 'Arial, sans-serif'::text,
    signature_color text DEFAULT '#333333'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    signature_enabled boolean DEFAULT false NOT NULL,
    profile_photo_url text,
    show_profile_photo boolean DEFAULT false,
    show_company_logo boolean DEFAULT true,
    default_meeting_duration integer DEFAULT 30 NOT NULL
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    job_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: oauth_token_vault; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_token_vault (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider text NOT NULL,
    encrypted_access_token text NOT NULL,
    encrypted_refresh_token text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT oauth_token_vault_provider_check CHECK ((provider = ANY (ARRAY['google'::text, 'outlook'::text])))
);


--
-- Name: organization_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT organization_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])))
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: processed_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.processed_emails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    email_id text NOT NULL,
    category_id uuid NOT NULL,
    provider text NOT NULL,
    action_type text NOT NULL,
    draft_id text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.processed_emails FORCE ROW LEVEL SECURITY;


--
-- Name: provider_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    provider text NOT NULL,
    is_connected boolean DEFAULT false NOT NULL,
    connected_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    connected_email text,
    calendar_connected boolean DEFAULT false NOT NULL,
    calendar_connected_at timestamp with time zone
);


--
-- Name: rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    category_id uuid NOT NULL,
    rule_type text NOT NULL,
    rule_value text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_advanced boolean DEFAULT false NOT NULL,
    subject_contains text,
    body_contains text,
    last_synced_at timestamp with time zone,
    condition_logic text DEFAULT 'and'::text NOT NULL,
    recipient_filter text,
    connection_id uuid
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    plan text DEFAULT 'starter'::text NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    status text DEFAULT 'active'::text NOT NULL,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscriptions_plan_check CHECK ((plan = ANY (ARRAY['starter'::text, 'professional'::text, 'enterprise'::text]))),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'canceled'::text, 'past_due'::text, 'trialing'::text])))
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    title text,
    email_signature text,
    phone text,
    mobile text,
    website text,
    signature_logo_url text,
    signature_font text DEFAULT 'Arial'::text,
    signature_color text DEFAULT '#333333'::text
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    role public.app_role DEFAULT 'member'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_activity_logs ai_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_activity_logs
    ADD CONSTRAINT ai_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_chat_conversations ai_chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_conversations
    ADD CONSTRAINT ai_chat_conversations_pkey PRIMARY KEY (id);


--
-- Name: ai_chat_messages ai_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_messages
    ADD CONSTRAINT ai_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: ai_settings ai_settings_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_organization_id_key UNIQUE (organization_id);


--
-- Name: ai_settings ai_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_pkey PRIMARY KEY (id);


--
-- Name: availability_hours availability_hours_connection_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_hours
    ADD CONSTRAINT availability_hours_connection_id_day_of_week_key UNIQUE (connection_id, day_of_week);


--
-- Name: availability_hours availability_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_hours
    ADD CONSTRAINT availability_hours_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: connect_attempts connect_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connect_attempts
    ADD CONSTRAINT connect_attempts_pkey PRIMARY KEY (id);


--
-- Name: email_profiles email_profiles_connection_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_profiles
    ADD CONSTRAINT email_profiles_connection_id_key UNIQUE (connection_id);


--
-- Name: email_profiles email_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_profiles
    ADD CONSTRAINT email_profiles_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: oauth_token_vault oauth_token_vault_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_token_vault
    ADD CONSTRAINT oauth_token_vault_pkey PRIMARY KEY (id);


--
-- Name: oauth_token_vault oauth_token_vault_user_id_provider_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_token_vault
    ADD CONSTRAINT oauth_token_vault_user_id_provider_key UNIQUE (user_id, provider);


--
-- Name: organization_members organization_members_organization_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id);


--
-- Name: organization_members organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: processed_emails processed_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processed_emails
    ADD CONSTRAINT processed_emails_pkey PRIMARY KEY (id);


--
-- Name: provider_connections provider_connections_organization_id_user_id_provider_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_connections
    ADD CONSTRAINT provider_connections_organization_id_user_id_provider_key UNIQUE (organization_id, user_id, provider);


--
-- Name: provider_connections provider_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_connections
    ADD CONSTRAINT provider_connections_pkey PRIMARY KEY (id);


--
-- Name: provider_connections provider_connections_user_provider_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_connections
    ADD CONSTRAINT provider_connections_user_provider_unique UNIQUE (user_id, provider);


--
-- Name: rules rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_organization_id_key UNIQUE (organization_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: processed_emails unique_email_processing; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processed_emails
    ADD CONSTRAINT unique_email_processing UNIQUE (user_id, email_id, category_id, action_type);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_organization_id_key UNIQUE (user_id, organization_id);


--
-- Name: idx_ai_activity_logs_connection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_activity_logs_connection_id ON public.ai_activity_logs USING btree (connection_id);


--
-- Name: idx_ai_activity_logs_org_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_activity_logs_org_date ON public.ai_activity_logs USING btree (organization_id, created_at DESC);


--
-- Name: idx_ai_activity_logs_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_activity_logs_type ON public.ai_activity_logs USING btree (activity_type);


--
-- Name: idx_ai_activity_logs_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_activity_logs_user_date ON public.ai_activity_logs USING btree (user_id, created_at DESC);


--
-- Name: idx_ai_chat_conversations_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_chat_conversations_created_at ON public.ai_chat_conversations USING btree (created_at DESC);


--
-- Name: idx_ai_chat_conversations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_chat_conversations_user_id ON public.ai_chat_conversations USING btree (user_id);


--
-- Name: idx_ai_chat_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_chat_messages_conversation_id ON public.ai_chat_messages USING btree (conversation_id);


--
-- Name: idx_ai_chat_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_chat_messages_created_at ON public.ai_chat_messages USING btree (created_at);


--
-- Name: idx_ai_settings_connection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_settings_connection_id ON public.ai_settings USING btree (connection_id);


--
-- Name: idx_categories_connection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_connection_id ON public.categories USING btree (connection_id);


--
-- Name: idx_connect_attempts_org_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connect_attempts_org_created_at ON public.connect_attempts USING btree (organization_id, created_at DESC);


--
-- Name: idx_connect_attempts_user_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connect_attempts_user_created_at ON public.connect_attempts USING btree (user_id, created_at DESC);


--
-- Name: idx_email_profiles_connection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_profiles_connection_id ON public.email_profiles USING btree (connection_id);


--
-- Name: idx_email_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_profiles_user_id ON public.email_profiles USING btree (user_id);


--
-- Name: idx_processed_emails_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_processed_emails_created_at ON public.processed_emails USING btree (created_at DESC);


--
-- Name: idx_processed_emails_email_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_processed_emails_email_id ON public.processed_emails USING btree (email_id);


--
-- Name: idx_processed_emails_user_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_processed_emails_user_category ON public.processed_emails USING btree (user_id, category_id);


--
-- Name: idx_rules_connection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rules_connection_id ON public.rules USING btree (connection_id);


--
-- Name: provider_connections on_connection_established; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_connection_established AFTER INSERT OR UPDATE ON public.provider_connections FOR EACH ROW EXECUTE FUNCTION public.initialize_email_connection();


--
-- Name: user_roles prevent_last_admin_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER prevent_last_admin_deletion BEFORE DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.check_last_admin_role();


--
-- Name: ai_chat_conversations update_ai_chat_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_chat_conversations_updated_at BEFORE UPDATE ON public.ai_chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_settings update_ai_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: availability_hours update_availability_hours_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_availability_hours_updated_at BEFORE UPDATE ON public.availability_hours FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: email_profiles update_email_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_profiles_updated_at BEFORE UPDATE ON public.email_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: organizations update_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: provider_connections update_provider_connections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_provider_connections_updated_at BEFORE UPDATE ON public.provider_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: rules update_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON public.rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_profiles update_user_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_activity_logs ai_activity_logs_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_activity_logs
    ADD CONSTRAINT ai_activity_logs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: ai_activity_logs ai_activity_logs_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_activity_logs
    ADD CONSTRAINT ai_activity_logs_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.provider_connections(id) ON DELETE SET NULL;


--
-- Name: ai_activity_logs ai_activity_logs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_activity_logs
    ADD CONSTRAINT ai_activity_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: ai_chat_conversations ai_chat_conversations_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_conversations
    ADD CONSTRAINT ai_chat_conversations_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.provider_connections(id) ON DELETE SET NULL;


--
-- Name: ai_chat_conversations ai_chat_conversations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_conversations
    ADD CONSTRAINT ai_chat_conversations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: ai_chat_messages ai_chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_messages
    ADD CONSTRAINT ai_chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_chat_conversations(id) ON DELETE CASCADE;


--
-- Name: ai_settings ai_settings_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.provider_connections(id) ON DELETE CASCADE;


--
-- Name: ai_settings ai_settings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: availability_hours availability_hours_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_hours
    ADD CONSTRAINT availability_hours_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.provider_connections(id) ON DELETE CASCADE;


--
-- Name: availability_hours availability_hours_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_hours
    ADD CONSTRAINT availability_hours_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: categories categories_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.provider_connections(id) ON DELETE CASCADE;


--
-- Name: categories categories_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: email_profiles email_profiles_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_profiles
    ADD CONSTRAINT email_profiles_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.provider_connections(id) ON DELETE CASCADE;


--
-- Name: email_profiles email_profiles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_profiles
    ADD CONSTRAINT email_profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: email_profiles email_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_profiles
    ADD CONSTRAINT email_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: oauth_token_vault oauth_token_vault_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_token_vault
    ADD CONSTRAINT oauth_token_vault_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: organization_members organization_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_members organization_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: processed_emails processed_emails_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processed_emails
    ADD CONSTRAINT processed_emails_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: processed_emails processed_emails_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.processed_emails
    ADD CONSTRAINT processed_emails_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: provider_connections provider_connections_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_connections
    ADD CONSTRAINT provider_connections_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: rules rules_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: rules rules_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.provider_connections(id) ON DELETE CASCADE;


--
-- Name: rules rules_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organizations Allow insert during signup only once; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert during signup only once" ON public.organizations FOR INSERT TO authenticated WITH CHECK ((NOT (EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE (user_profiles.user_id = auth.uid())))));


--
-- Name: ai_activity_logs No client insert for AI activity logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No client insert for AI activity logs" ON public.ai_activity_logs FOR INSERT WITH CHECK (false);


--
-- Name: subscriptions No direct client updates for subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "No direct client updates for subscriptions" ON public.subscriptions FOR UPDATE USING (false);


--
-- Name: user_roles Only admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (((organization_id = public.get_user_organization_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: jobs Only admins can update jobs in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update jobs in their organization" ON public.jobs FOR UPDATE TO authenticated USING (((organization_id = public.get_user_organization_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Only admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (((organization_id = public.get_user_organization_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: organizations Only admins can update their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update their organization" ON public.organizations FOR UPDATE TO authenticated USING (((id = public.get_user_organization_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: jobs Users can create jobs in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create jobs in their organization" ON public.jobs FOR INSERT WITH CHECK (((organization_id = public.get_user_organization_id(auth.uid())) AND (user_id = auth.uid())));


--
-- Name: ai_chat_messages Users can create messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create messages in their conversations" ON public.ai_chat_messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.ai_chat_conversations
  WHERE ((ai_chat_conversations.id = ai_chat_messages.conversation_id) AND (ai_chat_conversations.user_id = auth.uid())))));


--
-- Name: subscriptions Users can create subscription for their org; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create subscription for their org" ON public.subscriptions FOR INSERT WITH CHECK (((organization_id = public.get_user_organization_id(auth.uid())) AND (user_id = auth.uid())));


--
-- Name: ai_chat_conversations Users can create their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own conversations" ON public.ai_chat_conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_chat_messages Users can delete messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete messages in their conversations" ON public.ai_chat_messages FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.ai_chat_conversations
  WHERE ((ai_chat_conversations.id = ai_chat_messages.conversation_id) AND (ai_chat_conversations.user_id = auth.uid())))));


--
-- Name: availability_hours Users can delete their own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own availability" ON public.availability_hours FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ai_chat_conversations Users can delete their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own conversations" ON public.ai_chat_conversations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: email_profiles Users can delete their own email profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own email profiles" ON public.email_profiles FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: jobs Users can delete their own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own jobs" ON public.jobs FOR DELETE TO authenticated USING (((organization_id = public.get_user_organization_id(auth.uid())) AND (user_id = auth.uid())));


--
-- Name: processed_emails Users can delete their own processed emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own processed emails" ON public.processed_emails FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: availability_hours Users can insert their own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own availability" ON public.availability_hours FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: connect_attempts Users can insert their own connect attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own connect attempts" ON public.connect_attempts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: email_profiles Users can insert their own email profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own email profiles" ON public.email_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: processed_emails Users can insert their own processed emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own processed emails" ON public.processed_emails FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_roles Users can insert their role with restrictions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their role with restrictions" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (((role = 'admin'::public.app_role) AND (NOT (EXISTS ( SELECT 1
   FROM public.user_roles ur
  WHERE (ur.organization_id = user_roles.organization_id))))) OR (role = 'member'::public.app_role))));


--
-- Name: ai_settings Users can manage AI settings in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage AI settings in their organization" ON public.ai_settings USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: categories Users can manage categories in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage categories in their organization" ON public.categories USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: rules Users can manage rules in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage rules in their organization" ON public.rules USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: provider_connections Users can manage their own connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own connections" ON public.provider_connections USING ((user_id = auth.uid()));


--
-- Name: availability_hours Users can update their own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own availability" ON public.availability_hours FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ai_chat_conversations Users can update their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own conversations" ON public.ai_chat_conversations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: email_profiles Users can update their own email profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own email profiles" ON public.email_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: processed_emails Users can update their own processed emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own processed emails" ON public.processed_emails FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ai_activity_logs Users can view AI activity in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view AI activity in their organization" ON public.ai_activity_logs FOR SELECT USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: ai_settings Users can view AI settings in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view AI settings in their organization" ON public.ai_settings FOR SELECT USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: categories Users can view categories in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view categories in their organization" ON public.categories FOR SELECT USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: ai_chat_messages Users can view messages in their conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages in their conversations" ON public.ai_chat_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.ai_chat_conversations
  WHERE ((ai_chat_conversations.id = ai_chat_messages.conversation_id) AND (ai_chat_conversations.user_id = auth.uid())))));


--
-- Name: user_roles Users can view roles in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view roles in their organization" ON public.user_roles FOR SELECT USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: rules Users can view rules in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view rules in their organization" ON public.rules FOR SELECT USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: subscriptions Users can view their organization subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their organization subscription" ON public.subscriptions FOR SELECT USING ((organization_id = public.get_user_organization_id(auth.uid())));


--
-- Name: availability_hours Users can view their own availability; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own availability" ON public.availability_hours FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: connect_attempts Users can view their own connect attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own connect attempts" ON public.connect_attempts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: provider_connections Users can view their own connections safely; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own connections safely" ON public.provider_connections FOR SELECT USING (((user_id = auth.uid()) AND true));


--
-- Name: ai_chat_conversations Users can view their own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own conversations" ON public.ai_chat_conversations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: email_profiles Users can view their own email profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own email profiles" ON public.email_profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: jobs Users can view their own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own jobs" ON public.jobs FOR SELECT TO authenticated USING (((organization_id = public.get_user_organization_id(auth.uid())) AND (user_id = auth.uid())));


--
-- Name: organizations Users can view their own organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own organization" ON public.organizations FOR SELECT USING ((id = public.get_user_organization_id(auth.uid())));


--
-- Name: processed_emails Users can view their own processed emails; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own processed emails" ON public.processed_emails FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: organization_members admins_can_delete_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_can_delete_members ON public.organization_members FOR DELETE USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND public.is_org_member(auth.uid(), organization_id)));


--
-- Name: organization_members admins_can_update_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_can_update_members ON public.organization_members FOR UPDATE USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND public.is_org_member(auth.uid(), organization_id)));


--
-- Name: ai_activity_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_chat_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: availability_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.availability_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: connect_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connect_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: email_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: organization_members members_insert_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY members_insert_self ON public.organization_members FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: organization_members members_read_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY members_read_own ON public.organization_members FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: oauth_token_vault no_client_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY no_client_delete ON public.oauth_token_vault FOR DELETE USING (false);


--
-- Name: oauth_token_vault no_client_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY no_client_insert ON public.oauth_token_vault FOR INSERT WITH CHECK (false);


--
-- Name: oauth_token_vault no_client_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY no_client_select ON public.oauth_token_vault FOR SELECT USING (false);


--
-- Name: oauth_token_vault no_client_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY no_client_update ON public.oauth_token_vault FOR UPDATE USING (false);


--
-- Name: user_profiles no_direct_profile_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY no_direct_profile_select ON public.user_profiles FOR SELECT USING (false);


--
-- Name: oauth_token_vault; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.oauth_token_vault ENABLE ROW LEVEL SECURITY;

--
-- Name: organization_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: processed_emails; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.processed_emails ENABLE ROW LEVEL SECURITY;

--
-- Name: provider_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.provider_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles users_insert_own_profile_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_insert_own_profile_only ON public.user_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_profiles users_update_own_profile_only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_update_own_profile_only ON public.user_profiles FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- PostgreSQL database dump complete
--




COMMIT;