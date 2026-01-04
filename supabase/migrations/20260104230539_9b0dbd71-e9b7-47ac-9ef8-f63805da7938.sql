-- Drop and recreate the get_my_connections function with connected_email
DROP FUNCTION IF EXISTS public.get_my_connections();

CREATE FUNCTION public.get_my_connections()
RETURNS TABLE (
  connected_at text,
  id uuid,
  is_connected boolean,
  organization_id uuid,
  provider text,
  connected_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.connected_at::text,
    pc.id,
    pc.is_connected,
    pc.organization_id,
    pc.provider,
    pc.connected_email
  FROM provider_connections pc
  WHERE pc.user_id = auth.uid();
END;
$$;