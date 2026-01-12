-- Drop and recreate disconnect_provider function to properly clean up all related data
CREATE OR REPLACE FUNCTION public.disconnect_provider(_provider text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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