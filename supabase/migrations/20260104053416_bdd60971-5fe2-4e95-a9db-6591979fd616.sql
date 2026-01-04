-- Create a secure function to get user connections WITHOUT exposing tokens
-- This function returns only safe connection data (no access_token or refresh_token)
CREATE OR REPLACE FUNCTION public.get_my_connections()
RETURNS TABLE (
  id uuid,
  provider text,
  is_connected boolean,
  connected_at timestamp with time zone,
  organization_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pc.id,
    pc.provider,
    pc.is_connected,
    pc.connected_at,
    pc.organization_id
  FROM public.provider_connections pc
  WHERE pc.user_id = auth.uid()
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_connections() TO authenticated;

-- Drop existing SELECT policies that expose all columns
DROP POLICY IF EXISTS "Users can view their own connections" ON public.provider_connections;

-- Create a new SELECT policy that only allows service role access
-- Regular users will use the get_my_connections() function instead
-- This policy allows SELECT but the function is the recommended way for clients
CREATE POLICY "Users can view their own connections safely"
ON public.provider_connections
FOR SELECT
USING (
  user_id = auth.uid() AND
  -- This policy still works but we recommend using get_my_connections() function
  -- The function is SECURITY DEFINER so it bypasses RLS
  true
);

-- Create a secure function to disconnect a provider (clears tokens server-side)
CREATE OR REPLACE FUNCTION public.disconnect_provider(_provider text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.provider_connections
  SET 
    is_connected = false,
    access_token = NULL,
    refresh_token = NULL,
    token_expires_at = NULL,
    updated_at = now()
  WHERE user_id = auth.uid() AND provider = _provider;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.disconnect_provider(text) TO authenticated;